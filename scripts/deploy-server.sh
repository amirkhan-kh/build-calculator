#!/usr/bin/env bash
# =============================================================================
# deploy-server.sh — Backend'ni serverga deploy qilish (frontend Vercelda)
# Birinchi marta ham, yangilashda ham shu buyruq:  bash scripts/deploy-server.sh
#
# Rejimlar (.env dagi PROXY_MODE):
#   http     — domen yo'q: nginx hostning 8080-portida (HTTP). Brauzer API'ga Vercel
#              orqali (/backend/*) murojaat qiladi, Vercel so'rovni shu portga uzatadi
#   nginx    — domen bor, 80/443 bo'sh: o'zimizning nginx + Let's Encrypt (certbot)
#   external — domen bor, 80/443 ni boshqa proxy (masalan, Caddy) egallagan: u "edge"
#              docker tarmog'i orqali calc-api:8000 va calc-minio:9000 ga ulanadi
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"
COMPOSE=(docker compose -f "$PROJECT_DIR/docker-compose.server.yml")
EDGE_NETWORK="edge"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${BLUE}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[XATO]${RESET}  $*"; exit 1; }
step()    { echo -e "\n${BOLD}${BLUE}══════ $* ══════${RESET}"; }

gen_secret() { openssl rand -hex "${1:-32}"; }

port_busy_by_others() {
  docker ps --format '{{.Names}}' | grep -qx calc-nginx && return 1
  [[ -n "$(ss -Htln 'sport = :443' 2>/dev/null)" ]]
}

check_deps() {
  step "Kerakli dasturlarni tekshirish"
  command -v docker  &>/dev/null || error "Docker o'rnatilmagan"
  docker compose version &>/dev/null || error "Docker Compose plugin o'rnatilmagan"
  command -v openssl &>/dev/null || error "openssl topilmadi"
  success "Hammasi joyida"
}

setup_env() {
  step ".env sozlash"

  if [[ -f "$ENV_FILE" ]]; then
    success ".env allaqachon bor — o'tkazib yuborildi"
    return
  fi

  local proxy_mode le_email="" media_url
  read -rp "API domeni (domen bo'lmasa — shunchaki Enter bosing): " API_DOMAIN

  read -rp "Vercel frontend manzili (masalan: https://build-calculator.vercel.app): " FRONTEND_URL
  [[ -z "$FRONTEND_URL" ]] && error "Frontend manzili bo'sh bo'lishi mumkin emas"
  FRONTEND_URL="${FRONTEND_URL%/}"

  if [[ -z "$API_DOMAIN" ]]; then
    proxy_mode="http"
    media_url="${FRONTEND_URL}/backend/media"
    info "Domensiz rejim: API hostning 8080-portida, Vercel orqali ishlaydi"
  else
    media_url="https://${API_DOMAIN}/media"
    if port_busy_by_others; then
      proxy_mode="external"
      warn "443-port boshqa dastur (masalan, Caddy) tomonidan band — tashqi proxy rejimi"
    else
      proxy_mode="nginx"
      read -rp "Let's Encrypt uchun email: " le_email
      [[ -z "$le_email" ]] && error "Email bo'sh bo'lishi mumkin emas"
    fi
  fi

  local db_pass secret_key minio_pass
  db_pass="$(gen_secret 24)"
  secret_key="$(gen_secret 64)"
  minio_pass="$(gen_secret 20)"

  cat > "$ENV_FILE" <<EOF
# Yaratilgan: $(date '+%Y-%m-%d %H:%M:%S')

POSTGRES_USER=calculator_user
POSTGRES_PASSWORD=${db_pass}
POSTGRES_DB=calculator_db
DATABASE_URL=postgresql://calculator_user:${db_pass}@postgres:5432/calculator_db
ASYNC_DATABASE_URL=postgresql+asyncpg://calculator_user:${db_pass}@postgres:5432/calculator_db

SECRET_KEY=${secret_key}

# Platforma admin (firmalar kabineti). O'zgartirsangiz, deploy'dan keyin yangi qiymat ishlaydi
PLATFORM_ADMIN_USERNAME=admin
PLATFORM_ADMIN_PASSWORD=admin123

# Vergul bilan bir nechta domen yozish mumkin (custom domen ulasangiz shu yerga qo'shing)
ALLOWED_ORIGINS=${FRONTEND_URL}
# Vercel preview deploylari uchun (ixtiyoriy), masalan: https://build-calculator-.*\.vercel\.app
ALLOWED_ORIGIN_REGEX=

MINIO_ENDPOINT=http://minio:9000
MINIO_PUBLIC_URL=${media_url}
MINIO_ACCESS_KEY=calculator_minio
MINIO_SECRET_KEY=${minio_pass}
MINIO_BUCKET=calculator-media

# Token qo'yilsa, keyingi deploy'da bot avtomatik ishga tushadi
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=

API_DOMAIN=${API_DOMAIN}
PROXY_MODE=${proxy_mode}
HTTP_PORT=8080
LE_EMAIL=${le_email}
EOF

  chmod 600 "$ENV_FILE"
  success ".env yaratildi (parollar avtomatik generatsiya qilindi)"
}

