# Деплой Calculator на VPS

## Что нужно

- VPS с Ubuntu 22.04 / 24.04 (минимум 2 CPU, 2 GB RAM, 20 GB SSD)
- Домен с A-записью, указывающей на IP вашего VPS
- SSH доступ к серверу
- Аккаунт на Docker Hub (`shukhratbekovb`)

---

## Быстрый старт (2 команды)

### Шаг 1 — Подготовка VPS (один раз)

Подключитесь к серверу и запустите:

```bash
# Подключиться к серверу
ssh root@ВАШ_IP

# Скачать и запустить скрипт подготовки
curl -sSL https://raw.githubusercontent.com/it911uz/calculator/main/scripts/setup-vps.sh | sudo bash
```

Скрипт установит: Docker, Docker Compose, Certbot, UFW (файрвол), создаст пользователя `deploy`, настроит swap 2GB и cron для бэкапов.

### Шаг 2 — Деплой проекта (один раз + при обновлениях)

```bash
# Переключиться на пользователя deploy
su - deploy

# Скопировать репозиторий
git clone https://github.com/it911uz/calculator.git /opt/calculator
cd /opt/calculator

# ЗАПУСТИТЬ ДЕПЛОЙ (одна команда — делает всё)
bash scripts/deploy.sh
```

Скрипт интерактивно спросит домен и email, затем автоматически:
- Создаст `.env` с безопасными паролями
- Получит SSL сертификат (Let's Encrypt)
- Пропишет домен в Nginx конфиг
- Загрузит Docker образы с Docker Hub
- Запустит все сервисы (PostgreSQL, Redis, MinIO, API, Celery, Frontend, Nginx)
- Дождётся готовности API
- Предложит создать суперпользователя
- Запустит мониторинг (Prometheus + Grafana + Loki)

---

## Обновление проекта

При следующих деплоях (после `git push` в `main`):

```bash
# CI/CD автоматически задеплоит через GitHub Actions

# Или вручную на сервере:
cd /opt/calculator && git pull && bash scripts/deploy.sh
```

Скрипт определит что это обновление и только перезапустит сервисы.

---

## Бэкап базы данных

```bash
# Вручную
bash scripts/backup.sh

# Автоматически — уже настроен cron (ежедневно в 02:00)
# Бэкапы хранятся в /opt/backups/postgres/ (последние 7 дней)
```

---

## Настройка GitHub Actions (CI/CD)

Добавьте секреты в `Settings → Secrets → Actions` вашего репозитория:

| Secret | Значение |
|--------|---------|
| `DOCKERHUB_USERNAME` | `shukhratbekovb` |
| `DOCKERHUB_TOKEN` | Access token с Docker Hub |
| `VPS_HOST` | IP адрес сервера |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Приватный SSH ключ |
| `NEXT_PUBLIC_API_URL` | `https://ваш-домен/api` |

**Как создать SSH ключ для деплоя:**

```bash
# На VPS от пользователя deploy
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""

# Добавить публичный ключ в authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Скопировать ПРИВАТНЫЙ ключ в GitHub Secret VPS_SSH_KEY
cat ~/.ssh/deploy_key
```

После этого каждый `git push` в `main` автоматически:
1. Проверит lint (backend + frontend)
2. Запустит Trivy security scan
3. Соберёт Docker образы и пушнет в Docker Hub
4. Задеплоит на VPS по SSH

---

## Полезные команды на сервере

```bash
# Статус всех сервисов
docker compose -f /opt/calculator/docker-compose.prod.yml ps

# Логи API в реальном времени
docker compose -f /opt/calculator/docker-compose.prod.yml logs -f api

# Логи всех сервисов
docker compose -f /opt/calculator/docker-compose.prod.yml logs -f

# Перезапустить один сервис
docker compose -f /opt/calculator/docker-compose.prod.yml restart api

# Войти в контейнер API
docker exec -it calc-api bash

# Создать суперпользователя вручную
docker exec -it calc-api python scripts/create_superuser.py

# MinIO Admin UI (через SSH tunnel)
ssh -L 9001:localhost:9001 deploy@ВАШ_IP
# Открыть: http://localhost:9001

# Grafana (через SSH tunnel)
ssh -L 3030:localhost:3030 deploy@ВАШ_IP
# Открыть: http://localhost:3030
```

---

## Адреса после деплоя

| Сервис | URL |
|--------|-----|
| Сайт | `https://ваш-домен` |
| API | `https://ваш-домен/api` |
| API docs | `https://ваш-домен/api/docs` |
| Grafana | `http://ВАШ_IP:3030` (или SSH tunnel) |
| MinIO Admin | SSH tunnel → `http://localhost:9001` |

---

## Структура файлов деплоя

```
calculator/
├── scripts/
│   ├── setup-vps.sh          # Шаг 1: подготовка VPS (один раз)
│   ├── deploy.sh             # Шаг 2: деплой / обновление
│   └── backup.sh             # Бэкап PostgreSQL
├── nginx/
│   ├── nginx.conf            # Базовый nginx конфиг
│   ├── conf.d/
│   │   └── calculator.conf   # Виртуальный хост + TLS + rate limiting
│   └── logs/                 # Логи nginx (создаётся автоматически)
├── monitoring/
│   ├── prometheus.yml        # Scrape конфиг
│   ├── loki.yml              # Loki конфиг
│   └── promtail.yml          # Promtail конфиг (сбор логов)
├── docker-compose.prod.yml   # Продакшн стек
├── docker-compose.monitoring.yml  # Мониторинг стек
├── .env.example              # Шаблон переменных окружения
└── .github/
    └── workflows/
        └── deploy.yml        # GitHub Actions CI/CD
```

---

## Восстановление из бэкапа

```bash
# Список бэкапов
ls -lh /opt/backups/postgres/

# Восстановить из бэкапа (заменит текущие данные!)
BACKUP_FILE="/opt/backups/postgres/calculator_2024-01-15_02-00-00.sql.gz"

gunzip -c "$BACKUP_FILE" | docker exec -i calc-postgres \
  psql -U calculator_user -d calculator_db
```

---

## Устранение проблем

### API не запускается
```bash
docker logs calc-api --tail=50
docker logs calc-migrate --tail=20
```

### Nginx ошибка 502
```bash
# Проверить что API жив
curl http://localhost:8000/health
docker compose -f docker-compose.prod.yml ps
```

### Сертификат не получается
```bash
# Убедитесь что A-запись домена указывает на этот IP
curl ifconfig.me
nslookup ваш-домен

# Вручную получить сертификат
certbot certonly --standalone -d ваш-домен -d www.ваш-домен
```

### Полный сброс (УДАЛИТ ВСЕ ДАННЫЕ)
```bash
cd /opt/calculator
docker compose -f docker-compose.prod.yml down -v
rm .env .superuser_created
bash scripts/deploy.sh
```
