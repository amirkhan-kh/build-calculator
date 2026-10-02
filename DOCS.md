# Документация проекта: Apartment Price Calculator

## Общее описание

Система управления жилыми комплексами и расчёта стоимости квартир с рассрочкой платежа. Состоит из REST API на FastAPI и веб-интерфейса на Next.js 16.

---

## Архитектура

```
calculator/
├── backend/          # FastAPI REST API
├── frontend/         # Next.js 16 веб-приложение
├── docker-compose.prod.yml
└── docker-compose.backend-dev.yml
```

### Инфраструктура (Docker Compose)

| Сервис     | Контейнер                  | Порт (внешний → внутренний) |
|------------|----------------------------|-----------------------------|
| FastAPI    | calculator-fastapi-app     | 8001 → 8000                 |
| Next.js    | calculator-nextjs-app      | 3001 → 3000                 |
| PostgreSQL | calculator-postgres        | 5434 → 5432                 |

---

# BACKEND

## Стек технологий

| Компонент       | Технология                    |
|-----------------|-------------------------------|
| Фреймворк       | FastAPI 0.124.4               |
| ORM             | SQLAlchemy 2.0 (async)        |
| БД              | PostgreSQL 17                 |
| Миграции        | Alembic                       |
| Аутентификация  | JWT (PyJWT / python-jose)     |
| Хеширование     | argon2-cffi / passlib         |
| Асинхронный драйвер БД | asyncpg               |
| Очередь задач   | Celery + Redis                |
| Парсинг Excel   | pandas + openpyxl             |
| Валидация       | Pydantic v2                   |
| Сервер          | Uvicorn                       |
| Мониторинг      | prometheus-fastapi-instrumentator |

## Структура модулей

```
backend/
├── main.py                    # Точка входа FastAPI приложения
├── lifespan.py                # Lifespan (startup/shutdown)
├── core/
│   ├── config.py              # Настройки приложения
│   ├── db/
│   │   ├── base_model.py      # Базовая модель SQLAlchemy
│   │   ├── session.py         # Сессия БД (get_db dependency)
│   │   └── init_db.py         # Инициализация таблиц
│   ├── dependencies.py        # Общие зависимости (пагинация)
│   ├── exceptions.py          # HTTP исключения (Forbidden, InvalidToken и др.)
│   ├── models.py              # Импорт всех моделей
│   ├── repositories.py        # Базовый репозиторий
│   └── routers.py             # Регистрация всех роутеров
├── auth/                      # Аутентификация и авторизация
├── users/                     # Управление пользователями
├── roles/                     # Роли пользователей
├── permissions/               # Права доступа
├── role_permissions/          # M2M таблица ролей и прав
├── complexes/                 # Жилые комплексы
├── buildings/                 # Здания
├── apartments/                # Квартиры
├── coefficients/              # Коэффициенты ценообразования
├── calculator/                # Модуль расчёта рассрочки
├── celery_app/                # Асинхронные задачи Celery
├── scripts/                   # Скрипты (создание суперпользователя)
└── alembic/                   # Миграции БД
```

## Настройки (core/config.py)

| Параметр          | Источник     | Значение по умолчанию       |
|-------------------|--------------|-----------------------------|
| DATABASE_URL      | .env         | —                           |
| ASYNC_DATABASE_URL| .env         | —                           |
| SECRET_KEY        | .env         | —                           |
| ALGORITHM         | hardcoded    | HS256                       |
| ACCESS_TIME       | hardcoded    | 360 минут                   |
| REFRESH_TIME      | hardcoded    | 120 минут                   |
| MAX_FILE_SIZE     | hardcoded    | 5 MB                        |
| TIMEZONE          | hardcoded    | Asia/Tashkent               |
| IMAGES_DIR        | hardcoded    | `<root>/images/`            |
| BASE_URL          | hardcoded    | http://172.18.0.1:8001/     |

CORS разрешён для: `localhost:3000`, `localhost:3001`, `localhost:8000`, и ряда локальных IP.

---

## База данных — Модели

### Complex (complexes)
Жилой комплекс — верхний уровень иерархии.

