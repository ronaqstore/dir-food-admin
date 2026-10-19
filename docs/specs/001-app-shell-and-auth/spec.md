# Spec: [001] App Shell & Authentication Screens

- **Status:** Done
- **Author:** AI + Usman
- **Date:** 2026-10-19
- **Target Module:** `src/app/`, `src/components/layout/`, `src/features/auth/`

---

## 1. Context & Business Value
- **Who needs this:** Restaurant Owners and Platform Admins.
- **Problem solved:** Provides the foundational App Router shell (themes, i18n, query cache, toaster notifications) and the visual login and password setup screens needed to access the platform.
- **User Journey:**
  1. A Restaurant Owner or Platform Admin navigates to `/auth/sign-in`.
  2. The user enters their Pakistani mobile number (`03001234567`) or email + password.
  3. NextAuth validates credentials against backend endpoints (`POST /auth/login` or `POST /auth/platform-admin/login`).
  4. On success, the user is redirected to `/dashboard/overview` (Owner) or `/dashboard/platform` (Admin).
  5. An onboarded owner clicks a setup link with a token (`/auth/setup-password?token=...`) and chooses their initial password.

---

## 2. Access Control & Multi-Tenancy
- **Role(s) Allowed:** `PUBLIC` (Sign-in and Setup Password), authenticated roles after login (`RESTAURANT_OWNER`, `PLATFORM_ADMIN`).
- **Guards Applied:** NextAuth v5 session middleware in `src/proxy.ts`. Public auth routes redirect authenticated users to their role-specific dashboard.
- **Tenant Isolation:** Once authenticated, the session token holds `restaurantId` for owners or `null` for platform admins.

---

## 3. UI & API Contract
### Pages to implement:
| Route | Access | Purpose |
|---|---|---|
| `src/app/layout.tsx` | All | Root HTML document, fonts, base CSS, theme bootstrap |
| `src/app/[locale]/layout.tsx` | All | i18n messages (`next-intl`), TanStack Query, Theme & Auth Providers, Sonner Toaster |
| `src/app/[locale]/login/page.tsx` | Public | Restaurant Owner sign-in page (Pakistani mobile `03XXXXXXXXX` + password) |
| `src/app/[locale]/platform-admin/login/page.tsx` | Public | Platform Admin / Super Admin sign-in page (email/credentials) |
| `src/app/[locale]/setup-password/page.tsx` | Public | One-time password setup screen (`token` query param) |

### Backend Endpoints Called:
- `POST /auth/login`: `{ phone: string, password: string }`
- `POST /auth/platform-admin/login`: `{ email: string, password: string }`
- `POST /auth/setup-password`: `{ token: string, password: string }`

---

## 4. Security & Validation Rules
- **Phone Validation:** Pakistani mobile format (`03XXXXXXXXX` or `+923XXXXXXXXX`) normalized via `normalizePhone()`.
- **Password Strength:** Minimum 8 characters.
- **Error Handling:** Normalized backend error codes (e.g. `401 INVALID_CREDENTIALS`, `423 LOCKED`) surfaced via toast and inline form error messages.
- **i18n & RTL:** Full support for `en`, `ur`, and `ps` locales using `next-intl` dictionary keys.

---

## 5. Acceptance Criteria
- [ ] Root layout boots cleanly with zero hydration warnings.
- [ ] Language switching (`/en`, `/ur`, `/ps`) and direction (`ltr` / `rtl`) render accurately.
- [ ] Sign-in page allows login with phone/password and triggers NextAuth sign-in.
- [ ] Password setup page validates matching password confirmation and submits token to `POST /auth/setup-password`.
- [ ] `npm run typecheck` and `npm run lint` pass with 0 errors.
