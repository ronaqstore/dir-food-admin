# Tasks: [001] App Shell & Authentication Screens

Spec Reference: `docs/specs/001-app-shell-and-auth/spec.md`

Rules:
- One logical unit per commit.
- Run verify loop (`npm run typecheck && npm run lint`) before checking off any task.
- Stop and report after completing each Batch. Do NOT continue to next batch without user confirmation.

---

### Batch 1: App Shell, Providers & Layout Hierarchy
- [x] Task 1.1: Create layout providers (`src/components/layout/providers.tsx`, `query-provider.tsx`, `auth-provider.tsx`, `appearance-provider.tsx`).
- [x] Task 1.2: Implement Root Layout (`src/app/layout.tsx`) with fonts, theme bootstrap, and TopLoader.
- [x] Task 1.3: Implement Locale Layout (`src/app/[locale]/layout.tsx`) with `next-intl` messages, Sonner Toaster, and PWA shell.
- [x] Task 1.4: Implement root error boundary (`src/app/error.tsx`) and not-found pages (`src/app/not-found.tsx`, `src/app/[locale]/not-found.tsx`).
- [x] Task 1.5: Verify loop passes (`tsc`, `oxlint`).

---

### Batch 2: Authentication Feature & Sign-In Screens (Owner & Platform Admin)
- [x] Task 2.1: Create auth schemas and types in `src/features/auth/schemas/sign-in.schema.ts` and `login.schema.ts`.
- [x] Task 2.2: Implement Restaurant Owner login form in `src/features/auth/components/login-form.tsx` and page at `src/app/[locale]/login/page.tsx`.
- [x] Task 2.3: Implement Platform Admin / Super Admin login form in `src/features/auth/components/platform-admin-login-form.tsx` and page at `src/app/[locale]/platform-admin/login/page.tsx`.
- [x] Task 2.4: Verify loop passes (`tsc`, `oxlint`).

---

### Batch 3: One-Time Password Setup Screen
- [x] Task 3.1: Create password setup schema and API service in `src/features/auth/schemas/setup-password.schema.ts` and `src/features/auth/api/auth.service.ts`.
- [x] Task 3.2: Implement password setup form component in `src/features/auth/components/setup-password-form.tsx`.
- [x] Task 3.3: Create setup password page at `src/app/[locale]/setup-password/page.tsx` and root redirect `/setup-password`.
- [x] Task 3.4: Verify loop passes (`tsc`, `oxlint`).

---

### Batch 4: Verification & Close Out
- [x] Task 4.1: Run full verification (`npm run typecheck`, `npm run lint`, `npm run test`).
- [x] Task 4.2: Update `docs/status.md` and mark spec as Done.

---

### Batch 5: Restaurant Owner Registration & Branding Purge
- [x] Task 5.1: Purge all leftover "Ronaq Store" and "Dukaan Pro" strings across `messages/en.json`, `messages/ur.json`, and `messages/ps.json`.
- [x] Task 5.2: Create Zod validation schema in `src/features/auth/schemas/register.schema.ts`.
- [x] Task 5.3: Add `registerRestaurant` API function in `src/features/auth/api/auth.service.ts` connecting to `POST /auth/register`.
- [x] Task 5.4: Create `RegisterForm` component in `src/features/auth/components/register-form.tsx` with cuisine selector and phone validation.
- [x] Task 5.5: Create localized page at `src/app/[locale]/register/page.tsx` and root redirect `src/app/register/page.tsx`.
- [x] Task 5.6: Add registration route to `src/proxy.ts` and register link to `src/features/auth/components/login-form.tsx`.
- [x] Task 5.7: Verify loop passes (`tsc`, `oxlint`, `vitest`).

