# CLAUDE.md — Dir Food Admin (`dir-food-admin`)

Next.js 16 + React 19 + shadcn/ui Restaurant Owner Dashboard & Platform Admin Portal for Dir Food.

## Key References
- **[AGENTS.md](./AGENTS.md)** — Single Source of Truth for architecture, feature anatomy, API contracts, mobile/PWA UI, and business rules
- **[../docs/01_Requirements_and_Scope.md](../docs/01_Requirements_and_Scope.md)** — Product requirements
- **[../docs/04_API_and_Architecture.md](../docs/04_API_and_Architecture.md)** — Backend API & Next.js structure

## Critical Conventions (Non-Negotiable)
1. **React Query v5** — `await qc.prefetchQuery()` on Server Components + `HydrationBoundary` + `useSuspenseQuery` on Client Components; `mutationOptions()` + `getQueryClient().invalidateQueries()` for mutations.
2. **Feature API Layer** — `src/features/<module>/api/{types.ts,service.ts,queries.ts,mutations.ts}` with query key factories (`<entity>Keys.all/list/detail`).
3. **Forms** — `useAppForm` from `@/lib/form` + `form.AppField` rendering `@/components/forms/fields/*` + Zod v4 schemas. Never use React Hook Form.
4. **Tables & Mobile UI** — Always use `ResponsiveDataTable` (auto-switches to `MobileList` cards on phones <= 639px) + `FloatingActionButton` (`sm:hidden`) + `MobileBottomNav`. Never use raw `<table>` in list views.
5. **Money** — Backend stores integer **paisa** (`1 PKR = 100 paisa`). Always use `toPaisa()`, `fromPaisa()`, and `formatPkr()` from `@/lib/money`.
6. **Multi-Tenancy** — Never send `restaurantId` in owner request bodies. Tenancy is derived strictly from the JWT Bearer token.
7. **Icons & i18n** — Import icons only from `@/components/icons`. Use `next-intl` (`en`, `ur`, `ps`) for all UI text and RTL-safe classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`).