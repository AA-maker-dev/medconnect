# MedConnect — System Architecture (Phase 1)

## 1. High-level shape

```
┌─────────────────┐        HTTPS/REST        ┌──────────────────┐
│   React (Vite)   │ ───────────────────────▶ │  Express API      │
│   TypeScript      │ ◀─────────────────────── │  (TypeScript)     │
│   Tailwind         │        WebSocket         │                  │
│   Framer Motion   │ ◀────────────────────────▶│  Socket.io        │
└─────────────────┘                            └────────┬─────────┘
                                                          │ Prisma
                                                          ▼
                                                ┌──────────────────┐
                                                │   PostgreSQL      │
                                                └──────────────────┘
        │                                               │
        ▼                                               ▼
 ┌──────────────┐                              ┌──────────────────┐
 │  Cloudinary    │                              │  eSewa / FonePay   │
 │  (media)       │                              │  (payments)         │
 └──────────────┘                              └──────────────────┘
```

## 2. Why these boundaries

**Single `User` + role-profile tables, not three separate auth tables.**
Auth (email, password hash, tokens, verification) is identical across
roles, so it lives once. `Patient` / `Doctor` / `Admin` hold only what's
actually different about that role. This means role-switch or
multi-role-per-email edge cases don't require data migration, and JWT
payloads can stay small (`{ userId, role }`) with the profile fetched
on demand.

**Messaging eligibility is enforced by data shape, not application logic.**
Rather than checking "does this patient have an appointment with this
doctor?" on every message send, a `ChatRoom` is a 1:1 child of
`Appointment`. A room cannot exist without an appointment, so the
authorization check collapses to "does the requesting user own one of
the two `userId`s attached to this room's appointment?" — one query,
no relationship table to keep in sync, no way for it to drift out of
sync with appointment cancellation.

**Disease → Specialization → Doctor is a real foreign-key chain, not a
tag or enum.** This is what makes the recommendation engine (Phase 7)
a straightforward query — `Disease.specializationId` — instead of a
lookup table maintained in application code. Admins can add diseases
and specializations without a deploy.

**Money is `Decimal`, never `Float`.** Payments, invoices, wallet
balances, and consultation fees all use Prisma's `Decimal` type mapped
to Postgres `numeric`. This is non-negotiable for anything involving
currency — float rounding errors compound silently across refunds and
wallet transactions.

**Video consultation gets schema fields now, WebRTC later.**
`Appointment.meetingRoomId` / `meetingJoinedAtDoctor` /
`meetingJoinedAtPatient` exist from Phase 1 so the "Join Meeting" /
"Waiting Room" UI in later phases has real state to read, even though
the WebRTC signaling server itself is out of scope until explicitly
requested.

## 3. Request flow example (booking)

1. Patient selects a disease on the frontend →
   `GET /api/diseases/:id/recommended-doctors` (ranks by rating,
   experience, success rate, availability — see Phase 7).
2. Patient picks a slot → `POST /api/appointments` (validates slot
   against `DoctorAvailability` + existing `Appointment`s for
   conflicts, creates `Appointment` with status `PENDING`).
3. Doctor approves → `PATCH /api/appointments/:id/status` → triggers:
   - `Notification` row for patient (type `APPOINTMENT_APPROVED`)
   - `ChatRoom` creation (idempotent, 1:1 with appointment)
   - Socket.io emit to patient's socket if connected, otherwise
     picked up on next poll/login via the notifications endpoint.

## 4. Environments & config

Three environment files drive behavior: `.env` (backend — DB URL, JWT
secrets, Cloudinary keys, eSewa/FonePay merchant credentials, SMTP),
and `frontend/.env` (API base URL, socket URL, public keys only —
never secrets). `.env.example` in both is committed; real `.env` is
gitignored.

## 5. What's deferred to later phases (intentionally)

- Actual controller/route implementations (Phase 2+)
- Socket.io event contracts (Phase 8)
- Payment gateway signature/verification flow (Phase 9)
- PDF generation for prescriptions/invoices (Phase 10)
- Docker multi-stage build optimization, CI (Phase 11)

This phase's job is to make those additions require *editing*, not
*restructuring*.
