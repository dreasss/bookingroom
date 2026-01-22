# API Specification (REST)

Base URL: `/api`

## Auth
- OIDC login endpoints are handled by provider redirects; API issues JWT access + refresh tokens.

## Endpoints
### GET /me
Returns current user profile.

### GET /rooms
Query parameters:
- `capacity` (int)
- `equipment` (string key)
- `location` (uuid)
- `available_from` / `available_to` (ISO, optional for future expansion)

### GET /rooms/:id
Room detail.

### POST /bookings
Create booking.

### GET /bookings
Query parameters: `from`, `to`, `room_id`, `mine`

### PATCH /bookings/:id
Update booking time/title/recurrence/buffers.

### POST /bookings/:id/cancel
Cancel booking.

### POST /bookings/:id/checkin
Check-in by QR.

### Admin
- POST /admin/rooms
- PUT /admin/rooms/:id
- DELETE /admin/rooms/:id
- POST /admin/rules
- GET /admin/analytics

## Error Model
- `400` validation error
- `401` unauthorized
- `403` forbidden
- `404` not found
- `409` conflict (overlap)
