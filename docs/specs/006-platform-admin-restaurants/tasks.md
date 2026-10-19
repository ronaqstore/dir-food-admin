# Tasks: [006] Platform Admin Restaurant Management & Approvals

## Batch 1: Types, Route Handlers & Translations
- [x] Task 1.1: Create `src/features/platform/types.ts` with restaurant, onboarding, status, and subscription models.
- [x] Task 1.2: Create Next.js API route handlers in `src/app/api/admin/restaurants/` (`route.ts`, `[id]/route.ts`, `[id]/status/route.ts`, `[id]/subscription/extend/route.ts`, `[id]/setup-link/route.ts`).
- [x] Task 1.3: Add trilingual translations (`en`, `ur`, `ps`) under `platformRestaurants` namespace.
- [x] Task 1.4: Verify with `npm run typecheck && npm run lint`.

## Batch 2: Platform Query Hooks & Action Dialogs
- [x] Task 2.1: Implement TanStack Query hooks in `src/features/platform/api/platform-query.ts`.
- [x] Task 2.2: Implement `CreateRestaurantDialog` component (assisted onboarding + setup link generator).
- [x] Task 2.3: Implement `ReviewApprovalDialog` component (readiness prerequisites checklist & 1-click approval).
- [x] Task 2.4: Implement `ExtendSubscriptionDialog` component (+30d, +60d, +90d presets).
- [x] Task 2.5: Implement `StatusChangeDialog` component (suspend / reactivate with reason).
- [x] Task 2.6: Verify with `npm run typecheck && npm run lint`.

## Batch 3: Restaurants Table, Page & Integration Verification
- [x] Task 3.1: Implement `RestaurantsView` component in `src/features/platform/components/restaurants-view.tsx`.
- [x] Task 3.2: Create page `src/app/[locale]/dashboard/platform/restaurants/page.tsx`.
- [x] Task 3.3: Run full verify loop (`npm run typecheck`, `npm run lint`, `npm run test`).
- [x] Task 3.4: Git commit Phase 6.
