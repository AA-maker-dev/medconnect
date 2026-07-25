# Phase 7 (Appointment Booking + Disease-Based Recommendation) — Update Instructions

This zip contains only new or changed files, at their exact project paths.

## How to apply

```bash
cd phase7-output   # wherever you extracted this zip

cp -r backend/. ~/Github/medconnect-phase1-to-4/backend/
cp -r frontend/. ~/Github/medconnect-phase1-to-4/frontend/
cp -r docs/. ~/Github/medconnect-phase1-to-4/docs/
```

## What's in it

### New backend files

- `backend/src/validators/appointment.validator.ts`
- `backend/src/services/appointment.service.ts` — the recommendation engine, slot generation, and booking logic
- `backend/src/controllers/appointment.controller.ts`
- `backend/src/routes/appointment.routes.ts` — mounted at `/api/appointments`

### Modified backend filesDr. Sunita Rai



- `backend/src/controllers/public.controller.ts` — added `GET /api/diseases`
- `backend/src/routes/public.routes.ts` — registers the diseases route
- `backend/src/routes/index.ts` — registers the new `/appointments` router
- `backend/src/middleware/authenticate.ts` — added `optionalAuthenticate`: populates `req.user` if a valid token is present but never blocks the request otherwise. Used so doctor recommendations are browsable by anyone, but personalized (a "you've seen this doctor before" boost) when a patient happens to be logged in.
- `backend/src/controllers/doctor.controller.ts` — unrelated bug fix carried over from Phase 6 review: if you already applied the Phase 6 zip, this file is identical to what you have. If you skipped straight to Phase 7, this brings in the `user.isActive` filter on the public doctor directory.
- `backend/prisma/seed/index.ts` — availability is now seeded for all 6 demo doctors (previously just 2), so booking has real slots across the whole roster

### New frontend files

- `frontend/src/types/appointment.types.ts`
- `frontend/src/services/appointment.service.ts`
- `frontend/src/pages/public/DoctorDirectory.tsx` — replaces the `/doctors` placeholder: real search + specialization filter + sort
- `frontend/src/pages/public/DoctorDetail.tsx` — new `/doctors/:id` route: profile, 14-day date picker, live slot grid, booking form
- `frontend/src/pages/public/Search.tsx` — replaces the `/search` placeholder: disease picker → scored, reasoned doctor recommendations
- `frontend/src/pages/public/BookingConfirmation.tsx` — new `/appointments/:id/confirmation` route

### Modified frontend files

- `frontend/src/types/doctor.types.ts` — added `DoctorDetail`/`DoctorAward`/`DoctorCertificate`/`DoctorAvailabilitySlot` types (the doctor detail endpoint returns more fields than the card-list endpoint)
- `frontend/src/services/doctor.service.ts` — `getDoctorById` now typed against `DoctorDetail`
- `frontend/src/App.tsx` — wires in the new routes, replacing the `/doctors` and `/search` placeholders

## After copying the files

```bash
cd ~/Github/medconnect-phase1-to-4/backend
npm run prisma:seed     # re-seeds availability for all 6 doctors, not just 2
npm run dev

cd ~/Github/medconnect-phase1-to-4/frontend
npm run dev
```

## Testing the booking flow end to end

1. Go to `/search`, type "Heart Disease" (or click it from the grid) — you should see ranked Cardiologists with match scores and reason badges like "Highly rated."
2. Click a doctor → lands on `/doctors/:id` with their full profile and a date strip + slot grid below it.
3. Pick a date, pick a time slot, optionally add a reason for visit, hit **Confirm booking**.
   - If you're not logged in, it redirects to `/login` and brings you back here after.
   - Log in as a patient (`sabina.adhikari@medconnect.demo` / `DemoPass123`) and try again.
4. You land on `/appointments/:id/confirmation` showing status `PENDING`.
5. Log in as that doctor in another browser/incognito window and check **Appointments → Requests** — your new booking should be sitting there, approvable/rejectable (Phase 5 functionality, now actually fed by real bookings instead of only seed data).

## What's deliberately out of scope here

- **Race-condition hardening**: the slot-availability check is application-level (query, then check, then insert), not a database unique constraint on `(doctorId, date, startTime)`. Two truly simultaneous booking requests for the same slot could theoretically both slip through. Worth adding that constraint before any real traffic, but out of scope for this phase.
- **Distance-based ranking**: `Doctor.location` is free text, not coordinates, so real "nearest doctor" sorting needs a geocoding step first. The recommendation scoring function is structured so adding a distance term later is additive.
- **Doctor-side reschedule UI**: the backend already supports rescheduling (`PATCH /doctor/me/appointments/:id/status` with a new date/time), but the Phase 5 Appointments page still only has approve/reject/complete buttons, no date/time picker for reschedule. It can now reuse the slot-picker built in this phase instead of being built from scratch.

## Heads-up on `lucide-react`

Same note as every phase so far — this phase adds `CalendarDays`, `Languages`, `Award`, `Sparkles`, `Clock3`, `Building2`, and a few others. If any error on `npm run dev`, check [lucide.dev/icons](https://lucide.dev/icons) for the current name.