check_dns() {
  step "DNS tekshiruvi"
  local server_ip domain_ip
  server_ip="$(curl -s4 --max-time 5 https://ifconfig.me || true)"
  domain_ip="$(getent ahostsv4 "$API_DOMAIN" | awk 'NR==1{print $1}' || true)"

  if [[ -z "$domain_ip" ]]; then
    error "${API_DOMAIN} hech qaysi IP'ga yo'naltirilmagan. DNS'da A-yozuv qo'shing: ${API_DOMAIN} → ${server_ip:-SERVER_IP}"
  fi
  if [[ -n "$server_ip" && "$server_ip" != "$domain_ip" ]]; then
    warn "${API_DOMAIN} → ${domain_ip}, lekin bu serverning IP'si ${server_ip}"
    if [[ -t 0 ]]; then
      read -rp "Baribir davom etilsinmi? (y/N): " ans
      [[ "$ans" =~ ^[Yy]$ ]] || exit 1
    fi
  else
    success "${API_DOMAIN} → ${domain_ip}"
  fi
}

setup_ssl() {
  step "SSL sertifikat (Let's Encrypt)"
  command -v certbot &>/dev/null || error "Certbot o'rnatilmagan: sudo apt install -y certbot"

  if sudo test -d "/etc/letsencrypt/live/${API_DOMAIN}"; then
    success "Sertifikat allaqachon bor"
    return
  fi

  "${COMPOSE[@]}" stop nginx 2>/dev/null || true

  # Hook'lar saqlanadi va avtomatik yangilashda ham ishlatiladi (80-port bo'shatiladi)
  sudo certbot certonly --standalone --non-interactive --agree-tos \
    --email "$LE_EMAIL" -d "$API_DOMAIN" \
    --pre-hook "docker stop calc-nginx || true" \
    --post-hook "docker start calc-nginx || true"

  success "Sertifikat olindi: ${API_DOMAIN}"
}

start_services() {
  step "Image'ni yig'ish va servislarni ishga tushirish"
  mkdir -p "$PROJECT_DIR/nginx/logs"
  cd "$PROJECT_DIR"

  local profiles=()
  [[ "$PROXY_MODE" == "nginx" ]] && profiles+=(--profile nginx)
  [[ "$PROXY_MODE" == "http" ]] && profiles+=(--profile http)
  [[ -n "${TELEGRAM_BOT_TOKEN:-}" ]] && profiles+=(--profile bot)

  "${COMPOSE[@]}" "${profiles[@]}" up -d --build --remove-orphans
  docker image prune -f >/dev/null
  success "Servislar ishga tushdi"
}

wait_for_api() {
  step "API tayyor bo'lishini kutish"
  for _ in $(seq 1 40); do
    if curl -sf http://127.0.0.1:8000/health &>/dev/null; then
      success "API ishlayapti"
      if [[ "$PROXY_MODE" == "http" ]]; then
        sleep 2
        curl -sf "http://127.0.0.1:${HTTP_PORT:-8080}/health" &>/dev/null \
          && success "nginx ${HTTP_PORT:-8080}-portda ishlayapti" \
          || warn "nginx javob bermadi: docker logs calc-nginx-http"
      fi
      return
    fi
    sleep 3
  done
  error "API 2 daqiqada javob bermadi. Loglar: docker logs calc-api --tail=100 ; docker logs calc-migrate"
}