| Поле        | Тип          | Ограничения         |
|-------------|--------------|---------------------|
| id          | Integer PK   | autoincrement       |
| name        | String(256)  | NOT NULL            |
| description | String(512)  | nullable            |

### Building (buildings)
Здание внутри комплекса.

| Поле            | Тип              | Ограничения                     |
|-----------------|------------------|---------------------------------|
| id              | Integer PK       | autoincrement                   |
| name            | String(256)      | NOT NULL                        |
| image_url       | String(255)      | nullable                        |
| floor_count     | Integer          | NOT NULL, > 0                   |
| base_price      | Numeric(20,2)    | NOT NULL, > 0 (цена за м²)      |
| price_unit      | String(10)       | NOT NULL, default="UZS"         |
| max_coefficient | Numeric(20,2)    | NOT NULL, > 0                   |
| complex_id      | FK → complexes   | NOT NULL, CASCADE DELETE        |

**Связи:** `building_coefficients` (1:N), `apartments` (1:N)

### Apartment (apartments)
Квартира в здании.

| Поле        | Тип            | Ограничения                          |
|-------------|----------------|--------------------------------------|
| id          | Integer PK     | autoincrement                        |
| number      | String(256)    | NOT NULL                             |
| floor       | Integer        | NOT NULL                             |
| area        | Numeric(20,2)  | NOT NULL, > 0                        |
| room_count  | Integer        | NOT NULL, > 0                        |
| final_price | Numeric(20,2)  | NOT NULL, default=0.00               |
| status      | String(100)    | NOT NULL, default="built"            |
| building_id | FK → buildings | NOT NULL, CASCADE DELETE             |

**Статусы квартиры:** `built`, `upcoming`, `in_progress`

**Связи:** M2M с `BuildingCoefficientType` через таблицу `apartment_coefficients`

### BuildingCoefficient (building_coefficients)
Категория коэффициента (например: «Этаж», «Вид», «Планировка»).

| Поле        | Тип          | Ограничения                          |
|-------------|--------------|--------------------------------------|
| id          | Integer PK   | autoincrement                        |
| name        | String(256)  | NOT NULL                             |
| building_id | FK → buildings | NOT NULL, CASCADE DELETE           |

**Уникальность:** `(building_id, name)`

### BuildingCoefficientType (building_coefficient_types)
Конкретное значение коэффициента (например: «Высокий этаж: +15%»).

| Поле           | Тип            | Ограничения                   |
|----------------|----------------|-------------------------------|
| id             | Integer PK     | autoincrement                 |
| name           | String(256)    | NOT NULL                      |
| rate           | Numeric(20,2)  | NOT NULL (процент влияния)    |
| coefficient_id | FK → building_coefficients | NOT NULL, CASCADE |

**Уникальность:** `(coefficient_id, name)`

### User (users)

| Поле            | Тип          | Ограничения           |
|-----------------|--------------|-----------------------|
| id              | Integer PK   | autoincrement         |
| fullname        | String(100)  | NOT NULL              |
| phone           | String(100)  | NOT NULL              |
| username        | String(256)  | NOT NULL, UNIQUE      |
| hashed_password | String(512)  | —                     |
| is_superuser    | Boolean      | default=False         |
| role_id         | FK → roles   | nullable, SET NULL    |

### Role (roles)

| Поле | Тип         | Ограничения      |
|------|-------------|------------------|
| id   | Integer PK  | autoincrement    |
| name | String(256) | NOT NULL, UNIQUE |

**Связи:** M2M с `Permission` через `role_permission`

### Permission (permissions)

| Поле     | Тип         | Ограничения      |
|----------|-------------|------------------|
| id       | Integer PK  | autoincrement    |
| label    | String(256) | nullable, UNIQUE |
| codename | String(256) | NOT NULL, UNIQUE |

---

## API Эндпоинты

Все эндпоинты (кроме `/auth/`) требуют Bearer token в заголовке `Authorization`.

### Auth — `/auth`

| Метод | Путь         | Описание                          | Права  |
|-------|--------------|-----------------------------------|--------|
| POST  | /token/      | Получить access + refresh токены  | Нет    |
| POST  | /refresh/    | Обновить токены по refresh token  | Нет    |
| GET   | /me          | Получить данные текущего юзера    | Любой  |

