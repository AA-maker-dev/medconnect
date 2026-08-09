# MedConnect — Doctor Patient Portal

A full-stack healthcare platform connecting patients and doctors:
disease-based doctor recommendations, appointment booking, real-time
per-appointment messaging, prescriptions, reviews, and Nepal-focused
payments (eSewa, FonePay).

> **Status:** Phase 1 of 11 — architecture, schema, and design system.
> See [`docs/ROADMAP.md`](docs/ROADMAP.md) for what's built vs. planned.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind + Framer Motion + React Query |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Realtime | Socket.io |
| Auth | JWT (access + refresh), bcrypt |
| Storage | Cloudinary |
| Payments | eSewa, FonePay |

## Project structure

```
doctor-patient-portal/
├── frontend/
│   ├── src/
│   │   ├── components/{ui,layout,shared,forms}
│   │   ├── pages/{public,auth,patient,doctor,admin}
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/        # axios instances, API calls per resource
│   │   ├── utils/
│   │   ├── types/
│   │   └── styles/tokens.css # design system source of truth
│   ├── tailwind.config.ts
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── socket/
│   │   ├── validators/      # zod schemas
│   │   ├── jobs/            # reminders, cron-style tasks
│   │   ├── config/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed/index.ts
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
├── docker-compose.yml
└── README.md
```

## Local setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use the provided Docker Compose)
- npm

### Option A — Docker (recommended, one command)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# edit backend/.env with real secrets before going to production

docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Postgres: localhost:5432

### Option B — Manual

```bash
# 1. Database
createdb medconnect   # or use Docker: docker run -d -p 5432:5432 postgres:16-alpine

# 2. Backend
cd backend
cp .env.example .env        # fill in DATABASE_URL, JWT secrets, etc.
npm install
npm run prisma:generate
npm run prisma:migrate      # creates tables
npm run prisma:seed         # seeds specializations + diseases
npm run dev                 # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Design system

All visual tokens (color, type, spacing, shadow, motion) live in
[`frontend/src/styles/tokens.css`](frontend/src/styles/tokens.css) as
CSS custom properties, and are mapped into Tailwind via
[`tailwind.config.ts`](frontend/tailwind.config.ts). Never hardcode a
hex value or px size in a component — extend the tokens instead. See
`docs/ARCHITECTURE.md` for the reasoning behind the palette and
typography choices.

## Database schema

Full schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).
Covers users/auth, doctor/patient/admin profiles, specializations &
diseases, appointments, per-appointment chat rooms & messages,
prescriptions & lab reports, reviews, payments/invoices/wallet, and
notifications. See `docs/ARCHITECTURE.md §2` for why it's shaped this
way.