print_caddy_hint() {
  echo -e "  ${BOLD}Tashqi proxy rejimi.${RESET} Caddy konteyneri '${EDGE_NETWORK}' tarmog'ida bo'lishi va"
  echo -e "  Caddyfile'da quyidagi blok bo'lishi kerak:"
  echo ""
  echo -e "${YELLOW}${API_DOMAIN} {
	encode zstd gzip
	request_body {
		max_size 20MB
	}
	handle_path /media/* {
		reverse_proxy calc-minio:9000 {
			header_up Host calc-minio:9000
		}
		header Cache-Control \"public, max-age=2592000\"
	}
	handle {
		reverse_proxy calc-api:8000
	}
}${RESET}"
  echo ""
}

show_status() {
  step "Holat"
  "${COMPOSE[@]}" ps
  echo ""
  [[ "$PROXY_MODE" == "external" ]] && print_caddy_hint
  echo -e "${GREEN}${BOLD}Backend tayyor!${RESET}"
  echo -e "  Firmalar kabineti: login ${CYAN}${PLATFORM_ADMIN_USERNAME:-admin}${RESET}, parol ${CYAN}${PLATFORM_ADMIN_PASSWORD:-admin123}${RESET}"

  if [[ "$PROXY_MODE" == "http" ]]; then
    local ip
    ip="$(curl -s4 --max-time 5 https://ifconfig.me || echo SERVER_IP)"
    echo -e "  API:      ${CYAN}http://${ip}:${HTTP_PORT:-8080}${RESET}"
    echo -e "  Swagger:  ${CYAN}http://${ip}:${HTTP_PORT:-8080}/docs${RESET}"
    echo ""
    echo -e "  Vercel → Settings → Environment Variables:"
    echo -e "    ${YELLOW}NEXT_PUBLIC_API_URL=/backend${RESET}"
    echo -e "    ${YELLOW}BACKEND_ORIGIN=http://${ip}:${HTTP_PORT:-8080}${RESET}"
    echo -e "    ${YELLOW}SECURE_COOKIES=true${RESET}"
  else
    echo -e "  API:      ${CYAN}https://${API_DOMAIN}${RESET}"
    echo -e "  Swagger:  ${CYAN}https://${API_DOMAIN}/docs${RESET}"
    echo ""
    echo -e "  Vercel → Settings → Environment Variables:"
    echo -e "    ${YELLOW}NEXT_PUBLIC_API_URL=https://${API_DOMAIN}${RESET}"
    echo -e "    ${YELLOW}SECURE_COOKIES=true${RESET}"
  fi
  echo ""
}

main() {
  cd "$PROJECT_DIR"
  check_deps
  setup_env

  set -a; source "$ENV_FILE"; set +a
  PROXY_MODE="${PROXY_MODE:-nginx}"
  [[ "$PROXY_MODE" != "http" && -z "${API_DOMAIN:-}" ]] && error ".env ichida API_DOMAIN yo'q"

  if [[ "$PROXY_MODE" == "http" ]] && ! docker ps --format '{{.Names}}' | grep -qx calc-nginx-http \
     && [[ -n "$(ss -Htln "sport = :${HTTP_PORT:-8080}" 2>/dev/null)" ]]; then
    error "${HTTP_PORT:-8080}-port band. .env dagi HTTP_PORT ni boshqa portga o'zgartiring (masalan 8090)"
  fi

  docker network inspect "$EDGE_NETWORK" &>/dev/null || docker network create "$EDGE_NETWORK" >/dev/null

  if [[ "$PROXY_MODE" == "nginx" ]] && ! sudo test -d "/etc/letsencrypt/live/${API_DOMAIN}"; then
    check_dns
    setup_ssl
  fi

  start_services
  wait_for_api
  show_status
}

main "$@"
