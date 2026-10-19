# Tasks: [005] Orders & Order Intents (WhatsApp Flow)

## Batch 1: Types, Route Handlers & Translations
- [x] Task 1.1: Support `rawResponse?: boolean` in `src/lib/api/types.ts` and `src/lib/api/proxy.ts`.
- [x] Task 1.2: Create `src/features/orders/types.ts` with order intent, item, stats, and filter models.
- [x] Task 1.3: Create Next.js API route handlers in `src/app/api/orders/` (`route.ts`, `[id]/route.ts`, `stats/route.ts`).
- [x] Task 1.4: Add trilingual translations (`en`, `ur`, `ps`) under `orders` namespace.
- [x] Task 1.5: Verify with `npm run typecheck && npm run lint`.

## Batch 2: Orders Query & Components
- [x] Task 2.1: Implement TanStack Query hooks in `src/features/orders/api/orders-query.ts`.
- [x] Task 2.2: Implement `OrderDetailsDialog` component in `src/features/orders/components/order-details-dialog.tsx`.
- [x] Task 2.3: Implement `OrdersList` component in `src/features/orders/components/orders-list.tsx` with summary metrics, filter bar, status badges, and direct WhatsApp actions.
- [x] Task 2.4: Create page `src/app/[locale]/dashboard/orders/page.tsx`.
- [x] Task 2.5: Verify with `npm run typecheck && npm run lint`.

## Batch 3: Polish & Integration Verification
- [x] Task 3.1: Run full verify loop (`npm run typecheck`, `npm run lint`, `npm run test`).
- [x] Task 3.2: Git commit Phase 5.
