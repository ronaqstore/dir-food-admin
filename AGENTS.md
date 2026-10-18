# AGENTS.md — Dir Food Admin Reference (Single Source of Truth)

This document is the **single source of truth** for AI coding agents and developers working on `dir-food-admin`. It replicates the exact architecture and quality gates of `ronaq-store-admin`, adapted for the Dir Food NestJS backend (`dir-food-backend`).

---

## 1. Project Overview & Roles

**Dir Food** is a WhatsApp-first restaurant discovery and food ordering platform for Timergara and Lower Dir, KPK, Pakistan.

- **User Roles in `dir-food-admin` (`http://localhost:3006`)**:
  1. **Restaurant Owner (`RESTAURANT_OWNER`)**: Manages their own restaurant — profile, WhatsApp number, weekly operating hours (`Asia/Karachi`), live availability (`AUTO`, `CLOSED`, `TEMP_UNAVAILABLE`), self-serve publishing (`Go Live` starting 30-day trial), menu categories, menu items with variants (`Half`/`Full`) & R2 images, served delivery areas & fees, incoming WhatsApp order requests (`TM-XXXXXX`), and 7d/30d stats.
  2. **Platform Admin (`PLATFORM_ADMIN`)**: Manages the platform — creates/onboards restaurants, generates single-use password setup links, approves/suspends/deactivates restaurants, extends/shortens 30-day subscriptions, manages master delivery areas (Timergara, Balambat, etc.), looks up order intents by reference, and audits platform activity.

---

## 2. Technology Stack & Strict Rules

