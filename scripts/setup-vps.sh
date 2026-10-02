#!/usr/bin/env bash
# =============================================================================
# setup-vps.sh — Первоначальная настройка Ubuntu VPS
# Запустить ОДИН РАЗ от root: sudo bash scripts/setup-vps.sh
# =============================================================================
set -euo pipefail

# ─── Цвета ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${BLUE}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*"; exit 1; }
step()    { echo -e "\n${BOLD}${BLUE}══ $* ══${RESET}"; }

# ─── Проверки ─────────────────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Запустите скрипт от root: sudo bash scripts/setup-vps.sh"
[[ -f /etc/os-release ]] && source /etc/os-release
[[ "${ID:-}" != "ubuntu" && "${ID_LIKE:-}" != "ubuntu" ]] && \
  warn "Скрипт написан для Ubuntu. На других дистрибутивах могут быть отличия."

step "Обновление пакетов"
apt-get update -qq
apt-get upgrade -y -qq
success "Система обновлена"

step "Установка базовых утилит"
apt-get install -y -qq \
  curl wget git unzip htop ufw \
  ca-certificates gnupg lsb-release \
  software-properties-common apt-transport-https \
  cron
systemctl enable cron 2>/dev/null || systemctl enable crond 2>/dev/null || true
systemctl start cron 2>/dev/null || systemctl start crond 2>/dev/null || true
success "Базовые утилиты установлены"

step "Установка Docker"
if command -v docker &>/dev/null; then
  success "Docker уже установлен: $(docker --version)"
else
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin

  systemctl enable docker
  systemctl start docker
  success "Docker установлен: $(docker --version)"
fi

step "Установка Certbot"
if command -v certbot &>/dev/null; then
  success "Certbot уже установлен: $(certbot --version 2>&1)"
else
  snap install --classic certbot 2>/dev/null || \
    apt-get install -y -qq certbot
  success "Certbot установлен"
fi

step "Создание системного пользователя deploy"
if id "deploy" &>/dev/null; then
  usermod -aG docker,sudo deploy
  success "Пользователь deploy уже существует (добавлен в docker,sudo)"
else
  useradd -m -s /bin/bash -G docker,sudo deploy
  success "Пользователь deploy создан (группы: docker, sudo)"
  info "Установите пароль: passwd deploy"
fi
echo "deploy ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/deploy
chmod 440 /etc/sudoers.d/deploy
success "NOPASSWD sudo настроен для deploy"

step "Настройка UFW (файрвол)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
success "UFW настроен: разрешены SSH, 80, 443"

step "Создание директории проекта"
mkdir -p /opt/calculator
mkdir -p /opt/backups/postgres
chown -R deploy:deploy /opt/calculator /opt/backups
success "Директории созданы: /opt/calculator, /opt/backups/postgres"

step "Настройка автоматического обновления SSL (cron)"
if command -v crontab &>/dev/null; then
  CRON_LINE="0 3 * * * certbot renew --quiet --post-hook 'docker exec calc-nginx nginx -s reload'"
  (crontab -l 2>/dev/null | grep -v certbot; echo "$CRON_LINE") | crontab -
  success "Cron для обновления SSL настроен"
else
  warn "crontab не найден — пропускаем (добавьте вручную после установки cron)"
fi

step "Настройка cron для бэкапов БД"
if command -v crontab &>/dev/null; then
  BACKUP_CRON="0 2 * * * /opt/calculator/scripts/backup.sh >> /var/log/calculator-backup.log 2>&1"
  (crontab -l 2>/dev/null | grep -v backup.sh; echo "$BACKUP_CRON") | crontab -
  success "Cron для бэкапов настроен (ежедневно в 02:00)"
else
  warn "crontab не найден — пропускаем"
fi

step "Настройка swap (2GB)"
if swapon --show | grep -q swap; then
  success "Swap уже настроен"
else
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  success "Swap 2GB создан и подключён"
fi

# ─── Итог ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║         VPS готов к деплою!                          ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Следующий шаг:${RESET}"
echo ""
echo -e "  1. Переключитесь на пользователя deploy:"
echo -e "     ${YELLOW}su - deploy${RESET}"
echo ""
echo -e "  2. Скопируйте репозиторий на сервер:"
echo -e "     ${YELLOW}git clone https://github.com/shukhratbekovb/calculator.git /opt/calculator${RESET}"
echo ""
echo -e "  3. Запустите деплой:"
echo -e "     ${YELLOW}cd /opt/calculator && bash scripts/deploy.sh${RESET}"
echo ""
