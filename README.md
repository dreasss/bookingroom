# Conference Talk Upload Terminal (production-oriented MVP)

Monorepo:
- `apps/api` — NestJS API + Swagger + Prisma + RBAC/JWT + throttling.
- `apps/web` — Next.js (App Router) kiosk/admin/phone-upload UI with RU/EN toggle and offline queue.
- `apps/worker` — BullMQ workers (antivirus/preview/zipInspect/housekeeping stubs).
- `infra` — MinIO init scripts.

## Repository tree

```text
.
├── apps
│   ├── api
│   │   ├── prisma
│   │   │   ├── migrations/202610120001_init/migration.sql
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src
│   │   │   ├── admin/admin.controller.ts
│   │   │   ├── audit/{audit.controller.ts,audit.service.ts}
│   │   │   ├── auth/{auth.controller.ts,auth.service.ts}
│   │   │   ├── branding/branding.controller.ts
│   │   │   ├── help/help.controller.ts
│   │   │   ├── prisma/prisma.service.ts
│   │   │   ├── queue/queue.service.ts
│   │   │   ├── sessions/sessions.controller.ts
│   │   │   ├── terminals/terminals.controller.ts
│   │   │   ├── uploads/{uploads.controller.ts,upload.policy.ts,phone-token.store.ts,zip-guard.ts}
│   │   │   ├── webhooks/webhooks.controller.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/upload.policy.spec.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── web
│   │   ├── src/app
│   │   │   ├── admin/page.tsx
│   │   │   ├── kiosk/page.tsx
│   │   │   ├── phone-upload/page.tsx
│   │   │   ├── api/**/route.ts
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │   ├── src/lib/offline-queue.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   └── worker
│       ├── src/worker.ts
│       ├── Dockerfile
│       └── package.json
├── infra/minio/init/create-bucket.sh
├── docker-compose.yml
└── .env.example
```

## Local run

```bash
cp .env.example .env
docker compose up --build
```

URLs:
- API Swagger: `http://localhost:8000/api/docs`
- Kiosk/Admin: `http://localhost:3000/kiosk` and `http://localhost:3000/admin`
- MinIO console: `http://localhost:9001`

## DB migration + seed

```bash
docker compose exec backend npm run prisma:migrate
docker compose exec backend npm run prisma:seed
```

Seed creates:
- Admin user: `admin@conference.local` / `admin12345`
- Demo conference + brand kit + terminal + session + upload.

## Where to change key config
- Brand kit and theme tokens: `apps/api/src/branding/branding.controller.ts` and DB `BrandKit`.
- Limits/deadline/allowed formats: `POST /api/uploads/init` response constraints and `apps/api/src/uploads/upload.policy.ts`.
- Feature flags (`key`, `mp4`, `airdrop`): extend constraints + frontend conditional rendering in `apps/web/src/app/kiosk/page.tsx`.

## Offline receipt and re-upload
- Kiosk stores offline packets in browser local storage via `apps/web/src/lib/offline-queue.ts`.
- On network loss user can accept locally and receive `localReceiptId`.
- Hidden volunteer mode (5 taps on logo area) opens offline queue with manual remove/retry hooks.
- In production replace localStorage with IndexedDB + Background Sync (service worker) and retention policy (hours/size).

## Tech Readyboard
- Endpoint: `GET /api/admin/tech/readyboard?conferenceId=...&minutes=60`.
- Combines upcoming sessions and upload/file state:
  - file exists / no file
  - rejected/error/needs match
  - lock-for-show state.

## Web limitations acknowledged
- USB is implemented as browser file chooser; direct USB disk reading is not promised.

## Stubs / extension points
- Queue workers currently log jobs; extend with:
  - ClamAV scan integration in `apps/worker/src/worker.ts`.
  - LibreOffice preview generation in worker and preview upload to S3.
  - Zip deep inspection + extracted files antivirus pipeline using `zip-guard.ts`.
- RBAC guards/JWT strategy are minimal; add Nest guards/decorators for strict role enforcement.
- Webhooks CRUD exists; delivery workers (Telegram/Slack/Generic) should be added in worker.

## Deployment notes
- Build immutable images for `backend`, `worker`, `frontend`.
- Use managed Postgres/Redis and S3.
- Set HTTPS reverse proxy and secure headers.
- Move phone token store from memory to Redis with hashed token and one-time atomic consume.
