# Build Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Architecture, folder structure, DB schema, design system, project setup | ✅ Done |
| 2 | Authentication & authorization | ✅ Done |
| 3 | Landing page & responsive UI | ✅ Done |
| 4 | Patient dashboard | ✅ Done |
| 5 | Doctor dashboard | ✅ Done |
| 6 | Admin dashboard | ✅ Done |
| 7 | Appointment booking + disease-based recommendation | ⏳ Next |
| 8 | Real-time Socket.io messaging | Planned |
| 9 | Payments (eSewa, FonePay) | Planned |
| 10 | Prescriptions, reviews, notifications, analytics | Planned |
| 11 | Testing, optimization, Docker hardening, deployment docs | Planned |

## Phase 1 deliverables checklist

- [x] Frontend folder structure (`components`, `pages`, `layouts`, `hooks`, `context`, `services`, `utils`, `types`)
- [x] Backend folder structure (`controllers`, `routes`, `models`, `services`, `middleware`, `prisma`, `socket`, `utils`)
- [x] Complete Prisma schema — 24 models covering auth, profiles, appointments, messaging, prescriptions, reviews, payments/wallet, notifications
- [x] Design token system (`tokens.css`) — color, type, spacing, shadow, motion, dark mode
- [x] Tailwind config wired to tokens
- [x] `docker-compose.yml` + `Dockerfile`s for backend/frontend + Postgres
- [x] `.env.example` for both frontend and backend
- [x] `package.json` for both frontend and backend with full dependency list
- [x] Prisma seed script (specializations + diseases, needed by Phase 7)
- [x] Architecture documentation

## Phase 2 deliverables checklist

- [x] `User`-table-backed auth: register patient, register doctor (pending admin verification), login, admin login
- [x] JWT access tokens (15 min, in-memory on frontend, never localStorage) + refresh tokens (7d / 30d remember-me, httpOnly cookie, rotated + revocable via `RefreshToken` table)
- [x] Refresh-token theft detection: reuse of a revoked token revokes every session for that user
- [x] Email verification via 6-digit OTP, with resend + cooldown
- [x] Forgot password / reset password (single-use, 30-minute expiring token; resets revoke all sessions)
- [x] Change password (authenticated, requires current password)
- [x] Role-based route guards on the backend (`authenticate` + `authorize` middleware) and frontend (`ProtectedRoute` / `PublicOnlyRoute`)
- [x] Security middleware: helmet, CORS w/ credentials, rate limiting (general + strict auth-endpoint limiter + OTP-resend limiter), request-body XSS sanitization, Prisma parameterized queries (SQL-injection-safe by construction)
- [x] Auth pages: login, admin login, register (patient/doctor), OTP verification, forgot/reset password — built on the Phase 1 design tokens
- [x] Socket.io JWT handshake authentication (connection-level only; event handlers arrive in Phase 8)
- [x] Public specialization/hospital endpoints (needed to make the doctor registration form functional)

## Phase 3 deliverables checklist

- [x] Sticky responsive navbar with hamburger drawer (mobile) and full nav (desktop): Home, Doctors, Specialties, About, Contact, Login, Register
- [x] Mobile bottom navigation bar (touch-friendly, fixed, hidden ≥lg)
- [x] Dark mode / light mode toggle, persisted, applied via `data-theme` + the Phase 1 token overrides
- [x] Global toast notification system (`ToastProvider`/`useToast`), animated with Framer Motion
- [x] Hero section: gradient background, floating animated medical icons, doctor/disease search bar, popular-search chips
- [x] Popular Departments (specializations grid, real data)
- [x] Top Rated Doctors, Featured Specialists (one per department), Recently Joined Doctors — all backed by a new `GET /api/doctors` endpoint with `sortBy`/`specializationId`/`limit`, verified-doctors-only
- [x] Animated statistics counters backed by a new `GET /api/stats` endpoint
- [x] Hospital Partners strip (real data from `GET /api/hospitals`)
- [x] Testimonials backed by a new `GET /api/reviews/featured` endpoint (real completed-appointment reviews, patient last name shown as initial only)
- [x] Health Tips (editorial content), Emergency Contact banner, FAQ accordion, Newsletter signup
- [x] Footer with sitemap columns and contact details
- [x] Loading skeletons on every data-fetching section (no layout jump, no spinner-only states)
- [x] Seed script extended with demo hospitals, 6 verified doctors, 3 patients, and completed appointments + reviews so every section above renders real content out of the box (`docs: run npm run prisma:seed`)

