# Dir Food Admin — Project Status & Changelog

## 2026-10-19 — Spec 001: App Shell & Authentication Screens
- **Spec:** `docs/specs/001-app-shell-and-auth/` (Status: Done)
- **Features Implemented:**
  - Layout hierarchy: `src/app/layout.tsx` (fonts, themes, TopLoader) and `src/app/[locale]/layout.tsx` (i18n, providers, Sonner, PWA shell).
  - Layout providers: `providers.tsx`, `query-provider.tsx`, `auth-provider.tsx`, `appearance-provider.tsx`.
  - Root error boundary (`error.tsx`) and not-found pages (`not-found.tsx`, `[locale]/not-found.tsx`).
  - Restaurant Owner sign-in: `src/features/auth/components/login-form.tsx` and `src/app/[locale]/login/page.tsx` (`/login`).
  - Platform Admin / Super Admin sign-in: `src/features/auth/components/platform-admin-login-form.tsx` and `src/app/[locale]/platform-admin/login/page.tsx` (`/platform-admin/login`).
  - One-time password setup: `src/features/auth/components/setup-password-form.tsx` and `src/app/[locale]/setup-password/page.tsx` (`/setup-password`).
  - Route redirects and protection proxy in `src/proxy.ts`.
- **Quality Gates:**
  - `npm run typecheck`: Passed (0 errors)
  - `npm run lint`: Passed (0 warnings, 0 errors)
  - `npm run test`: Passed (6/6 tests passing)