| Layer | Technology | Rule |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript 7 | Strict mode; no `any`, no `!`, no `@ts-ignore`, no inline prop object shapes. |
| **Server State** | TanStack Query v5 | `prefetchQuery` + `HydrationBoundary` on server; `useSuspenseQuery` on client; `mutationOptions` for writes. |
| **Forms** | TanStack Form v1 + Zod v4 | Strictly `useAppForm` (`@/lib/form`) + `@/components/forms/fields/*`. No React Hook Form. |
| **URL State** | `nuqs` v2 | Search, pagination, and filters synced with URL query params. |
| **HTTP Client** | Native `fetch` (`apiRequest<T>`) | Wrapped in `@/lib/api/client.ts`. Unwraps `{ data, meta }` and normalizes `{ error: { code, message, details } }`. No Axios. |
| **Tables & Mobile** | `ResponsiveDataTable` + `MobileBottomNav` | Container-driven table/card switching (`<= 639px` = mobile cards + bottom sheet; `>= 1024px` = full table). |
| **i18n & RTL** | `next-intl` (`en`, `ur`, `ps`) | All strings in `messages/*.json`. Logical CSS classes only (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`). |
| **Money** | Integer Paisa (`@/lib/money`) | `toPaisa(pkr)`, `fromPaisa(paisa)`, `formatPkr(paisa)`. Never multiply/divide by `100` inline. |

---

## 3. Directory Structure & Feature Module Anatomy

### 3.1 Allowed Top-Level `src/` Directories
`app`, `components`, `config`, `constants`, `features`, `hooks`, `i18n`, `lib`, `styles`, `types`.

### 3.2 Standard Feature Anatomy
```text
src/features/<module>/
├── api/
│   ├── types.ts        # DTOs, filters, and mutation payloads
│   ├── service.ts      # Typed apiRequest calls
│   ├── queries.ts      # Query key factory (<entity>Keys) + queryOptions()
│   └── mutations.ts    # mutationOptions() + getQueryClient().invalidateQueries()
├── components/         # Feature client views, tables, dialogs, sheets
├── schemas/            # Zod v4 schemas
├── constants/          # Filter options and static configs
└── index.ts            # Public barrel exports


---

## 4. Backend API Endpoints Catalog (`http://localhost:4000`)

| Domain | Method & Path | Role | Description |
|---|---|---|---|
| **Auth** | `POST /auth/login` | Public | Restaurant Owner login `{ phone, password }` |
| | `POST /auth/register` | Public | Self-serve restaurant + owner registration (`PENDING`) |
| | `POST /auth/platform-admin/login` | Public | Platform Admin login `{ phone, password }` |
| | `POST /auth/setup-password` | Public | One-time token password setup `{ token, password }` |
| | `POST /auth/change-password` | Owner | Change password `{ currentPassword, newPassword }` |
| | `GET /auth/me` | Auth | Current user and restaurant profile |
| **Owner Profile** | `GET /me/restaurant` | Owner | Own restaurant profile, hours, and delivery areas |
| | `PATCH /me/restaurant` | Owner | Update profile, WhatsApp number, cuisines, `minOrderAmount` |
| | `GET /me/restaurant/readiness` | Owner | Check 4 prerequisites before publishing |
| | `POST /me/restaurant/publish` | Owner | Self-publish (`PENDING -> ACTIVE`) and start 30-day trial |
| | `PUT /me/restaurant/availability` | Owner | Set `manualStatus` (`AUTO`, `CLOSED`, `TEMP_UNAVAILABLE`) |
| | `POST / DELETE /me/restaurant/images/:kind` | Owner | Upload/remove `logo` or `cover` image |
| **Hours** | `GET / PUT /me/restaurant/hours` | Owner | Weekly schedule (`Asia/Karachi`) |
| **Delivery** | `GET / PUT /me/restaurant/delivery-areas` | Owner | Served areas and optional delivery fees (paisa or `null`) |
| **Categories** | `GET / POST /me/restaurant/categories` | Owner | List and create menu categories |
| | `PATCH /me/restaurant/categories/:id` | Owner | Rename or activate/deactivate category |
| | `PUT /me/restaurant/categories/order` | Owner | Reorder categories `{ ids }` |
| **Menu Items** | `GET / POST /me/restaurant/items` | Owner | List (`?categoryId&page&limit`) and create items |
| | `PATCH /me/restaurant/items/:id` | Owner | Update item, price, or `isAvailable` |
| | `PUT /me/restaurant/items/order` | Owner | Reorder items within a category `{ categoryId, ids }` |
| | `PUT /me/restaurant/items/:id/variants` | Owner | Replace item size variants (`Half`/`Full`) |
| | `POST / DELETE /me/restaurant/items/:id/image` | Owner | Upload/remove item photo |
| **Requests** | `GET /me/restaurant/order-intents` | Owner | List recent WhatsApp requests (`?page&limit&q=TM-...`) |
| | `GET /me/restaurant/order-intents/:id` | Owner | Request snapshot detail (`notConfirmed: true`) |
| | `GET /me/restaurant/stats?range=7d\|30d` | Owner | Requests created, WhatsApp opened, top requested items |
| **Platform Admin** | `GET / POST /admin/restaurants` | Admin | List all restaurants; onboard restaurant + owner + setup link |
| | `GET / PATCH /admin/restaurants/:id` | Admin | Restaurant detail, completeness warnings, support edits, `adminNotes` |
| | `PATCH /admin/restaurants/:id/status` | Admin | Approve (`ACTIVE` + 30d trial), `SUSPENDED`, `DEACTIVATED` |
| | `POST /admin/restaurants/:id/subscription/extend` | Admin | Extend `subscriptionEndsAt` (`addDays` or ISO date) |
| | `POST /admin/restaurants/:id/subscription/shorten` | Admin | Shorten `subscriptionEndsAt` (`confirm: true` + `reason`) |
| | `PATCH /admin/restaurants/:id/slug` | Admin | Change restaurant URL slug |
| | `POST /admin/restaurants/:id/setup-link` | Admin | Issue new single-use password setup link |
| | `GET / POST / PATCH /admin/areas` | Admin | Master delivery areas CRUD |
| | `GET /admin/order-intents?ref=` | Admin | Support lookup by reference code |
| | `GET /admin/activity?range=7d\|30d` | Admin | Platform-wide activity metrics per restaurant |
| | `GET /admin/audit-logs` | Admin | Paginated audit trail (`?restaurantId&action&page`) |