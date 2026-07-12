# Authentication — Endpoints & Token Lifecycle

## Endpoints

All routes are prefixed with `/api/auth`.

| Method | Path | Auth required | Notes |
|---|---|---|---|
| POST | `/register/patient` | No | Creates `User` + `Patient` + `Wallet`. Sends OTP email. |
| POST | `/register/doctor` | No | Creates `User` + `Doctor` (status `PENDING`) + `Wallet`. Sends OTP email. Cannot log in until admin verifies. |
| POST | `/login` | No | Any role. Blocks unverified email, deactivated accounts, and pending/rejected doctors. |
| POST | `/admin/login` | No | Same as `/login` but rejects non-`ADMIN` users. |
| POST | `/refresh` | No (needs refresh cookie) | Rotates the refresh token; issues a new access token. |
| POST | `/logout` | No | Revokes the current refresh token, clears the cookie. |
| POST | `/logout-all` | Yes | Revokes every refresh token for the user (all devices). |
| POST | `/verify-otp` | No | `{ email, otp }`. Marks `isEmailVerified = true`. |
| POST | `/resend-otp` | No | Rate-limited to 3 per 5 minutes. |
| POST | `/forgot-password` | No | Always returns success (no email enumeration). Sends reset link if the account exists. |
| POST | `/reset-password` | No | `{ token, newPassword, confirmPassword }`. Revokes all sessions on success. |
| POST | `/change-password` | Yes | `{ currentPassword, newPassword, confirmPassword }`. |
| GET | `/me` | Yes | Returns the current user + role-specific profile. |

## Token lifecycle

```
Login
  │
  ├─ Access token  (JWT, 15 min, sent in response body)
  │    → stored in memory only on the frontend (never localStorage)
  │    → sent as `Authorization: Bearer <token>` on every API call
  │
  └─ Refresh token (JWT, 7d or 30d if "remember me", also persisted
     as a RefreshToken row keyed by its own id)
       → set as an httpOnly, sameSite=lax cookie scoped to /api/auth
       → also returned in the response body for non-browser clients

Access token expires (or a 401 is returned)
  │
  └─ Frontend axios interceptor calls POST /api/auth/refresh
       → browser sends the httpOnly cookie automatically
       → backend verifies the JWT AND checks the RefreshToken row
         (not revoked, not expired, token string matches exactly)
       → OLD refresh token is revoked; a NEW pair is issued (rotation)
       → if the presented token doesn't match what's stored (i.e. it
         was already rotated once before), every session for that
         user is revoked — this is the theft-reuse detection

Logout
  │
  └─ Revokes just that one RefreshToken row; cookie cleared

Password changed / reset
  │
  └─ ALL RefreshToken rows for that user are revoked — every other
     logged-in device/browser is forced to log in again
```

## Why rotation + a DB-backed refresh token, not just a long-lived JWT

A stateless long-lived refresh JWT can't be revoked before it expires —
if it leaks, it's valid until its exp claim says otherwise, full stop.
Backing it with a `RefreshToken` row means:

1. Logout actually invalidates it immediately (`revoked = true`),
   instead of "logout" being a frontend-only illusion.
2. Reuse of an already-rotated token is detectable (its `token` column
   no longer matches what was presented) — the moment that happens, we
   assume compromise and kill every session for the user.
3. "Log out of all devices" and "force logout on password reset" are a
   single `updateMany`, not something requiring a separate blocklist.

## Frontend token storage decision

The **access token lives in a JS module variable**, not
`localStorage`/`sessionStorage`. Any XSS bug on the page can read
localStorage; it cannot read a variable that isn't attached to
`window`. The tradeoff is that a hard page refresh loses the access
token — which is exactly what the silent `tryRestoreSession()` call in
`AuthProvider` is for: it immediately calls `/auth/refresh` on
mount, using the httpOnly cookie the browser still has, and
re-populates the in-memory access token before rendering protected
routes.
