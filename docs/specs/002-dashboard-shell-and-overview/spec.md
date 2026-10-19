# Spec: [002] Dashboard Shell & Overview Screens

- **Status:** In Progress
- **Author:** AI + Usman
- **Date:** 2026-10-19
- **Target Module:** `src/app/[locale]/dashboard/`, `src/components/layout/`, `src/features/dashboard/`

---

## 1. Context & Business Value
- **Who needs this:** Restaurant Owners and Platform Administrators.
- **Problem solved:** Once authenticated, users require a unified application shell with responsive sidebar navigation, header controls (language switcher, theme toggle, user profile dropdown with sign-out), and role-specific landing overviews:
  - **Restaurant Owner (`/dashboard/overview`):** High-level view of today's restaurant performance (today's orders, total sales PKR, pending orders, completed orders), quick action buttons (Live Orders, Menu Management, WhatsApp settings), and recent orders preview.
  - **Platform Admin (`/dashboard/platform`):** High-level platform health (total restaurants, pending approval requests, active subscriptions, total platform users) and a pending restaurant approvals action widget.

---

## 2. Access Control & Multi-Tenancy
- **Role(s) Allowed:**
  - `RESTAURANT_OWNER`: Access to `/dashboard/overview`, `/dashboard/orders`, `/dashboard/menu`, `/dashboard/settings`. Blocked from platform admin routes.
  - `PLATFORM_ADMIN`: Access to `/dashboard/platform`, `/dashboard/platform/restaurants`, `/dashboard/platform/subscriptions`.
- **Guards Applied:** NextAuth v5 session middleware in `src/proxy.ts` and role verification in `src/lib/auth/routes.ts`.
- **Tenant Isolation:**
  - Owner queries pass the session user's `restaurantId`.
  - Platform admin queries access cross-tenant summaries.

---

## 3. UI & API Contract
### Pages to implement:
| Route | Access | Purpose |
|---|---|---|
| `src/app/[locale]/dashboard/layout.tsx` | Authenticated | Dashboard shell (Sidebar, Header, Breadcrumbs, User Nav) |
| `src/app/[locale]/dashboard/page.tsx` | Authenticated | Redirects to `/dashboard/overview` (Owner) or `/dashboard/platform` (Admin) |
| `src/app/[locale]/dashboard/overview/page.tsx` | Restaurant Owner | Restaurant owner daily overview & metric cards |
| `src/app/[locale]/dashboard/platform/page.tsx` | Platform Admin | Platform administrator cross-tenant overview & pending approvals |
| `src/app/dashboard/page.tsx` | Authenticated | Root locale redirect to `/en/dashboard` |

### Components to build:
- `src/components/layout/app-sidebar.tsx`: Collapsible navigation sidebar using Shadcn Sidebar.
- `src/components/layout/app-header.tsx`: Header with sidebar trigger, locale switcher, theme toggle, and user nav.
- `src/components/layout/user-nav.tsx`: Dropdown menu showing current user's name, role, restaurant name, and Sign Out action.
- `src/components/layout/locale-switcher.tsx`: Dropdown to toggle between English, Urdu, and Pashto.
- `src/features/dashboard/components/owner-overview.tsx`: Metric cards & quick actions for restaurant owner.
- `src/features/dashboard/components/platform-overview.tsx`: Platform-wide metric cards & pending approvals list.

---

## 4. Security & Validation Rules
- Unauthenticated access to any `/dashboard/*` path immediately redirects to `/login` with `callbackUrl`.
- If an owner attempts to access `/dashboard/platform`, they are safely redirected back to `/dashboard/overview`.
- Full RTL and i18n support for English (`en`), Urdu (`ur`), and Pashto (`ps`).

---

## 5. Acceptance Criteria
- [ ] Authenticated shell renders with responsive sidebar (collapsible on mobile via Sheet).
- [ ] Header includes working Language switcher (`en`, `ur`, `ps`), Theme toggle, and User Nav with Logout.
- [ ] Restaurant owner navigates to `/dashboard/overview` and sees their restaurant name and metric cards.
- [ ] Platform admin navigates to `/dashboard/platform` and sees platform statistics and pending restaurant approvals.
- [ ] Root `/dashboard` cleanly redirects to the role-appropriate dashboard.
- [ ] `npm run typecheck` and `npm run lint` pass with 0 errors.

