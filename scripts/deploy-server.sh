#!/usr/bin/env bash
# =============================================================================
# deploy-server.sh — Backend'ni serverga deploy qilish (frontend Vercelda)
# Birinchi marta ham, yangilashda ham shu buyruq:  bash scripts/deploy-server.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"
COMPOSE=(docker compose -f "$PROJECT_DIR/docker-compose.server.yml")
SUPERUSER_FLAG="$PROJECT_DIR/.superuser_created"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${BLUE}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[XATO]${RESET}  $*"; exit 1; }
step()    { echo -e "\n${BOLD}${BLUE}══════ $* ══════${RESET}"; }

gen_secret() { openssl rand -hex "${1:-32}"; }

check_deps() {
  step "Kerakli dasturlarni tekshirish"
  command -v docker  &>/dev/null || error "Docker o'rnatilmagan. Avval: sudo bash scripts/setup-vps.sh"
  docker compose version &>/dev/null || error "Docker Compose plugin o'rnatilmagan"
  command -v certbot &>/dev/null || error "Certbot o'rnatilmagan. Avval: sudo bash scripts/setup-vps.sh"
  command -v openssl &>/dev/null || error "openssl topilmadi"
  success "Hammasi joyida"
}

setup_env() {
  step ".env sozlash"

  if [[ -f "$ENV_FILE" ]]; then
    success ".env allaqachon bor — o'tkazib yuborildi"
    return
  fi

  read -rp "API domeni (masalan: api.mysite.uz): " API_DOMAIN
  [[ -z "$API_DOMAIN" ]] && error "Domen bo'sh bo'lishi mumkin emas"

  read -rp "Vercel frontend manzili (masalan: https://build-calculator.vercel.app): " FRONTEND_URL
  [[ -z "$FRONTEND_URL" ]] && error "Frontend manzili bo'sh bo'lishi mumkin emas"
  FRONTEND_URL="${FRONTEND_URL%/}"

  read -rp "Let's Encrypt uchun email: " LE_EMAIL
  [[ -z "$LE_EMAIL" ]] && error "Email bo'sh bo'lishi mumkin emas"

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

# Vergul bilan bir nechta domen yozish mumkin (custom domen ulasangiz shu yerga qo'shing)
ALLOWED_ORIGINS=${FRONTEND_URL}
# Vercel preview deploylari uchun (ixtiyoriy), masalan: https://build-calculator-.*\.vercel\.app
ALLOWED_ORIGIN_REGEX=

MINIO_ENDPOINT=http://minio:9000
MINIO_PUBLIC_URL=https://${API_DOMAIN}/media
MINIO_ACCESS_KEY=calculator_minio
MINIO_SECRET_KEY=${minio_pass}
MINIO_BUCKET=calculator-media

TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
# Bot token qo'yilsa, quyidagini oching:
# COMPOSE_PROFILES=bot

API_DOMAIN=${API_DOMAIN}
LE_EMAIL=${LE_EMAIL}
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
    read -rp "Baribir davom etilsinmi? (y/N): " ans
    [[ "$ans" =~ ^[Yy]$ ]] || exit 1
  else
    success "${API_DOMAIN} → ${domain_ip}"
  fi
}

setup_ssl() {
  step "SSL sertifikat (Let's Encrypt)"

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
  "${COMPOSE[@]}" up -d --build --remove-orphans
  docker image prune -f >/dev/null
  success "Servislar ishga tushdi"
}

wait_for_api() {
  step "API tayyor bo'lishini kutish"
  for _ in $(seq 1 40); do
    if curl -sf http://127.0.0.1:8000/health &>/dev/null; then
      success "API ishlayapti"
      return
    fi
    sleep 3
  done
  error "API 2 daqiqada javob bermadi. Loglar: docker logs calc-api --tail=100 ; docker logs calc-migrate"
}

create_superuser() {
  [[ -f "$SUPERUSER_FLAG" ]] && return
  [[ -t 0 ]] || { warn "Terminal interaktiv emas — superuser keyin yaratiladi"; return; }

  step "Superuser yaratish"
  docker exec -it calc-api python scripts/create_superuser.py
  touch "$SUPERUSER_FLAG"
  success "Superuser yaratildi"
}

show_status() {
  step "Holat"
  "${COMPOSE[@]}" ps
  echo ""
  echo -e "${GREEN}${BOLD}Backend tayyor!${RESET}"
  echo -e "  API:      ${CYAN}https://${API_DOMAIN}${RESET}"
  echo -e "  Swagger:  ${CYAN}https://${API_DOMAIN}/docs${RESET}"
  echo -e "  Health:   ${CYAN}https://${API_DOMAIN}/health${RESET}"
  echo ""
  echo -e "  Vercel → Settings → Environment Variables:"
  echo -e "    ${YELLOW}NEXT_PUBLIC_API_URL=https://${API_DOMAIN}${RESET}"
  echo -e "    ${YELLOW}SECURE_COOKIES=true${RESET}"
  echo ""
}

main() {
  cd "$PROJECT_DIR"
  check_deps
  setup_env

  set -a; source "$ENV_FILE"; set +a
  [[ -z "${API_DOMAIN:-}" ]] && error ".env ichida API_DOMAIN yo'q"

  if ! sudo test -d "/etc/letsencrypt/live/${API_DOMAIN}"; then
    check_dns
    setup_ssl
  fi

  start_services
  wait_for_api
  create_superuser
  show_status
}

main "$@"