## Phase 4 deliverables checklist

- [x] `attachPatientProfile` middleware — resolves the authenticated user's `Patient` row once per request so controllers never re-query it
- [x] Full patient API surface under `/api/patients/me/*`: dashboard summary, profile (get/update), appointments (upcoming/past/all, paginated), medical history (list/create/delete), favorite doctors (list/add/remove), prescriptions (list, with medicines + lab reports), invoices (list), wallet (balance + transactions), notifications (list/mark-read/mark-all-read)
- [x] Fixed a real bug caught during review: the `validate` middleware parsed and coerced `req.query` (numbers, defaults, enums) but never applied the result — pagination params were silently ignored. Now stored on `req.validatedQuery` since `req.query` can be getter-only depending on Express/Node version.
- [x] Reusable `DashboardLayout` (sidebar + topbar) built once, meant to be shared by Phase 5/6's doctor and admin dashboards too — role-specific nav items are just a prop
- [x] `PageTitleContext` so nested dashboard pages can set the topbar title without prop drilling through the router
- [x] All 10 spec'd dashboard cards: Upcoming Appointments, Past Appointments, Medical History, Favorite Doctors, Prescription Downloads, Invoices, Wallet, Notifications, Profile, Settings — each a real page backed by a real endpoint, not a static mock
- [x] Settings page reuses Phase 2's change-password and logout-all-devices endpoints — no new backend work needed there
- [x] Seed script extended again: first demo patient now has an upcoming approved appointment, a favorite doctor, a medical history entry, a notification, a prescription with medicines, an invoice + successful payment, and a wallet welcome-bonus transaction — so logging in as `sabina.adhikari@medconnect.demo` shows a fully populated dashboard immediately

## Auth pages redesign (between Phase 4 and 5)

- [x] `AuthLayout` rebuilt: animated gradient mesh, floating proof badges (verified doctors / rating / patient count), a glass-style form card, and the landing page's "vitals trace" motif reused for brand continuity
- [x] `Input` gained an optional `icon` prop; `PasswordInput` rebuilt with a lock icon and a flex-based show/hide toggle (previously used a fragile hardcoded pixel offset that would misalign if label/height ever changed)
- [x] `Button`/`Select`/`Input` bumped to a consistent `h-12` / `rounded-lg` scale for a slightly more premium feel
- [x] Login, Register (patient/doctor), Admin Login, Forgot Password all got contextual icons (mail, lock, user, phone, graduation cap, badge-check)
- [x] Register-choice screen rebuilt with gradient icon tiles and hover motion instead of flat cards

## Phase 5 deliverables checklist

- [x] `attachDoctorProfile` middleware, mirroring Phase 4's `attachPatientProfile`
- [x] Doctor dashboard API mounted at `/api/doctor` (singular — deliberately separate from the public `/api/doctors` directory to avoid the `/:id` route swallowing `/me/*` requests)
- [x] Dashboard summary, profile (get/update), appointments (today/upcoming/requests/history, paginated), appointment status updates (approve/reject/reschedule/complete/cancel — each triggers a patient notification, and approval auto-creates the Phase 8 chat room), unique-patients list + per-patient history, revenue analytics (monthly bucketed, completion rate), availability schedule (add/list/delete), wallet, prescriptions (list/create), notifications (list/mark-read/mark-all-read)
- [x] All 10 spec'd doctor dashboard cards: Today's Appointments, Upcoming Patients, Appointment Requests, Patient History, Messages, Wallet, Revenue Analytics, Profile, Availability Schedule, Prescription Management
- [x] Revenue Analytics page includes a real bar chart (recharts) of monthly revenue, not just numbers
- [x] Messages page is an honest placeholder explaining Phase 8 scope rather than a dead link or fake UI
- [x] Seed script extended: weekly availability (Mon–Fri, 9–5) for the first two demo doctors, plus one pending appointment request so "Appointment Requests" has something to act on immediately

## Phase 6 deliverables checklist

