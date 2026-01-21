# Booking Room — MVP → v1

## Что это
Система бронирования переговорных и конференц-залов с SSO, календарями и аналитикой.

## Быстрый старт (Docker Compose)
1. Установите Docker Desktop.
2. В терминале выполните:
```bash
docker compose up --build
```
3. Откройте:
   - API: http://localhost:8000/docs
   - Frontend: http://localhost:5173

## Переменные окружения (backend/.env)
```env
APP_NAME=Booking Room
ENVIRONMENT=dev
DATABASE_URL=postgresql+psycopg://booking:booking@db:5432/booking
REDIS_URL=redis://redis:6379/0
JWT_SECRET=change-me
JWT_ISSUER=bookingroom
JWT_AUDIENCE=bookingroom
JWT_EXP_MINUTES=15
REFRESH_EXP_DAYS=30
ALLOWED_DOMAINS=corp.example

OIDC_GOOGLE_CLIENT_ID=
OIDC_GOOGLE_CLIENT_SECRET=
OIDC_GOOGLE_DISCOVERY_URL=https://accounts.google.com/.well-known/openid-configuration

OIDC_MICROSOFT_CLIENT_ID=
OIDC_MICROSOFT_CLIENT_SECRET=
OIDC_MICROSOFT_DISCOVERY_URL=https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration

OIDC_OKTA_CLIENT_ID=
OIDC_OKTA_CLIENT_SECRET=
OIDC_OKTA_DISCOVERY_URL=https://your-okta-domain/.well-known/openid-configuration

OIDC_JINR_CLIENT_ID=
OIDC_JINR_CLIENT_SECRET=
OIDC_JINR_DISCOVERY_URL=https://login.jinr.ru/.well-known/openid-configuration
```

## Архитектура
См. `architecture.md`.

## База данных
См. `schema.sql`.

## API
См. `api.md` или Swagger: `/docs`.

## Production (минимально)
- Запустить API и worker за reverse proxy (nginx/traefik)
- Использовать managed Postgres/Redis
- Включить HTTPS и secure headers
