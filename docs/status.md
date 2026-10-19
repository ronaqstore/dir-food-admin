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

## 2026-10-19 — Spec 002: Dashboard Shell & Overview Screens
- **Spec:** `docs/specs/002-dashboard-shell-and-overview/` (Status: Done)
- **Features Implemented:**
  - Responsive collapsible sidebar (`src/components/layout/app-sidebar.tsx`) with role-based navigation for Restaurant Owner vs Platform Admin.
  - Sticky dashboard header (`src/components/layout/app-header.tsx`) with sidebar trigger, locale switcher (`LocaleSwitcher`), dark/light theme mode toggle (`ThemeModeToggle`), and user profile navigation (`UserNav`).
  - Dropdown locale switcher (`src/components/layout/locale-switcher.tsx`) supporting English, Urdu, and Pashto.
  - User profile menu (`src/components/layout/user-nav.tsx`) with avatar, restaurant/role title, and NextAuth sign-out.
  - Dashboard layout hierarchy: `src/app/[locale]/dashboard/layout.tsx`, root redirects `src/app/dashboard/page.tsx` and `src/app/[locale]/dashboard/page.tsx`.
  - Restaurant Owner overview (`src/features/dashboard/components/owner-overview.tsx` and `src/app/[locale]/dashboard/overview/page.tsx`):
    - Status badge & pending approval banner for unverified restaurants.
    - KPI metric cards (Today's Orders, Today's Sales in Rs, Active Orders, Menu Items count).
    - Quick actions (Add Menu Item, View Live Orders, WhatsApp Settings).
    - Recent orders preview widget.
  - Platform Admin overview (`src/features/dashboard/components/platform-overview.tsx` and `src/app/[locale]/dashboard/platform/page.tsx`):
    - Platform KPI metric cards (Total Restaurants, Pending Approvals, Active Subscriptions, Platform Users).
    - Quick actions to manage restaurants, subscriptions, and settings.
    - Pending restaurant approvals widget with review and activation actions.
- **Quality Gates:**
  - `npm run typecheck`: Passed (0 errors)
  - `npm run lint`: Passed (0 warnings, 0 errors)
  - `npm run test`: Passed (6/6 tests passing)

