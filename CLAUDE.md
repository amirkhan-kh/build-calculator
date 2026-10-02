# Calculator Project — CLAUDE.md

## Что это за проект
Система управления жилыми комплексами и расчёта стоимости квартир с рассрочкой платежа.
- **Backend:** FastAPI (Python 3.12) + PostgreSQL + SQLAlchemy async + Alembic + Celery
- **Frontend:** Next.js 16 (App Router) + TypeScript + TanStack Query + Radix UI + Tailwind CSS 4
- **Docker Hub:** `shukhratbekovb/calculator-backend:latest`, `shukhratbekovb/calculator-frontend:latest`

---

## Структура репозитория

```
calculator/
├── backend/           # FastAPI REST API
├── frontend/          # Next.js 16 веб-приложение
├── .env               # Переменные окружения (оба сервиса)
├── docker-compose.prod.yml   # Продакшн (используют hub-образы)
├── docker-compose.dev.yml    # Локальная разработка (hot-reload)
├── docker-compose.backend-dev.yml  # Только backend dev
└── DOCS.md            # Полная документация проекта
```

---

## Запуск

### Локальная разработка (с hot-reload, без пересборки)
```bash
docker compose -f docker-compose.dev.yml up
```
- Backend авто-перезапускается при изменении файлов (`--reload`)
- Frontend работает в `next dev` режиме с hot-reload
- Исходники монтируются напрямую (volume mount)

### Продакшн (hub-образы)
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Сборка и пуш в Docker Hub
```bash
# Backend
docker buildx build --platform linux/amd64,linux/arm64 \
  --tag shukhratbekovb/calculator-backend:latest --push ./backend

# Frontend (NEXT_PUBLIC_API_URL бейкится во время сборки)
docker buildx build --platform linux/amd64,linux/arm64 \
  --tag shukhratbekovb/calculator-frontend:latest \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8001 --push ./frontend
```

> **Важно:** При первом билде после очистки кэша или при повреждённых слоях добавить `--no-cache`

---

## .env файл (корень проекта)

```env
# PostgreSQL
POSTGRES_USER=calculator_user
POSTGRES_PASSWORD=calculator_pass
POSTGRES_DB=calculator_db

# Backend DB URLs
DATABASE_URL=postgresql://calculator_user:calculator_pass@postgres:5432/calculator_db
ASYNC_DATABASE_URL=postgresql+asyncpg://calculator_user:calculator_pass@postgres:5432/calculator_db

# JWT
SECRET_KEY=super-secret-key-change-in-production-please

# Next.js (бейкится в образ при сборке, используется браузером)
NEXT_PUBLIC_API_URL=http://localhost:8001

# Cookies — false для HTTP, true только при HTTPS в проде
SECURE_COOKIES=false

# MinIO S3
MINIO_ENDPOINT=http://minio:9000
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=calculator-media
```

---

## Порты

| Сервис     | Внешний | Внутренний |
|------------|---------|------------|
| FastAPI    | 8001    | 8000       |
| Next.js    | 3001    | 3000       |
| PostgreSQL | 5434    | 5432       |
| MinIO API  | 9000    | 9000       |
| MinIO UI   | 9001    | 9001       |

---

## Ключевые архитектурные решения

### URL стратегия (frontend)
`frontend/src/configs/env.config.ts` использует геттер:
- **Браузер (client-side):** `NEXT_PUBLIC_API_URL` = `http://localhost:8001` (бейкится при сборке)
- **Next.js сервер (server-side, внутри Docker):** `INTERNAL_API_URL` = `http://api:8000`

В `docker-compose.prod.yml` и `docker-compose.dev.yml` передаётся `INTERNAL_API_URL=http://api:8000`.

### Куки авторизации
`login.action.ts` управляет `secure` флагом через `SECURE_COOKIES=true/false`.
- `false` (по умолчанию) — для HTTP (локальная разработка)
- `true` — только при HTTPS в продакшне

**Почему важно:** `secure: true` на HTTP = браузер не отправляет куки = middleware не видит токен = redirect на /login после логина.

### pnpm в Docker (frontend Dockerfile)
Используется `pnpm i --ignore-scripts` чтобы обойти блокировку нативных build-скриптов в pnpm v11 (`@swc/core`, `sharp`, `@parcel/watcher`, `unrs-resolver`). Все пакеты поставляются с prebuilt-бинарями.

### Backend образ
Первый билд был повреждён (starlette, uvicorn файлы были 0 байт из-за проблемы с Docker build cache). Исправлено пересборкой с `--no-cache`.

---

## Superuser (создать после первого запуска)
```bash
docker exec -it calculator-fastapi-app python scripts/create_superuser.py
```
или для dev:
```bash
docker exec -it calculator-fastapi-dev python scripts/create_superuser.py
```

