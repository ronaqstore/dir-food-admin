# Tasks: [007] Platform Subscriptions & Master Delivery Areas

## Batch 1: Types, Route Handlers & Translations
- [x] Task 1.1: Add `MasterArea`, `CreateAreaInput`, `UpdateAreaInput` models in `src/features/platform/types.ts`.
- [x] Task 1.2: Create Next.js API route handlers in `src/app/api/admin/areas/` (`route.ts`, `[id]/route.ts`).
- [x] Task 1.3: Add trilingual translations under `platformSubscriptions` and `platformAreas`.
- [x] Task 1.4: Verify with `npm run typecheck && npm run lint`.

## Batch 2: Subscriptions Hub & Master Areas Components
- [x] Task 2.1: Add `useMasterAreas`, `useCreateMasterArea`, `useUpdateMasterArea` hooks in `src/features/platform/api/platform-query.ts`.
- [x] Task 2.2: Implement `SubscriptionsView` component in `src/features/platform/components/subscriptions-view.tsx`.
- [x] Task 2.3: Implement `MasterAreaDialog` component in `src/features/platform/components/master-area-dialog.tsx`.
- [x] Task 2.4: Implement `PlatformSettingsView` component in `src/features/platform/components/platform-settings-view.tsx`.
- [x] Task 2.5: Verify with `npm run typecheck && npm run lint`.

## Batch 3: Pages Integration, Verification & Git Commit
- [x] Task 3.1: Create page `src/app/[locale]/dashboard/platform/subscriptions/page.tsx`.
- [x] Task 3.2: Create page `src/app/[locale]/dashboard/platform/settings/page.tsx`.
- [x] Task 3.3: Run full verify loop (`npm run typecheck`, `npm run lint`, `npm run test`).
- [x] Task 3.4: Git commit Phase 7.
