# Tasks: [003] Menu & Catalog Management

## Batch 1: Money Helpers, Types & Translations
- [x] Task 1.1: Create `src/lib/money/index.ts` with `toPaisa`, `fromPaisa`, and `formatPkr`.
- [x] Task 1.2: Define TypeScript types for Categories (`src/features/categories/types.ts`) and Menu Items (`src/features/menu/types.ts`).
- [x] Task 1.3: Add i18n translation strings for Categories and Menu across `messages/en.json`, `messages/ur.json`, `messages/ps.json`.
- [x] Task 1.4: Verify with `npm run typecheck && npm run lint`.

## Batch 2: Category Management Feature
- [x] Task 2.1: Implement category TanStack Query hooks in `src/features/categories/api/categories-query.ts`.
- [x] Task 2.2: Implement `CategoryDialog` in `src/features/categories/components/category-dialog.tsx` (create and rename).
- [x] Task 2.3: Implement `CategoryList` in `src/features/categories/components/category-list.tsx` (data table, active toggle, reorder indicators, empty state).
- [x] Task 2.4: Create page `src/app/[locale]/dashboard/categories/page.tsx` and ensure navigation works.
- [x] Task 2.5: Verify with `npm run typecheck && npm run lint`.

## Batch 3: Menu Item Management Feature
- [x] Task 3.1: Implement menu item TanStack Query hooks in `src/features/menu/api/menu-query.ts` (list, create, update, image upload, delete image).
- [x] Task 3.2: Implement `MenuItemDialog` in `src/features/menu/components/menu-item-dialog.tsx` (supports base price or variants, category selector, image upload).
- [x] Task 3.3: Implement `MenuList` in `src/features/menu/components/menu-list.tsx` (category tabs/filter, search bar, item cards/table, instant availability toggle switch).
- [x] Task 3.4: Create page `src/app/[locale]/dashboard/menu/page.tsx`.
- [x] Task 3.5: Verify with `npm run typecheck && npm run lint`.

## Batch 4: Polish & Integration Verification
- [x] Task 4.1: Ensure overview quick action links lead directly to categories and menu.
- [x] Task 4.2: Run full verify loop (`npm run typecheck`, `npm run lint`, `npm run test`).
- [x] Task 4.3: Git commit.

