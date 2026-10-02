#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Полный деплой Calculator (первый запуск + обновления)
# Использование: bash scripts/deploy.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"
COMPOSE_PROD="$PROJECT_DIR/docker-compose.prod.yml"
COMPOSE_MON="$PROJECT_DIR/docker-compose.monitoring.yml"

# ─── Цвета ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${BLUE}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*"; exit 1; }
ask()     { echo -e "${CYAN}[INPUT]${RESET} $*"; }
step()    { echo -e "\n${BOLD}${BLUE}══════ $* ══════${RESET}"; }

gen_secret() { python3 -c "import secrets; print(secrets.token_hex(${1:-32}))" 2>/dev/null || \
               openssl rand -hex "${1:-32}"; }

banner() {
  echo ""
  echo -e "${BOLD}${GREEN}"
  echo "  ██████╗ █████╗ ██╗      ██████╗"
  echo " ██╔════╝██╔══██╗██║     ██╔════╝"
  echo " ██║     ███████║██║     ██║"
  echo " ██║     ██╔══██║██║     ██║"
  echo " ╚██████╗██║  ██║███████╗╚██████╗"
  echo "  ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝  Deploy Script"
  echo -e "${RESET}"
}

# ─── Проверка зависимостей ────────────────────────────────────────────────────
check_deps() {
  step "Проверка зависимостей"
  local missing=()
  command -v docker   &>/dev/null || missing+=("docker")
  command -v git      &>/dev/null || missing+=("git")
  command -v python3  &>/dev/null || command -v openssl &>/dev/null || missing+=("python3 или openssl")

  if [[ ${#missing[@]} -gt 0 ]]; then
    error "Не хватает: ${missing[*]}\nЗапустите сначала: sudo bash scripts/setup-vps.sh"
  fi

  docker compose version &>/dev/null || error "Docker Compose plugin не установлен"
  success "Все зависимости присутствуют"
}

# ─── Создание .env ────────────────────────────────────────────────────────────
setup_env() {
  step "Настройка окружения (.env)"

  if [[ -f "$ENV_FILE" ]]; then
    warn ".env уже существует — пропускаем создание"
    info "Для пересоздания удалите файл .env и запустите скрипт снова"
    return
  fi

  echo ""
  ask "Введите ваш домен (без https://, например: myapp.uz):"
  read -r DOMAIN
  [[ -z "$DOMAIN" ]] && error "Домен не может быть пустым"

  ask "Введите email для Let's Encrypt (уведомления об истечении SSL):"
  read -r LE_EMAIL
  [[ -z "$LE_EMAIL" ]] && error "Email не может быть пустым"

  info "Генерирую безопасные пароли..."
  DB_PASS="$(gen_secret 24)"
  SECRET_KEY="$(gen_secret 64)"
  MINIO_PASS="$(gen_secret 20)"
  GRAFANA_PASS="$(gen_secret 16)"

  cat > "$ENV_FILE" <<EOF
# =============================================================================
# Сгенерировано автоматически: $(date '+%Y-%m-%d %H:%M:%S')
# =============================================================================

# ─── PostgreSQL ───────────────────────────────────────────────────────────────
POSTGRES_USER=calculator_user
POSTGRES_PASSWORD=${DB_PASS}
POSTGRES_DB=calculator_db

DATABASE_URL=postgresql://calculator_user:${DB_PASS}@postgres:5432/calculator_db
ASYNC_DATABASE_URL=postgresql+asyncpg://calculator_user:${DB_PASS}@postgres:5432/calculator_db

# ─── JWT ──────────────────────────────────────────────────────────────────────
SECRET_KEY=${SECRET_KEY}

# ─── CORS ─────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}

# ─── Next.js ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api

# ─── Cookies ──────────────────────────────────────────────────────────────────
SECURE_COOKIES=true

# ─── MinIO S3 ─────────────────────────────────────────────────────────────────
MINIO_ENDPOINT=http://minio:9000
MINIO_PUBLIC_URL=https://${DOMAIN}/media
MINIO_ACCESS_KEY=calculator_minio
MINIO_SECRET_KEY=${MINIO_PASS}
MINIO_BUCKET=calculator-media

# ─── Monitoring ───────────────────────────────────────────────────────────────
GRAFANA_PASSWORD=${GRAFANA_PASS}

# ─── Домен (используется скриптами) ─────────────────────────────────────────
APP_DOMAIN=${DOMAIN}
LE_EMAIL=${LE_EMAIL}
EOF

  chmod 600 "$ENV_FILE"
  success ".env создан с безопасными паролями"
  echo ""
  echo -e "  ${BOLD}Ваши данные для доступа (сохраните!):${RESET}"
  echo -e "  Grafana password:  ${YELLOW}${GRAFANA_PASS}${RESET}"
  echo -e "  MinIO password:    ${YELLOW}${MINIO_PASS}${RESET}"
  echo -e "  DB password:       ${YELLOW}${DB_PASS}${RESET}"
  echo ""
  warn "Сохраните эти пароли — они больше не будут показаны!"
  echo ""
  read -rp "Нажмите Enter чтобы продолжить..."
}

# ─── Получение SSL сертификата ────────────────────────────────────────────────
setup_ssl() {
  step "SSL сертификат (Let's Encrypt)"

  source "$ENV_FILE"
  local domain="${APP_DOMAIN:-}"
  local email="${LE_EMAIL:-}"

  [[ -z "$domain" ]] && error "APP_DOMAIN не задан в .env"
  [[ -z "$email"  ]] && error "LE_EMAIL не задан в .env"

  if [[ -f "/etc/letsencrypt/live/${domain}/fullchain.pem" ]]; then
    success "SSL сертификат уже существует для ${domain}"
    return
  fi

  if ! command -v certbot &>/dev/null; then
    error "Certbot не установлен. Запустите: sudo bash scripts/setup-vps.sh"
  fi

  info "Получаю SSL для ${domain}..."
  # Останавливаем nginx если запущен (занимает порт 80)
  docker compose -f "$COMPOSE_PROD" stop nginx 2>/dev/null || true

  sudo certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email "$email" \
    -d "$domain" \
    -d "www.${domain}" || {
      warn "Не удалось получить сертификат для www.${domain}, пробую только ${domain}..."
      sudo certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "$email" \
        -d "$domain"
    }

  success "SSL сертификат получен для ${domain}"
}

# ─── Подготовка Nginx конфига ─────────────────────────────────────────────────
setup_nginx_config() {
  step "Настройка Nginx конфига"

  source "$ENV_FILE"
  local domain="${APP_DOMAIN:-}"
  local conf="$PROJECT_DIR/nginx/conf.d/calculator.conf"

  [[ -z "$domain" ]] && error "APP_DOMAIN не задан в .env"

  if grep -q "YOUR_DOMAIN" "$conf" 2>/dev/null; then
    info "Прописываю домен ${domain} в nginx конфиг..."
    sed -i "s/YOUR_DOMAIN/${domain}/g" "$conf"
    success "Nginx конфиг обновлён: ${domain}"
  else
    success "Nginx конфиг уже настроен"
  fi

  mkdir -p "$PROJECT_DIR/nginx/logs"
}

# ─── Pull образов ─────────────────────────────────────────────────────────────
pull_images() {
  step "Загрузка Docker образов с Docker Hub"
  cd "$PROJECT_DIR"
  docker compose -f "$COMPOSE_PROD" pull
  success "Образы загружены"
}

# ─── Запуск сервисов ──────────────────────────────────────────────────────────
start_services() {
  step "Запуск сервисов"
  cd "$PROJECT_DIR"

  docker compose -f "$COMPOSE_PROD" up -d --remove-orphans
  success "Сервисы запущены"
}

# ─── Ожидание готовности API ──────────────────────────────────────────────────
wait_for_api() {
  step "Ожидание готовности API"
  local max_attempts=30
  local attempt=0

  echo -n "  Ждём "
  while [[ $attempt -lt $max_attempts ]]; do
    if docker exec calc-api curl -sf http://localhost:8000/health &>/dev/null; then
      echo ""
      success "API готов!"
      return 0
    fi
    echo -n "."
    sleep 3
    ((attempt++))
  done

  echo ""
  error "API не ответил за $(( max_attempts * 3 )) секунд. Проверьте: docker logs calc-api"
}

# ─── Создание суперпользователя (только первый раз) ──────────────────────────
create_superuser() {
  step "Создание суперпользователя"

  local flag_file="$PROJECT_DIR/.superuser_created"
  if [[ -f "$flag_file" ]]; then
    success "Суперпользователь уже создан ранее"
    return
  fi

  echo ""
  info "Создаём суперпользователя для входа в систему."
  echo ""
  docker exec -it calc-api python scripts/create_superuser.py

  touch "$flag_file"
  success "Суперпользователь создан"
}

# ─── Запуск мониторинга ───────────────────────────────────────────────────────
start_monitoring() {
  step "Запуск мониторинга (Prometheus + Grafana + Loki)"
  cd "$PROJECT_DIR"

  if [[ ! -f "$COMPOSE_MON" ]]; then
    warn "docker-compose.monitoring.yml не найден, пропускаем"
    return
  fi

  docker compose -f "$COMPOSE_MON" up -d --remove-orphans
  success "Мониторинг запущен"
}

# ─── Показать статус ──────────────────────────────────────────────────────────
show_status() {
  step "Статус сервисов"
  cd "$PROJECT_DIR"

  echo ""
  docker compose -f "$COMPOSE_PROD" ps
  echo ""

  source "$ENV_FILE"
  local domain="${APP_DOMAIN:-localhost}"
  local grafana_pass="${GRAFANA_PASSWORD:-changeme}"

  echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${GREEN}${BOLD}║                   ДЕПЛОЙ ЗАВЕРШЁН!                           ║${RESET}"
  echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  echo -e "  ${BOLD}Ваш сайт:${RESET}      ${CYAN}https://${domain}${RESET}"
  echo -e "  ${BOLD}API docs:${RESET}      ${CYAN}https://${domain}/api/docs${RESET}"
  echo -e "  ${BOLD}Grafana:${RESET}       ${CYAN}http://$(hostname -I | awk '{print $1}'):3030${RESET}  (admin / ${grafana_pass})"
  echo ""
  echo -e "  ${BOLD}Полезные команды:${RESET}"
  echo -e "  ${YELLOW}docker compose -f docker-compose.prod.yml logs -f api${RESET}      # логи API"
  echo -e "  ${YELLOW}docker compose -f docker-compose.prod.yml ps${RESET}               # статус"
  echo -e "  ${YELLOW}bash scripts/backup.sh${RESET}                                     # бэкап БД"
  echo -e "  ${YELLOW}bash scripts/deploy.sh${RESET}                                     # обновление"
  echo ""
}

# ─── Режим обновления (если .env уже есть) ───────────────────────────────────
is_update() {
  [[ -f "$ENV_FILE" && -f "$PROJECT_DIR/.superuser_created" ]]
}

# ─── MAIN ─────────────────────────────────────────────────────────────────────
main() {
  banner
  cd "$PROJECT_DIR"

  check_deps

  if is_update; then
    info "Режим обновления — .env и суперпользователь уже настроены"
    pull_images
    start_services
    wait_for_api
    start_monitoring
    show_status
  else
    info "Первый деплой — запускаем полную настройку"
    setup_env
    setup_ssl
    setup_nginx_config
    pull_images
    start_services
    wait_for_api
    create_superuser
    start_monitoring
    show_status
  fi
}

main "$@"