---

## Известные проблемы и решения

| Проблема | Причина | Решение |
|---|---|---|
| Backend restart loop, exit 0 | Starlette файлы 0 байт (повреждён build cache) | `docker buildx build --no-cache` |
| После логина не редиректит | `secure: true` кука на HTTP | `SECURE_COOKIES=false` в .env |
| `FATAL: role "calculator_user" does not exist` | db_data volume от старого запуска | `docker compose down -v` и заново up |
| `pnpm i` падает с ERR_PNPM_IGNORED_BUILDS | pnpm v11 блокирует native build scripts | Добавлен `--ignore-scripts` в Dockerfile |
| Docker Hub недоступен | DNS проблема Docker Desktop | `docker buildx build --load` для локальной загрузки |

---

## Статусы квартир

| Значение | Отображение | Цвет |
|---|---|---|
| `free` | Свободно | зелёный (default) |
| `sold` | Продано | красный |
| `booked` | Бронь | жёлтый |
| `withdrawn` | Снято | серый |

Миграция: `c1a4f82d3e91` конвертировала старые (`built`, `upcoming`, `in_process`) в `free`.

---

## Планировки (ApartmentLayout)

Каждое здание имеет набор планировок (room_count + area + name).

### Логика
- Управление: `/buildings/[id]` → вкладка **«Планировки»** (добавить / удалить)
- При добавлении квартиры: планировки здания показываются как таблетки → клик автозаполняет room_count и area
- Ручной ввод room_count + area → при сабмите планировка создаётся автоматически если не существует
- Уникальность: `(building_id, room_count, area)` — дубль возвращает существующую запись, не падает

### Backend
- Модуль: `backend/layouts/` (models, schemas, repositories, routers)
- Миграция: `a3f1c9b2d847`
- `Building` имеет relationship `layouts` (cascade delete)

### Frontend
- `src/types/layout.types.ts`
- `src/action/layouts/` — get, create, delete API
- `src/action/hooks/layouts-hook/get-layouts.hook.ts`
- `src/components/shared/ui-demo/tabs/layouts-tab/_layouts-tab.tsx`

---

## Калькулятор (улучшения)

### Статус квартиры — цветной бейдж
В `_calculator-client.tsx` статус отображается как цветная таблетка (не просто текст).

### Поле «Цена м²»
- По умолчанию подставляется `final_price` выбранной квартиры
- Можно изменить вручную — кастомная цена передаётся в API как `price_per_sqrm`
- Backend (`calculator/schemas.py`): опциональное поле `price_per_sqrm: Optional[Decimal]`
- Если передано — используется вместо цены из БД

---

## Модели БД (иерархия)

```
Complex → Building → Apartment
                  → BuildingCoefficient → BuildingCoefficientType
                                        ↕ (M2M через apartment_coefficients)
                                       Apartment
                  → ApartmentLayout (room_count, area, name)

User → Role ↔ Permission (M2M через role_permission)
```

## API эндпоинты (все требуют Bearer token кроме /auth/)

| Модуль | Prefix | CRUD |
|---|---|---|
| Auth | `/auth` | POST /token/, POST /refresh/, GET /me |
| Complexes | `/complexes` | GET /, POST /add/, GET/PATCH/DELETE /{id}/ |
| Buildings | `/buildings` | GET /, POST /add/, GET/PATCH/DELETE /{id}/, PATCH /{id}/image |
| Apartments | `/apartments` | GET /, POST /add/, GET/PATCH/DELETE /{id}/, POST /bulk-create/ |
| Coefficients | `/coefficients` | GET /, POST /add/, GET/PATCH/DELETE /{id}/ |
| Coeff Types | `/coefficient-types` | GET /, POST /add/, GET/PATCH/DELETE /{id}/ |
| **Layouts** | `/layouts` | GET /?building_id=, POST /add/, GET /check/, DELETE /{id}/ |
| Calculator | `/calculator` | POST /{apartment_id}/?first_investment_type= |
| Users | `/users` | GET /, POST /create/, GET/PATCH/DELETE /{id} |
| Roles | `/roles` | GET /, POST /create/, GET/PATCH/DELETE /{id} |
| Permissions | `/permissions` | GET /, POST /create/, GET/PATCH/DELETE /{id} |

## Известные нюансы backend

### SQLAlchemy async + IntegrityError
При дубле `apartment_layouts` нельзя использовать `begin_nested()` + `commit()` внутри — это сбивает savepoint.
Правильный паттерн: `flush()` в репозитории + `commit()` в роутере + `rollback()` в `except IntegrityError`.
Также: при hot-reload изменения в `layouts/` иногда не подхватываются — нужен `touch main.py`.
