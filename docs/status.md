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

## 2026-10-19 — Spec 003: Menu & Catalog Management
- **Spec:** `docs/specs/003-menu-and-catalog-management/` (Status: Done)
- **Features Implemented:**
  - Categories management (`/dashboard/categories`): List, create modal, rename modal, active switch, and reorder display order (`PUT /order`).
  - Menu Items management (`/dashboard/menu`): Category filter tabs, search bar, item cards, single price vs portions/variants (Half/Full), image upload & delete, and real-time availability toggle (`isAvailable`).
  - Next.js API route handlers in `src/app/api/categories/` and `src/app/api/items/`.
- **Quality Gates:**
  - `npm run typecheck`: Passed (0 errors)
  - `npm run lint`: Passed (0 warnings, 0 errors)
  - `npm run test`: Passed (6/6 tests passing)

## 2026-10-19 — Spec 004: Restaurant Profile, Operating Hours & Delivery Areas
- **Spec:** `docs/specs/004-restaurant-profile-hours-and-delivery-areas/` (Status: Done)
- **Features Implemented:**
  - Settings hub (`/dashboard/settings`): Profile, Hours, and Delivery Areas tabs.
  - Store Profile (`ProfileTab`): Logo & cover photo upload, store info, WhatsApp orders number, minimum order amount in PKR, store availability override (`AUTO`, `CLOSED`, `TEMP_UNAVAILABLE`), and launch readiness checklist with self-serve 30-day trial publishing.
  - Operating Hours (`HoursTab`): 7-day schedule with open/close time pickers (`HH:mm`) and closed day toggles.
  - Delivery Areas (`DeliveryAreasTab`): Timergara neighborhoods coverage switch and delivery fee in PKR.
  - Next.js API route handlers in `src/app/api/restaurant/`.
- **Quality Gates:**
  - `npm run typecheck`: Passed (0 errors)
  - `npm run lint`: Passed (0 warnings, 0 errors)
  - `npm run test`: Passed (6/6 tests passing)

## 2026-10-19 — Spec 005: Orders & Order Intents (WhatsApp Flow)
- **Spec:** `docs/specs/005-orders-and-whatsapp-intents/` (Status: Done)
- **Features Implemented:**
  - Orders hub (`/dashboard/orders`): Real-time polling list of incoming customer order requests.
  - Summary Metric Cards: Total Requests (30d), WhatsApp Chats Opened, Handoff Conversion Rate.
  - Filter & Search: Search by reference code or customer, filter by status (`WHATSAPP_HANDOFF_READY`, `WHATSAPP_OPENED`).
  - Order Details Dialog: Full dish item snapshot breakdown with quantities, unit prices, line totals, delivery address and landmark in Timergara, subtotal, delivery fee status, and direct "Chat on WhatsApp" handoff button.
  - Next.js API route handlers in `src/app/api/orders/`.
- **Quality Gates:**
  - `npm run typecheck`: Passed (0 errors)
  - `npm run lint`: Passed (0 warnings, 0 errors)
  - `npm run test`: Passed (6/6 tests passing)

## 2026-10-19 — Spec 006: Platform Admin Restaurant Management & Approvals
- **Spec:** `docs/specs/006-platform-admin-restaurants/` (Status: Done)
- **Features Implemented:**
  - Platform restaurants portal (`/dashboard/platform/restaurants`): Overview of registered stores across Lower Dir with status filtering and live search.
  - Summary KPI cards: Total registered restaurants, pending applications, active stores, and suspended accounts.
  - Admin-assisted onboarding modal (`CreateRestaurantDialog`): Create restaurant and owner record, and generate a single-use password setup link for WhatsApp dispatch.
  - Review & Approval modal (`ReviewApprovalDialog`): Inspect readiness checklist (WhatsApp number, weekly hours, menu items, delivery areas) before granting 1-click live approval with 30-day free trial.
  - Subscription extension modal (`ExtendSubscriptionDialog`): Presets (+30d, +60d, +90d, +365d) and custom days after receiving manual cash payments.
  - Status change modal (`StatusChangeDialog`): Mandatory audit reason prompt for suspending or deactivating restaurants.
  - Next.js API route handlers in `src/app/api/admin/restaurants/`.
- **Quality Gates:**
  - `npm run typecheck`: Passed (0 errors)
  - `npm run lint`: Passed (0 warnings, 0 errors)
  - `npm run test`: Passed (6/6 tests passing)

## 2026-10-19 — Spec 007: Platform Subscriptions & Master Delivery Areas
- **Spec:** `docs/specs/007-platform-subscriptions-and-areas/` (Status: Done)
- **Features Implemented:**
  - Platform Subscriptions hub (`/dashboard/platform/subscriptions`): Real-time overview of active terms, expiring accounts, lapsed subscriptions, and 30-day trials.
  - Subscriptions KPI cards: Active Subscriptions, Expiring in 7 Days, Expired Accounts, and Free Trial Stores.
  - Filter by term status (`ALL`, `ACTIVE`, `EXPIRING`, `EXPIRED`, `TRIAL`) and search by store/owner.
  - Days remaining countdown badges with rapid offline cash renewal via `ExtendSubscriptionDialog`.
  - Master Delivery Areas hub (`/dashboard/platform/settings`): Standard Timergara and Lower Dir geographical coverage zones.
  - Master Area dialog (`MasterAreaDialog`): Create and edit standard zones with sort order, active switch, and auto-slug generation.
  - Next.js API route handlers in `src/app/api/admin/areas/`.
- **Quality Gates:**
  - `npm run typecheck`: Passed (0 errors)
  - `npm run lint`: Passed (0 warnings, 0 errors)
  - `npm run test`: Passed (6/6 tests passing)

---

## 2026-10-20 — Menu QR Code & Counter Standee Generator
- **Feature:** Menu QR Code & Counter Flyer Generator (`src/features/settings/components/qr-code-tab.tsx`) (Status: Done)
- **Features Implemented:**
  - Zero-dependency, pure TypeScript ISO/IEC 18004 QR code matrix generator (`src/lib/qr/qr-code.ts`).
  - Dedicated "Menu Link & QR" tab in Restaurant Settings (`SettingsView`).
  - Live public storefront menu URL bar with 1-click "Copy Link" and "Share to WhatsApp" shortcuts.
  - Printable Table Standee preview displaying restaurant brand logo, restaurant name, address in Lower Dir, and high-contrast vector QR code.
  - 1-click "Download High-Res PNG (1024×1024)" generator using HTML5 Canvas.
  - 1-click "Print Table Standee" formatted cleanly for dining tables and counter flyers.
  - Quick action shortcut added to the Restaurant Owner dashboard overview (`OwnerOverview`).
  - Full translations for English, Urdu, and Pashto.
- **Quality Gates:**
  - `npm run typecheck`: Passed (0 errors)
  - `npm run lint`: Passed (0 warnings, 0 errors across 236 files)



