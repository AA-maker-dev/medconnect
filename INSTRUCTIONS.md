# Phase 5 + Auth Redesign — Update Instructions

This zip contains **only new or changed files**, at the exact path they
belong to inside your existing `medconnect-phase1-to-4` project. It does
NOT contain the full project — copy these into your existing folder,
overwriting where a file already exists.

## How to apply

From inside this extracted update folder:

```bash
# Adjust the destination path to wherever your project actually lives
cp -r backend/. ~/Github/medconnect-phase1-to-4/backend/
cp -r frontend/. ~/Github/medconnect-phase1-to-4/frontend/
cp -r docs/. ~/Github/medconnect-phase1-to-4/docs/
```

That's it — every file below either already existed at that exact path
(and gets overwritten) or is brand new (and gets created, along with the
`doctor/` pages folder if it doesn't exist yet).

## What changed and why

### 1. Auth pages redesign

| File | What changed |
|---|---|
| `frontend/src/layouts/AuthLayout.tsx` | Fully rebuilt — animated gradient mesh background, floating "verified doctors / rating / patient count" badges, glass-style form card, reused the landing page's animated "vitals trace" line for brand continuity |
| `frontend/src/components/ui/Input.tsx` | Added an optional `icon` prop (mail, user, phone icons now sit inside fields) |
| `frontend/src/components/ui/PasswordInput.tsx` | Rebuilt with a lock icon and proper flex-based positioning for the show/hide toggle (the old version used a hardcoded pixel offset that could misalign) |
| `frontend/src/components/ui/Select.tsx`, `Button.tsx` | Bumped to a consistent `h-12` / `rounded-lg` scale to match the redesigned inputs |
| `frontend/src/pages/auth/Login.tsx`, `RegisterPatient.tsx`, `RegisterDoctor.tsx`, `AdminLogin.tsx`, `ForgotPassword.tsx`, `RegisterChoice.tsx` | Added contextual icons to fields; `RegisterChoice.tsx` rebuilt with gradient icon tiles and hover motion |

**No backend changes for this part** — purely visual, nothing to migrate or restart beyond the frontend dev server.

### 2. Phase 5 — Doctor Dashboard

**New backend files** (doctor-authenticated API, mounted at `/api/doctor` — singular, deliberately kept separate from the existing public `/api/doctors` directory so `/me/*` routes can't collide with the public `/:id` route):
- `backend/src/middleware/attachDoctorProfile.ts`
- `backend/src/validators/doctor.validator.ts`
- `backend/src/services/doctor.service.ts`
- `backend/src/controllers/doctorDashboard.controller.ts`
- `backend/src/routes/doctorDashboard.routes.ts`

**Modified backend files:**
- `backend/src/routes/index.ts` — registers the new `/doctor` router
- `backend/prisma/seed/index.ts` — adds weekly availability (Mon–Fri, 9–5) for the first two demo doctors, plus one pending appointment request, so the dashboard has real content on first login

**New frontend files** (10 pages matching every dashboard card from the spec — Today's Appointments, Upcoming Patients, Appointment Requests, Patient History, Messages, Wallet, Revenue Analytics, Profile, Availability Schedule, Prescription Management):
- `frontend/src/types/doctorDashboard.types.ts`
- `frontend/src/services/doctorDashboard.service.ts`
- `frontend/src/layouts/DoctorDashboardLayout.tsx`
- `frontend/src/pages/doctor/*.tsx` (12 files: Dashboard, Appointments, Patients, PatientHistory, Messages, Prescriptions, Availability, Revenue, Wallet, Notifications, Profile, Settings)

**Modified frontend file:**
- `frontend/src/App.tsx` — replaces the old doctor-dashboard placeholder route with the real nested route tree

## After copying the files

```bash
cd ~/Github/medconnect-phase1-to-4/backend

# Re-seed to get the new availability slots + pending appointment request
npm run prisma:seed

npm run dev     # restart if it was already running
```

```bash
cd ~/Github/medconnect-phase1-to-4/frontend
npm run dev     # restart to pick up the new routes/pages
```

## Testing it

1. Log in as a **doctor** demo account — any of these work:
   `anjali.shrestha@medconnect.demo`, `rajesh.koirala@medconnect.demo`,
   `sunita.rai@medconnect.demo`, `bikash.thapa@medconnect.demo`,
   `priya.maharjan@medconnect.demo`, `dipesh.gurung@medconnect.demo`
   — password `DemoPass123` for all of them.
2. You should land on `/doctor/dashboard` with real stat cards, not a
   placeholder.
3. `anjali.shrestha@medconnect.demo` specifically has a pending
   appointment request waiting — check the **Appointments → Requests**
   tab to approve/decline it.
4. Check the new login page design at `/login` — the icon-accented
   inputs and animated brand panel should be immediately visible.

## Heads-up on the lucide-react version

Your project uses `lucide-react@^1.24.0` (newer than what I originally
scaffolded). Phase 5 imports several new icons (`LayoutDashboard`,
`CalendarClock`, `ClipboardList`, `LineChart`, `CalendarRange`, `Pill`,
`TrendingUp`, `Percent`, etc.). I can't verify these against the npm
registry from this environment. If `npm run dev` errors with something
like `"X" is not exported by lucide-react`, it's the same class of issue
you already hit and fixed once with `Venus` — check
[lucide.dev/icons](https://lucide.dev/icons) for the current name and
swap it in that one file.
