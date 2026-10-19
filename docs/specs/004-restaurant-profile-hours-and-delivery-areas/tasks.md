# Tasks: [004] Restaurant Profile, Operating Hours & Delivery Areas

## Batch 1: Types, Route Handlers & Translations
- [x] Task 1.1: Create `src/features/settings/types.ts` with Profile, Hours, and Delivery Areas types.
- [x] Task 1.2: Create Next.js API route handlers in `src/app/api/restaurant/` (`route.ts`, `availability/route.ts`, `images/[kind]/route.ts`, `readiness/route.ts`, `publish/route.ts`, `hours/route.ts`, `delivery-areas/route.ts`).
- [x] Task 1.3: Add i18n translation strings for restaurant settings across `messages/en.json`, `messages/ur.json`, `messages/ps.json`.
- [x] Task 1.4: Verify with `npm run typecheck && npm run lint`.

## Batch 2: Profile & Availability Management
- [x] Task 2.1: Implement TanStack Query hooks in `src/features/settings/api/restaurant-query.ts`.
- [x] Task 2.2: Implement `ProfileTab` component in `src/features/settings/components/profile-tab.tsx` (logo/cover upload, store info, WhatsApp number, min order amount, availability status, readiness card).
- [x] Task 2.3: Verify with `npm run typecheck && npm run lint`.

## Batch 3: Operating Hours & Delivery Areas Management
- [x] Task 3.1: Implement `HoursTab` component in `src/features/settings/components/hours-tab.tsx` (Monday to Sunday weekly schedule, open/close times, closed toggles).
- [x] Task 3.2: Implement `DeliveryAreasTab` component in `src/features/settings/components/delivery-areas-tab.tsx` (served toggle, delivery fee in PKR).
- [x] Task 3.3: Implement main `SettingsView` in `src/features/settings/components/settings-view.tsx` with tab switching.
- [x] Task 3.4: Create page `src/app/[locale]/dashboard/settings/page.tsx`.
- [x] Task 3.5: Verify with `npm run typecheck && npm run lint`.

## Batch 4: Polish & Integration Verification
- [x] Task 4.1: Run full verify loop (`npm run typecheck`, `npm run lint`, `npm run test`).
- [x] Task 4.2: Git commit.