- [x] `attachAdminProfile` middleware, mirroring the Patient/Doctor pattern
- [x] Full admin API mounted at `/api/admin`: dashboard summary, patients (list/search/detail/activate-deactivate), doctors (list/search/filter by status/detail/activate-deactivate), doctor verification (approve/reject with a reason that's sent to the doctor as a notification), appointments oversight (filterable by status/date range), payments oversight (filterable, with refund), platform-wide revenue analytics (monthly + by-gateway breakdown), system analytics (patient/doctor growth, appointment volume, specialization distribution), appointment reports (date-range status + revenue breakdown), review moderation (hide/show/delete), notification broadcast (to all/patients/doctors) plus a personal admin inbox
- [x] All 10 spec'd admin dashboard sections: Manage Patients, Manage Doctors, Verify Doctors, Appointments, Reports, Payments, Revenue, System Analytics, Manage Reviews, Manage Notifications
- [x] Revenue page has a real bar chart (monthly trend) and pie chart (gateway breakdown); System Analytics has a dual-line growth chart, a bar chart for appointment volume, and a horizontal-bar specialization distribution
- [x] New shared UI: `Dialog` (used for the reject-doctor reason prompt) and `Pagination` (used across every admin list page)
- [x] Seed script extended: one `PENDING`-verification doctor (`sushil.pending@medconnect.demo`) so Verify Doctors has something to act on, one low-rated review so Manage Reviews has something to moderate, and a demo admin account (`admin@medconnect.demo`)

## Notes for future phases

- Reports currently covers appointment status + revenue breakdown for a date range via `GET /api/admin/reports/appointments`; CSV/PDF export isn't wired yet — the data is there, just needs a download button and a server-side CSV writer (straightforward addition, deliberately deferred to avoid scope creep here).
- Payment refunds update the `Payment` row (`status: REFUNDED`, `refundedAmount`, `refundedAt`) but don't yet call out to eSewa/FonePay's actual refund API — that's real Phase 9 (Payments integration) territory; today's refund is an internal record-keeping action.
- Doctor deactivation (`setDoctorActive`) flips `User.isActive`, which `login` already checks — a deactivated doctor is immediately locked out. The public `/api/doctors` directory now also filters on `user.isActive`, not just `verificationStatus`, so a deactivated doctor's profile disappears from public listings immediately too (fixed during this phase's review, not deferred).

- Doctor "Add prescription" from the Appointments/history tab currently just shows a button — full inline creation from that context (vs. the dedicated Prescriptions page) can be wired later; the dedicated page's create flow is fully functional today.
- Reschedule is implemented in the backend (`updateAppointmentStatus` accepts `date`/`startTime`/`endTime` when status is `RESCHEDULED`) but the frontend Appointments page doesn't yet have a reschedule UI (date/time picker) — only approve/reject/complete buttons. Worth adding alongside Phase 7's slot-picking UI, since they'll share a component.
- `/doctor/appointments` "Mark completed" doesn't yet prompt for a prescription — a natural follow-up affordance once the two flows are visually connected.

- `/patient/appointments` has "Join" (video), "Prescription", and "Leave review" buttons rendered conditionally, but they're not wired to real actions yet — video join needs Phase 8/WebRTC groundwork, review submission needs a POST endpoint that Phase 10 (Reviews) will add.
- Booking a *new* appointment isn't in Phase 4 — "Find a doctor" / "Book now" buttons currently link to the still-placeholder `/doctors` directory. Phase 7 (booking + recommendation engine) is where these become real.
- The `DashboardLayout`/`DashboardSidebar`/`DashboardTopbar` trio was deliberately built generic (nav items as props) specifically so Phases 5 and 6 can reuse it instead of rebuilding a parallel doctor/admin shell.

- `/doctors`, `/specialties`, `/about`, `/contact`, and `/search` currently render placeholders reachable from the navbar/footer/bottom-nav — Phase 4+ (and a dedicated search/directory build) should replace these with real pages. The hero search bar already routes to `/search?q=...`, so that's the first one worth building.
- `GET /api/doctors` supports `specializationId` filtering today; the disease-based recommendation ranking (rating + success rate + availability + patient history) described in the original spec is still Phase 7 scope — Phase 3's sort options (`rating`/`recent`/`experience`) are a simpler stand-in.
- Demo seed accounts (doctors and patients) all share the password `DemoPass123` — seed-only, never use this pattern for real accounts.
- Doctor accounts are created with `verificationStatus: PENDING` and cannot log in until an admin approves them (Phase 6 builds that admin action) — login already enforces this. Seeded demo doctors are created pre-verified so Phase 3 has content to show.
- `DoctorAvailability` uses day-of-week + time strings rather than
  concrete calendar rows — Phase 7 will need a slot-generation
  function that expands this into bookable slots for a given date
  range, checked against existing `Appointment`s.
- Chat room creation is not yet automated on appointment approval —
  that hook belongs in the Phase 7 appointment-status controller.
- SMS OTP is architecture-ready (`SMS_PROVIDER` env var) but not wired to a real provider yet — email OTP is fully functional today.
