Build Roadmap
Phase	Scope	Status
1	Architecture, folder structure, DB schema, design system, project setup	✅ Done
2	Authentication & authorization	✅ Done
3	Landing page & responsive UI	✅ Done
4	Patient dashboard	✅ Done
5	Doctor dashboard	✅ Done
6	Admin dashboard	✅ Done
7	Appointment booking + disease-based recommendation	✅ Done
8	Real-time Socket.io messaging	⏳ Next
9	Payments (eSewa, FonePay)	Planned
10	Prescriptions, reviews, notifications, analytics	Planned
11	Testing, optimization, Docker hardening, deployment docs	Planned

Phase 1 deliverables checklist
·	Frontend folder structure (components, pages, layouts, hooks, context, services, utils, types)
·	Backend folder structure (controllers, routes, models, services, middleware, prisma, socket, utils)
·	Complete Prisma schema — 24 models covering auth, profiles, appointments, messaging, prescriptions, reviews, payments/wallet, notifications
·	Design token system (tokens.css) — color, type, spacing, shadow, motion, dark mode
·	Tailwind config wired to tokens
·	docker-compose.yml + Dockerfiles for backend/frontend + Postgres
·	.env.example for both frontend and backend
·	package.json for both frontend and backend with full dependency list
·	Prisma seed script (specializations + diseases, needed by Phase 7)
·	Architecture documentation
Phase 2 deliverables checklist
·	User-table-backed auth: register patient, register doctor (pending admin verification), login, admin login
·	JWT access tokens (15 min, in-memory on frontend, never localStorage) + refresh tokens (7d / 30d remember-me, httpOnly cookie, rotated + revocable via RefreshToken table)
·	Refresh-token theft detection: reuse of a revoked token revokes every session for that user
·	Email verification via 6-digit OTP, with resend + cooldown
·	Forgot password / reset password (single-use, 30-minute expiring token; resets revoke all sessions)
·	Change password (authenticated, requires current password)
·	Role-based route guards on the backend (authenticate + authorize middleware) and frontend (ProtectedRoute / PublicOnlyRoute)
·	Security middleware: helmet, CORS w/ credentials, rate limiting (general + strict auth-endpoint limiter + OTP-resend limiter), request-body XSS sanitization, Prisma parameterized queries (SQL-injection-safe by construction)
·	Auth pages: login, admin login, register (patient/doctor), OTP verification, forgot/reset password — built on the Phase 1 design tokens
·	Socket.io JWT handshake authentication (connection-level only; event handlers arrive in Phase 8)
·	Public specialization/hospital endpoints (needed to make the doctor registration form functional)
Phase 3 deliverables checklist
·	Sticky responsive navbar with hamburger drawer (mobile) and full nav (desktop): Home, Doctors, Specialties, About, Contact, Login, Register
·	Mobile bottom navigation bar (touch-friendly, fixed, hidden ≥lg)
·	Dark mode / light mode toggle, persisted, applied via data-theme + the Phase 1 token overrides
·	Global toast notification system (ToastProvider/useToast), animated with Framer Motion
·	Hero section: gradient background, floating animated medical icons, doctor/disease search bar, popular-search chips
·	Popular Departments (specializations grid, real data)
·	Top Rated Doctors, Featured Specialists (one per department), Recently Joined Doctors — all backed by a new GET /api/doctors endpoint with sortBy/specializationId/limit, verified-doctors-only
·	Animated statistics counters backed by a new GET /api/stats endpoint
·	Hospital Partners strip (real data from GET /api/hospitals)
·	Testimonials backed by a new GET /api/reviews/featured endpoint (real completed-appointment reviews, patient last name shown as initial only)
·	Health Tips (editorial content), Emergency Contact banner, FAQ accordion, Newsletter signup
·	Footer with sitemap columns and contact details
·	Loading skeletons on every data-fetching section (no layout jump, no spinner-only states)
·	Seed script extended with demo hospitals, 6 verified doctors, 3 patients, and completed appointments + reviews so every section above renders real content out of the box (docs: run npm run prisma:seed)
Phase 4 deliverables checklist
·	attachPatientProfile middleware — resolves the authenticated user's Patient row once per request so controllers never re-query it
·	Full patient API surface under /api/patients/me/*: dashboard summary, profile (get/update), appointments (upcoming/past/all, paginated), medical history (list/create/delete), favorite doctors (list/add/remove), prescriptions (list, with medicines + lab reports), invoices (list), wallet (balance + transactions), notifications (list/mark-read/mark-all-read)
·	Fixed a real bug caught during review: the validate middleware parsed and coerced req.query (numbers, defaults, enums) but never applied the result — pagination params were silently ignored. Now stored on req.validatedQuery since req.query can be getter-only depending on Express/Node version.
·	Reusable DashboardLayout (sidebar + topbar) built once, meant to be shared by Phase 5/6's doctor and admin dashboards too — role-specific nav items are just a prop
·	PageTitleContext so nested dashboard pages can set the topbar title without prop drilling through the router
·	All 10 spec'd dashboard cards: Upcoming Appointments, Past Appointments, Medical History, Favorite Doctors, Prescription Downloads, Invoices, Wallet, Notifications, Profile, Settings — each a real page backed by a real endpoint, not a static mock
·	Settings page reuses Phase 2's change-password and logout-all-devices endpoints — no new backend work needed there
·	Seed script extended again: first demo patient now has an upcoming approved appointment, a favorite doctor, a medical history entry, a notification, a prescription with medicines, an invoice + successful payment, and a wallet welcome-bonus transaction — so logging in as sabina.adhikari@medconnect.demo shows a fully populated dashboard immediately
Auth pages redesign (between Phase 4 and 5)
·	AuthLayout rebuilt: animated gradient mesh, floating proof badges (verified doctors / rating / patient count), a glass-style form card, and the landing page's "vitals trace" motif reused for brand continuity
·	Input gained an optional icon prop; PasswordInput rebuilt with a lock icon and a flex-based show/hide toggle (previously used a fragile hardcoded pixel offset that would misalign if label/height ever changed)
·	Button/Select/Input bumped to a consistent h-12 / rounded-lg scale for a slightly more premium feel
·	Login, Register (patient/doctor), Admin Login, Forgot Password all got contextual icons (mail, lock, user, phone, graduation cap, badge-check)
·	Register-choice screen rebuilt with gradient icon tiles and hover motion instead of flat cards
Phase 5 deliverables checklist
·	attachDoctorProfile middleware, mirroring Phase 4's attachPatientProfile
·	Doctor dashboard API mounted at /api/doctor (singular — deliberately separate from the public /api/doctors directory to avoid the /:id route swallowing /me/* requests)
·	Dashboard summary, profile (get/update), appointments (today/upcoming/requests/history, paginated), appointment status updates (approve/reject/reschedule/complete/cancel — each triggers a patient notification, and approval auto-creates the Phase 8 chat room), unique-patients list + per-patient history, revenue analytics (monthly bucketed, completion rate), availability schedule (add/list/delete), wallet, prescriptions (list/create), notifications (list/mark-read/mark-all-read)
·	All 10 spec'd doctor dashboard cards: Today's Appointments, Upcoming Patients, Appointment Requests, Patient History, Messages, Wallet, Revenue Analytics, Profile, Availability Schedule, Prescription Management
·	Revenue Analytics page includes a real bar chart (recharts) of monthly revenue, not just numbers
·	Messages page is an honest placeholder explaining Phase 8 scope rather than a dead link or fake UI
·	Seed script extended: weekly availability (Mon–Fri, 9–5) for the first two demo doctors, plus one pending appointment request so "Appointment Requests" has something to act on immediately
Phase 6 deliverables checklist
·	attachAdminProfile middleware, mirroring the Patient/Doctor pattern
·	Full admin API mounted at /api/admin: dashboard summary, patients (list/search/detail/activate-deactivate), doctors (list/search/filter by status/detail/activate-deactivate), doctor verification (approve/reject with a reason that's sent to the doctor as a notification), appointments oversight (filterable by status/date range), payments oversight (filterable, with refund), platform-wide revenue analytics (monthly + by-gateway breakdown), system analytics (patient/doctor growth, appointment volume, specialization distribution), appointment reports (date-range status + revenue breakdown), review moderation (hide/show/delete), notification broadcast (to all/patients/doctors) plus a personal admin inbox
·	All 10 spec'd admin dashboard sections: Manage Patients, Manage Doctors, Verify Doctors, Appointments, Reports, Payments, Revenue, System Analytics, Manage Reviews, Manage Notifications
·	Revenue page has a real bar chart (monthly trend) and pie chart (gateway breakdown); System Analytics has a dual-line growth chart, a bar chart for appointment volume, and a horizontal-bar specialization distribution
·	New shared UI: Dialog (used for the reject-doctor reason prompt) and Pagination (used across every admin list page)
·	Seed script extended: one PENDING-verification doctor (sushil.pending@medconnect.demo) so Verify Doctors has something to act on, one low-rated review so Manage Reviews has something to moderate, and a demo admin account (admin@medconnect.demo)
Phase 7 deliverables checklist
·	GET /api/diseases — every disease with its specialization attached, powering the "select a disease" step
·	GET /api/appointments/recommended-doctors?diseaseId=... — the Smart Doctor Recommendation engine. Scores verified, active doctors in the matching specialization on: rating (dampened by review volume, so a 5.0 from 2 reviews doesn't outrank a 4.8 from 200), experience (diminishing returns past ~15 years), completion rate (computed live from appointment history, not a stale stored field), whether they have any active weekly availability at all, and a boost if the requesting patient has seen that doctor before. Returns a matchScore and human-readable matchReasons per doctor (e.g. "Highly rated", "You've seen this doctor before") for UI transparency.
·	Endpoint is public but personalizes when a patient happens to be logged in — added a new optionalAuthenticate middleware (populates req.user if a valid token is present, never blocks the request otherwise) rather than forcing a login wall just to browse recommendations
·	GET /api/appointments/doctors/:doctorId/slots?date=YYYY-MM-DD — real slot generation from DoctorAvailability weekly schedule, minus already-booked appointments, minus already-passed times if the date is today
·	POST /api/appointments — booking (patient-only), re-validates slot availability at submission time to close most of the race-condition window, notifies the doctor, returns a confirmation-ready payload
·	GET /api/appointments/:id — confirmation/detail lookup, restricted to the patient or doctor who own the appointment (or admin)
·	Frontend: real /doctors directory (search + specialization filter + sort), /doctors/:id detail page with an embedded 14-day date picker + live slot grid + booking form, /search disease-picker with scored/reasoned doctor recommendations, and a booking confirmation page
·	Seed script: availability now seeded for all 6 demo doctors (previously just 2), so the booking flow has real bookable slots across the whole demo doctor roster
Notes for future phases
·	Doctor recommendation intentionally does not score geographic distance — Doctor.location is free text, not coordinates, so real distance ranking needs a geocoding step first. The scoring function is structured so adding a distanceKm term later is additive, not a rewrite.
·	The slot-availability re-check on booking is application-level (query-then-check), not a DB-level unique constraint on (doctorId, date, startTime). Under real concurrent load two requests could still both pass the check in the same instant — worth adding that constraint as a hardening pass before this goes anywhere near production traffic.
·	"Leave a review" is still not wired (same note carried over from Phase 4) — still Phase 10 scope.
·	The doctor-side reschedule UI (date/time picker on the Appointments page) is still the one gap noted back in Phase 5 — now that booking has a real slot-picker component, reschedule can reuse it directly instead of building a second one from scratch.
·	Reports currently covers appointment status + revenue breakdown for a date range via GET /api/admin/reports/appointments; CSV/PDF export isn't wired yet — the data is there, just needs a download button and a server-side CSV writer (straightforward addition, deliberately deferred to avoid scope creep here).
·	Payment refunds update the Payment row (status: REFUNDED, refundedAmount, refundedAt) but don't yet call out to eSewa/FonePay's actual refund API — that's real Phase 9 (Payments integration) territory; today's refund is an internal record-keeping action.
·	Doctor deactivation (setDoctorActive) flips User.isActive, which login already checks — a deactivated doctor is immediately locked out. The public /api/doctors directory now also filters on user.isActive, not just verificationStatus, so a deactivated doctor's profile disappears from public listings immediately too (fixed during this phase's review, not deferred).
·	Doctor "Add prescription" from the Appointments/history tab currently just shows a button — full inline creation from that context (vs. the dedicated Prescriptions page) can be wired later; the dedicated page's create flow is fully functional today.
·	Reschedule is implemented in the backend (updateAppointmentStatus accepts date/startTime/endTime when status is RESCHEDULED) but the frontend Appointments page doesn't yet have a reschedule UI (date/time picker) — only approve/reject/complete buttons. Worth adding alongside Phase 7's slot-picking UI, since they'll share a component.
·	/doctor/appointments "Mark completed" doesn't yet prompt for a prescription — a natural follow-up affordance once the two flows are visually connected.
·	/patient/appointments has "Join" (video), "Prescription", and "Leave review" buttons rendered conditionally, but they're not wired to real actions yet — video join needs Phase 8/WebRTC groundwork, review submission needs a POST endpoint that Phase 10 (Reviews) will add.
·	Booking a new appointment isn't in Phase 4 — "Find a doctor" / "Book now" buttons currently link to the still-placeholder /doctors directory. Phase 7 (booking + recommendation engine) is where these become real.
·	The DashboardLayout/DashboardSidebar/DashboardTopbar trio was deliberately built generic (nav items as props) specifically so Phases 5 and 6 can reuse it instead of rebuilding a parallel doctor/admin shell.
·	/doctors, /specialties, /about, /contact, and /search currently render placeholders reachable from the navbar/footer/bottom-nav — Phase 4+ (and a dedicated search/directory build) should replace these with real pages. The hero search bar already routes to /search?q=..., so that's the first one worth building.
·	GET /api/doctors supports specializationId filtering today; the disease-based recommendation ranking (rating + success rate + availability + patient history) described in the original spec is still Phase 7 scope — Phase 3's sort options (rating/recent/experience) are a simpler stand-in.
·	Demo seed accounts (doctors and patients) all share the password DemoPass123 — seed-only, never use this pattern for real accounts.
·	Doctor accounts are created with verificationStatus: PENDING and cannot log in until an admin approves them (Phase 6 builds that admin action) — login already enforces this. Seeded demo doctors are created pre-verified so Phase 3 has content to show.
·	DoctorAvailability uses day-of-week + time strings rather than concrete calendar rows — Phase 7 will need a slot-generation function that expands this into bookable slots for a given date range, checked against existing Appointments.
·	Chat room creation is not yet automated on appointment approval — that hook belongs in the Phase 7 appointment-status controller.
·	SMS OTP is architecture-ready (SMS_PROVIDER env var) but not wired to a real provider yet — email OTP is fully functional today.
