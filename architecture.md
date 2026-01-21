# Architecture — Booking Room MVP → v1

## Part 0 — Assumptions (non-blocking)
- Employee identity is verified by email domain allowlist (e.g., `@corp.example`).
- Guests can be added as external emails without system accounts.
- Room display operates in kiosk mode with a room-scoped token.
- Rooms have a configured IANA timezone; default is `Europe/Berlin`.
- Recurring bookings are expanded on a rolling horizon (90 days) and cached.
- OAuth/OIDC providers are configured by tenant admin with dedicated client IDs/secrets.

## Stack Selection
**Backend:** FastAPI (Python)
- Strong typing and async support for API + background tasks.
- Excellent ecosystem for OIDC, Postgres, and async workers.
- Great developer velocity for MVP and scaling to v1.

**Queue/Jobs:** Redis + Celery
- Reliable task scheduling and retries.
- Simple integration with FastAPI.

**Frontend:** React + TypeScript + Tailwind + shadcn/ui
- Rapid composition of modern UI.
- Tailwind for design system tokens and dark mode.

## High-Level Modules
### Backend
- `auth`: OIDC login, refresh tokens, RBAC
- `users`: profile and org metadata
- `rooms`: rooms, equipment, building/floor/location
- `bookings`: availability, rules, conflicts, recurrence
- `calendar_sync`: Google/Graph adapters
- `notifications`: email + in-app + push stub
- `analytics`: daily aggregation
- `admin`: policies, room management
- `audit_log`: security-critical actions

### Frontend
- Auth pages
- Dashboard
- Room search + filters
- Room detail
- Booking wizard
- My bookings
- Room display (kiosk)
- Admin console
- Analytics

### Queue Jobs
- Calendar sync (create/update/delete)
- Email delivery
- Auto-release (no-show)
- Recurrence expansion
- Nightly analytics aggregation

## Transaction Strategy (conflict safety)
- Use `tstzrange` exclusion constraint to prevent overlapping bookings.
- Validate buffers in app logic and re-check conflicts in transaction before insert/update.
- If conflicting insert occurs, return `409` and propose alternatives.

## Flow Diagram (ASCII)
```
User -> UI -> API -> Booking Service -> DB
                         |                  
                         v                  
                    Calendar Sync -----> External Calendar
                         |
                         v
                    Notification Worker -> Email/In-app
                         |
                         v
                     Check-in / QR
                         |
                         v
                    Auto-release Worker
```

## Security & Safety
- JWT access tokens + refresh tokens
- RBAC: ADMIN / EMPLOYEE / ROOM_MANAGER
- Rate limiting, secure headers
- Audit logging of sensitive actions

## Deploy
- Docker Compose for dev
- Production: containerized services (API, worker, db, redis, frontend)
