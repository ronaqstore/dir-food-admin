# Tasks: [002] Dashboard Shell & Overview Screens

Spec Reference: `docs/specs/002-dashboard-shell-and-overview/spec.md`

Rules:
- One logical unit per commit.
- Run verify loop (`npm run typecheck && npm run lint`) before checking off any task.
- Stop and report after completing each Batch. Do NOT continue to next batch without user confirmation.

---

### Batch 1: Authenticated App Shell & Navigation (Sidebar, Header, User Nav, Locale Switcher)
- [x] Task 1.1: Build `LocaleSwitcher` component (`src/components/layout/locale-switcher.tsx`) supporting English, Urdu, and Pashto.
- [x] Task 1.2: Build `UserNav` component (`src/components/layout/user-nav.tsx`) displaying user profile, active restaurant, and sign-out button.
- [x] Task 1.3: Build role-based `AppSidebar` component (`src/components/layout/app-sidebar.tsx`) using Shadcn Sidebar.
- [x] Task 1.4: Build `AppHeader` component (`src/components/layout/app-header.tsx`) integrating SidebarTrigger, Breadcrumbs, LocaleSwitcher, ThemeModeToggle, and UserNav.
- [x] Task 1.5: Build Dashboard layout hierarchy (`src/app/[locale]/dashboard/layout.tsx` and root redirect `src/app/dashboard/page.tsx`).
- [x] Task 1.6: Verify loop passes (`tsc`, `oxlint`).

---

### Batch 2: Restaurant Owner Dashboard Overview (`/dashboard/overview`)
- [x] Task 2.1: Create owner dashboard overview component (`src/features/dashboard/components/owner-overview.tsx`) with KPI cards (Today's Orders, Sales in Rs, Pending, Completed) and quick action shortcuts.
- [x] Task 2.2: Implement `/dashboard/overview` page at `src/app/[locale]/dashboard/overview/page.tsx`.
- [x] Task 2.3: Implement `/dashboard` root index page at `src/app/[locale]/dashboard/page.tsx` redirecting to role default.
- [x] Task 2.4: Verify loop passes (`tsc`, `oxlint`).

---

### Batch 3: Platform Admin Dashboard Overview (`/dashboard/platform`)
- [x] Task 3.1: Create platform admin overview component (`src/features/dashboard/components/platform-overview.tsx`) with cross-tenant KPI cards and pending restaurant approvals list.
- [x] Task 3.2: Implement `/dashboard/platform` page at `src/app/[locale]/dashboard/platform/page.tsx`.
- [x] Task 3.3: Verify loop passes (`tsc`, `oxlint`).

---

### Batch 4: Verification, Quality Gates & Close Out
- [x] Task 4.1: Run full verification (`npm run typecheck`, `npm run lint`, `npm run test`).
- [x] Task 4.2: Update `docs/status.md` and mark spec as Done.
