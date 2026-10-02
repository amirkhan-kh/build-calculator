#!/usr/bin/env bash
# =============================================================================
# backup.sh — Бэкап PostgreSQL с ротацией (хранит последние 7 дней)
# Запуск: bash scripts/backup.sh
# Cron (уже настроен setup-vps.sh): 0 2 * * * /opt/calculator/scripts/backup.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env"
BACKUP_DIR="/opt/backups/postgres"
KEEP_DAYS=7
DATE="$(date '+%Y-%m-%d_%H-%M-%S')"
BACKUP_FILE="${BACKUP_DIR}/calculator_${DATE}.sql.gz"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; RESET='\033[0m'

info()    { echo "[$(date '+%H:%M:%S')] $*"; }
success() { echo -e "${GREEN}[OK]${RESET} $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*"; exit 1; }

# Загружаем переменные
[[ -f "$ENV_FILE" ]] && source "$ENV_FILE" || error ".env не найден: $ENV_FILE"

# Проверяем что контейнер postgres работает
docker inspect calc-postgres &>/dev/null || error "Контейнер calc-postgres не запущен"

mkdir -p "$BACKUP_DIR"

info "Начинаем бэкап базы данных..."

# pg_dump внутри контейнера → gzip → файл на хосте
docker exec calc-postgres \
  pg_dump \
    -U "${POSTGRES_USER:-calculator_user}" \
    -d "${POSTGRES_DB:-calculator_db}" \
    --no-password \
  | gzip > "$BACKUP_FILE"

SIZE="$(du -sh "$BACKUP_FILE" | cut -f1)"
success "Бэкап создан: ${BACKUP_FILE} (${SIZE})"

# Удаляем бэкапы старше KEEP_DAYS дней
info "Удаляем бэкапы старше ${KEEP_DAYS} дней..."
find "$BACKUP_DIR" -name "calculator_*.sql.gz" -mtime "+${KEEP_DAYS}" -delete
COUNT="$(find "$BACKUP_DIR" -name "calculator_*.sql.gz" | wc -l)"
info "Хранится бэкапов: ${COUNT}"

success "Бэкап завершён успешно"