**POST /auth/token/** принимает `application/x-www-form-urlencoded`:
```
grant_type=password&username=...&password=...
```

**Ответ:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

Токены кодируются HS256. Access: 360 мин, Refresh: 120 мин. Payload содержит `sub` (user_id), `username`, `exp`, `refresh`.

---

### Complexes — `/complexes`

| Метод  | Путь              | Право               |
|--------|-------------------|---------------------|
| GET    | /                 | view_complexes      |
| POST   | /add/             | create_complexes    |
| GET    | /{complex_id}/    | view_complexes      |
| PATCH  | /{complex_id}/    | update_complexes    |
| DELETE | /{complex_id}/    | delete_complexes    |

**Фильтры (GET /):** поддерживает `ComplexFilter` (поиск по имени и др.)

---

### Buildings — `/buildings`

| Метод  | Путь                  | Право            |
|--------|-----------------------|------------------|
| GET    | /                     | view_buildings   |
| POST   | /add/                 | create_buildings |
| GET    | /{building_id}/       | view_buildings   |
| PATCH  | /{building_id}/       | update_buildings |
| DELETE | /{building_id}/       | delete_buildings |
| PATCH  | /{building_id}/image  | (без проверки прав) |

**PATCH /image** — загрузка изображения здания (`UploadFile`). Файл сохраняется локально в `IMAGES_DIR`. Статика доступна по `/images/`.

---

### Apartments — `/apartments`

| Метод  | Путь                    | Право              |
|--------|-------------------------|--------------------|
| GET    | /                       | view_apartments    |
| POST   | /add/                   | create_apartments  |
| GET    | /{apartment_id}/        | view_apartments    |
| PATCH  | /{apartment_id}/        | update_apartments  |
| DELETE | /{apartment_id}/        | delete_apartments  |
| POST   | /bulk-create/           | create_apartments  |

**POST /bulk-create/** — массовое создание квартир из Excel-файла (`.xlsx`):
- Обязательные колонки: `number`, `floor`, `area`, `room_count`
- Дополнительные колонки — названия `BuildingCoefficientType`
- Параметр `building_id` передаётся как query param
- При частичных ошибках возвращает HTTP 207 с полем `errors`
- При успехе автоматически пересчитывает `final_price` для каждой квартиры

**Алгоритм расчёта `final_price`:**
```
each_bct_rate = max_coefficient / count(bct_ids)
total_rate = sum(each_bct_rate * bct.rate / 100)
final_price = base_price * (1 + total_rate / 100)
```

---

### Coefficients — `/coefficients`

| Метод  | Путь                  | Право                         |
|--------|-----------------------|-------------------------------|
| GET    | /                     | view_building_coefficients    |
| POST   | /add/                 | create_building_coefficients  |
| GET    | /{coefficient_id}/    | view_building_coefficients    |
| PATCH  | /{coefficient_id}/    | update_building_coefficients  |
| DELETE | /{coefficient_id}/    | delete_building_coefficients  |

### Coefficient Types — `/coefficient-types`

| Метод  | Путь                       | Право                              |
|--------|----------------------------|------------------------------------|
| GET    | /                          | view_building_coefficient_types    |
| POST   | /add/                      | create_building_coefficient_types  |
| GET    | /{coefficient_type_id}/    | view_building_coefficient_types    |
| PATCH  | /{coefficient_type_id}/    | update_building_coefficient_types  |
| DELETE | /{coefficient_type_id}/    | delete_building_coefficient_types  |

### Coefficients Common — `/coefficients-common`

| Метод | Путь                                      | Права (оба)                                                    |
|-------|-------------------------------------------|----------------------------------------------------------------|
| GET   | /bcs-with-bcts-by-building-id/{building_id}/ | view_building_coefficient_types + view_building_coefficients |

Возвращает все категории коэффициентов здания вместе с их типами (вложенная структура).

---

### Calculator — `/calculator`

| Метод | Путь                  | Описание                   |
|-------|-----------------------|----------------------------|
| POST  | /{apartment_id}/      | Расчёт рассрочки квартиры  |

**Query параметр:** `first_investment_type` — `percentage` или `amount`

**Тело запроса:**
```json
{
  "first_investment_rate": 30,
  "first_payment_date": "2026-03-01",
  "period_count": 24
}
```

**Формула аннуитетного платежа:**
```
MP = monthly_payment_rate = (20% / 100) / 12
CS = total_price - first_payment_amount
payment_per_period = CS * MP / (1 - (1 + MP)^(-period_count))
```

**Ответ:**
```json
{
  "block": "B02",
  "floor": 3,
  "area": 65.5,
  "first_investment_rate": 30,
  "first_payment_date": "2026-03-01",
  "period_count": 24,
  "old_price_per_sqrm": 1800.00,
  "new_price_per_sqrm": 2104.10,
  "old_total_price": 117900.00,
  "new_total_price": 137818.56,
  "monthly_payment": 4490.78,
  "payment_dates": ["2026-03-01", "2026-04-01", ...]
}
```

Даты платежей генерируются с учётом различной длины месяцев (28/29/30/31 дней).

---

### Users — `/users`

| Метод  | Путь         | Право        |
|--------|--------------|--------------|
| GET    | /            | view_users   |
| POST   | /create/     | create_users |
| GET    | /{user_id}   | view_users   |
| PATCH  | /{user_id}   | update_users |
| DELETE | /{user_id}   | delete_users |

### Roles — `/roles`

| Метод  | Путь         | Право        |
|--------|--------------|--------------|
| GET    | /            | view_roles   |
| POST   | /create/     | create_roles |
| GET    | /{role_id}   | view_roles   |
| PATCH  | /{role_id}   | update_roles |
| DELETE | /{role_id}   | delete_roles |

### Permissions — `/permissions`

| Метод  | Путь               | Право              |
|--------|--------------------|--------------------|
| GET    | /                  | view_permissions   |
| POST   | /create/           | create_permissions |
| GET    | /{permission_id}   | view_permissions   |
| PATCH  | /{permission_id}   | update_permissions |
| DELETE | /{permission_id}   | delete_permissions |

---

## Система авторизации (RBAC)

Права проверяются через зависимости FastAPI:

- `has_permission(codename)` — пропускает суперпользователей; для остальных проверяет наличие права в роли пользователя. Если права нет — HTTP 403.
- `has_permissions(list[codename])` — проверяет наличие **всех** перечисленных прав одновременно.

**Суперпользователь** (`is_superuser=True`) — имеет доступ ко всем эндпоинтам без проверки прав.

Список всех codename прав:
```
view_apartments, create_apartments, update_apartments, delete_apartments
view_buildings, create_buildings, update_buildings, delete_buildings
view_complexes, create_complexes, update_complexes, delete_complexes
view_building_coefficients, create_building_coefficients, update_building_coefficients, delete_building_coefficients
view_building_coefficient_types, create_building_coefficient_types, update_building_coefficient_types, delete_building_coefficient_types
view_users, create_users, update_users, delete_users
view_roles, create_roles, update_roles, delete_roles
view_permissions, create_permissions, update_permissions, delete_permissions
```

---

## Архитектурный паттерн Backend

Каждый модуль следует слоистой архитектуре:

```
Router → Manager → Repository → SQLAlchemy Model
```

- **Router** — FastAPI эндпоинт, зависимости, HTTP-специфика
- **Manager** — бизнес-логика, оркестрация операций
- **Repository** — запросы к БД
- **Schema** — Pydantic модели (валидация входа/выхода)
- **Filter** — fastapi-filter фильтрация GET-списков
- **Validations** — дополнительные бизнес-валидации

---

## Celery

Задачи: `celery_app/tasks/bulk_create_apartments_task.py`

Задача `bulk_create_apartment` в данный момент является заглушкой. Основная логика массового создания реализована синхронно прямо в роутере.

---

# FRONTEND

## Стек технологий

| Компонент      | Технология                      |
|----------------|---------------------------------|
| Фреймворк      | Next.js 16.2 (App Router)       |
| Язык           | TypeScript 5.9                  |
| UI компоненты  | Radix UI + shadcn/ui            |
| Стилизация     | Tailwind CSS 4                  |
| Серверное состояние | TanStack Query v5          |
| Формы          | React Hook Form + Zod           |
| Уведомления    | Sonner                          |
| Анимации       | Lottie React                    |
| Иконки         | Lucide React + React Icons      |
| PDF            | react-to-print                  |
| Куки           | cookies-next                    |
| Пакетный менеджер | pnpm                         |
| Линтер/формат  | Biome + ESLint                  |

## Структура проекта

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Страница входа
│   │   └── register/page.tsx       # Страница регистрации
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Общий layout дашборда
│   │   ├── complex/
│   │   │   ├── page.tsx            # Список объектов (комплексов)
│   │   │   └── [id]/page.tsx       # Детали комплекса
│   │   ├── buildings/
│   │   │   ├── page.tsx            # Список зданий
│   │   │   └── [id]/page.tsx       # Детали здания + коэффициенты
│   │   ├── apartments/
│   │   │   ├── page.tsx            # Список квартир
│   │   │   └── [id]/page.tsx       # Детали квартиры
│   │   ├── calculator-system/
│   │   │   └── page.tsx            # Калькулятор рассрочки
│   │   └── management/
│   │       └── page.tsx            # Управление (пользователи, роли)
│   ├── layout.tsx                  # Корневой layout
│   ├── page.tsx                    # Редирект на /complex
│   ├── globals.css
│   ├── robots.ts
│   └── sitemap.ts
├── action/                         # API-вызовы и хуки
│   ├── auth/                       # Server Actions: login, logout, me
│   ├── apartaments/                # CRUD API для квартир
│   ├── buildings/                  # CRUD API для зданий
│   ├── complex/                    # CRUD API для комплексов
│   ├── coefficient/                # CRUD API для коэффициентов
│   ├── coefficient-types/          # CRUD API для типов коэффициентов
│   ├── calculator/                 # API расчёта рассрочки
│   ├── permissions/                # CRUD API для прав
│   ├── roles/                      # CRUD API для ролей
│   ├── users/                      # CRUD API для пользователей
│   ├── create-excel/               # Массовое создание из Excel
│   └── hooks/                      # TanStack Query хуки (useQuery/useMutation)
├── components/
│   ├── aside/_aside.tsx            # Боковое меню навигации
│   ├── header/_header.tsx          # Шапка приложения
│   ├── layouts/dashboard-layout/   # Обёртка дашборда
│   ├── main/_main.tsx              # Основная область контента
│   ├── lottie-animations/          # Lottie-анимации загрузки
│   ├── shared/
│   │   ├── auth-forms/             # Форма входа
│   │   ├── calculator-client/      # Клиентский калькулятор
│   │   ├── report-pdf/             # Шаблон PDF-отчёта
│   │   ├── nav-link.ts             # Конфиг навигации
│   │   └── ui-demo/
│   │       ├── filters/            # Компоненты фильтров таблиц
│   │       ├── management-tables/  # Таблицы управления (users, roles, permissions)
│   │       ├── modals/             # Модальные окна (CRUD)
│   │       ├── table-apartments/   # Таблица квартир
│   │       ├── table-buildings/    # Таблица зданий
│   │       ├── table-obects/       # Таблица объектов
│   │       ├── tabs/               # Табы (building, management)
│   │       ├── patch-status/       # Изменение статуса квартиры
│   │       ├── debounce-input/     # Инпут с дебаунсом
│   │       └── spinner-demo/       # Спиннер загрузки
│   └── ui/                         # shadcn/ui базовые компоненты
├── configs/
│   └── env.config.ts               # Конфиг окружения (PUBLIC_API_URL)
├── lib/
│   ├── api.util.ts                 # Утилита createSearchParams
│   ├── auth.util.ts                # getAuthData (Server-side)
│   ├── cn.ts                       # Утилита cn (tailwind-merge + clsx)
│   └── query-keys.ts               # Ключи TanStack Query
├── middleware.ts                   # Next.js middleware (защита роутов)
├── providers/
│   └── query-provider.tsx          # QueryClientProvider
├── types/                          # TypeScript типы
└── utils/
    └── get-imgUrl.ts               # Утилита формирования URL изображения
```

---

## Навигация

Боковое меню (`_aside.tsx`) содержит 5 пунктов:

| Иконка                   | Название     | Путь                  |
|--------------------------|--------------|-----------------------|
| FaBuilding               | Объекты      | `/complex`            |
| HiMiniBuildingOffice2    | Здания       | `/buildings`          |
| AiOutlineApartment       | Квартиры     | `/apartments`         |
| FaCalculator             | Расчет       | `/calculator-system`  |
| FaUsers                  | Управление   | `/management`         |

---

## Аутентификация (Frontend)

### Поток входа

1. Пользователь заполняет форму на `/login`
2. Вызывается Server Action `loginAction(formData)`
3. Server Action отправляет `POST /auth/token` с `application/x-www-form-urlencoded`
4. При успехе устанавливаются **HttpOnly cookies**:
   - `access_token` — 24 часа
   - `refresh_token` — 7 дней
5. Редирект на `/complex`

### Middleware защита

Файл `middleware.ts` перехватывает запросы:
- Если нет `access_token` cookie → редирект на `/login`
- Если есть токен и пользователь идёт на `/login` → редирект на `/complex`

Защищённые маршруты: все пути, начинающиеся с `/complex`.

### Server-side получение токена

`getAuthData()` в `lib/auth.util.ts` — Server Function, читает cookies и возвращает `{ access, refresh, user }`. При отсутствии токена вызывает `redirect("/login")`.

---

## Работа с API (Client-side)

### Паттерн API-функций

Все функции в `action/*/` принимают токен через `getAuthData()` и делают `fetch` напрямую к бэкенду.

Пример (Client API):
```typescript
// action/complex/get-complexes.api.ts
const { access } = await getAuthData();
const res = await fetch(`${ENV.PUBLIC_API_URL}/complexes/`, {
  headers: { Authorization: `Bearer ${access}` }
});
```

### TanStack Query хуки

Каждая сущность имеет набор хуков в `action/hooks/`:

| Хук                      | Тип      | Назначение                  |
|--------------------------|----------|-----------------------------|
| `useComplexes()`         | useQuery | Список комплексов           |
| `useBuildings(params)`   | useQuery | Список зданий с фильтрами   |
| `useApartments(params)`  | useQuery | Список квартир с фильтрами  |
| `useCalculatePricing()`  | useMutation | Расчёт рассрочки         |
| `useCreateComplex()`     | useMutation | Создать комплекс          |
| `useUpdateBuilding()`    | useMutation | Обновить здание           |
| `useDeleteApartment()`   | useMutation | Удалить квартиру          |
| и т.д.                   |          |                             |

Конфигурация `QueryClient`: `mutations.retry = false` (мутации не повторяются при ошибке).

---

## Страницы и компоненты

### `/complex` — Объекты (жилые комплексы)

- Server Component загружает список комплексов при рендере
- `TableObjects` — таблица с колонками: название, описание, действия
- Модальные окна: создать / редактировать / удалить комплекс

### `/buildings` — Здания

- Server Component загружает список зданий
- `TableBuildings` — таблица зданий с фильтрацией по комплексу
- Каждая строка → ссылка на `/buildings/[id]`

### `/buildings/[id]` — Детали здания

Два таба:

**Таб «Информация о здании»:**
- Изображение здания
- Комплекс, название, количество этажей, максимальный коэффициент, базовая цена
- Кнопки: редактировать, удалить

**Таб «Конфигурация коэффициентов»:**
- Список категорий коэффициентов (`BuildingCoefficient`)
- Для каждой категории — список типов (`BuildingCoefficientType`) с их `rate`
- Модальные окна: добавить категорию, добавить тип в категорию, редактировать/удалить

### `/apartments` — Квартиры

- `TableApartments` — таблица с колонками: номер, этаж, площадь, комнат, статус, цена за м², коэффициенты
- Фильтры: по зданию, этажу, статусу, диапазону площади
- Действия: добавить квартиру, редактировать, удалить, изменить статус
- **Массовый импорт из Excel** — кнопка «Загрузить Excel», открывает модальное окно с выбором файла и здания

### `/calculator-system` — Калькулятор

Интерактивный расчёт стоимости с рассрочкой:

**Форма (слева):**
1. Выбор комплекса → выбор здания → выбор квартиры (каскадные select)
2. Тип взноса: процент (%) или фиксированная сумма
3. Ставка первоначального взноса (слайдер 0–100% или числовое поле)
4. Срок рассрочки (слайдер 1–60 месяцев)
5. Дата первого платежа
6. Кнопки: «Рассчитать стоимость», «Сбросить»

**Результат (справа):**
- Карточка «Ежемесячный платеж» (крупно)
- Число оплаты в месяце
- Итоговая сводка: площадь, цена за м², первоначальный взнос, срок, итого
- После расчёта — кнопка «Скачать PDF отчёт»

**PDF-отчёт** генерируется через `react-to-print` из скрытого компонента `ReportTemplate`.

### `/management` — Управление

Два таба:

**Таб «Таблица пользователей»:**
- Список пользователей с полями: ФИО, телефон, логин, роль
- Действия: создать, редактировать, удалить пользователя

**Таб «Управление ролями»:**
- Список ролей
- Для каждой роли — назначенные разрешения
- Действия: создать роль (с выбором прав), редактировать, удалить

---

## TypeScript типы

### IApartment
```typescript
interface IApartment {
  id: number;
  number: string;
  floor: number;
  area: string;
  room_count: number;
  status: "built" | "upcoming" | "in_process";
  final_price: string;
  building_id: number;
  bct_ids: number[];
}
```

### IBuildings
```typescript
interface IBuildings {
  id: number | string;
  name: string;
  floor_count: number | string;
  price_unit: string;
  max_coefficient: number;
  base_price: string | number;
  complex_id: number | string;
  image_url?: string;
}
```

### CalculatePricingPayload / CalculatePricingResponse
```typescript
interface CalculatePricingPayload {
  first_investment_rate: number;
  first_payment_date: string;  // "YYYY-MM-DD"
  period_count: number;
}

interface CalculatePricingResponse {
  block: string;
  floor: number;
  area: number;
  first_investment_rate: number;
  first_payment_date: string;
  period_count: number;
  old_price_per_sqrm: number;
  new_price_per_sqrm: number;
  old_total_price: number;
  new_total_price: number;
  monthly_payment: number;
  payment_dates: string[];
}
```

---

## Конфигурация окружения (Frontend)

`src/configs/env.config.ts`:
```typescript
export const ENV = {
  PUBLIC_API_URL: "http://192.168.1.189:8001",
};
```

Для продакшена значение нужно передавать через переменную окружения `NEXT_PUBLIC_API_URL`.

---

## Alembic — История миграций

| Версия      | Описание                                         |
|-------------|--------------------------------------------------|
| 0c3a6487    | Initial — создание базовых таблиц                |
| 847eb576    | Добавлены поля `fullname`, `phone` в User        |
| 2bc2d7c5    | Добавлен статус квартиры (`status`)              |
| be2a1b06    | Добавлен `image_url` в Building                  |
| 76168cd6    | CHECK: `base_price > 0`                          |
| a927d905    | CHECK: `floor_count > 0`                         |
| 45b69780    | CHECK: `max_coefficient > 0`                     |
| 04c68d92    | CHECK: `room_count > 0`                          |
| fab5b6cc    | CHECK: `area > 0`                                |
| 033cda7d    | UNIQUE: `(building_id, name)` для коэффициентов  |
| 00ee5bc6    | UNIQUE: `codename` для Permission                |
| e6f39498    | Добавлен `label` в Permission                    |
| f3e05a54    | Удалён `name` из Permission                      |
| f83d709a    | `complex_id` в Building стал NOT NULL            |
| 14918078    | `building_id` в Apartment стал NOT NULL          |

---

## Запуск (локально)

### Backend
```bash
cd backend
pip install -r requirements.txt
# Создать .env с DATABASE_URL, ASYNC_DATABASE_URL, SECRET_KEY
alembic upgrade head
python scripts/create_superuser.py  # создать суперпользователя
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### Docker (продакшн)
```bash
# Создать .env в корне проекта
docker-compose -f docker-compose.prod.yml up -d
```
