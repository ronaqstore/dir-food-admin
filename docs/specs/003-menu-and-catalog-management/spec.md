# Spec: [003] Menu & Catalog Management (Categories & Items)

- **Status:** Approved
- **Author:** AI + Usman
- **Date:** 2026-10-19
- **Target Module:** `src/features/categories/`, `src/features/menu/`, `src/app/[locale]/dashboard/`

---

## 1. Context & Business Value
- **Who needs this:** Restaurant Owners in Lower Dir / Timergara.
- **Problem solved:** Restaurant owners must be able to organize their digital catalog into categories (e.g., Karahi, BBQ, Rice, Breads, Beverages), set item names and descriptions, configure pricing in PKR (paisa on backend), define size variants (e.g., Half / Full), upload mouth-watering photos, and toggle stock availability in real time.
- **User Journey:**
  1. Restaurant Owner navigates to **Categories** (`/dashboard/categories`), creates food categories, and arranges their order.
  2. Owner navigates to **Menu Items** (`/dashboard/menu`), selects a category, creates food items with pricing or size variants, and attaches a photo.
  3. When an item runs out during the evening rush, owner flips the "Available" switch to instantly mark it sold out.

---

## 2. Access Control & Multi-Tenancy (CRITICAL)
- **Role(s) Allowed:** `RESTAURANT_OWNER`
- **Guards Applied:** Authenticated session with `RESTAURANT_OWNER` role. Platform admins navigating to `/dashboard/categories` or `/dashboard/menu` are automatically redirected to `/dashboard/platform`.
- **Tenant Isolation:** Enforced on backend via JWT bearer token (`user.restaurantId`). Frontend sends requests with Bearer auth; no `restaurantId` is passed in client request bodies.

---

## 3. API Contract & Endpoints

### 3.1 Menu Categories (`/me/restaurant/categories`)
| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/me/restaurant/categories` | `RESTAURANT_OWNER` | List all categories with item counts |
| `POST` | `/me/restaurant/categories` | `RESTAURANT_OWNER` | Create a new category (`name`) |
| `PATCH` | `/me/restaurant/categories/:id` | `RESTAURANT_OWNER` | Update name and/or `isActive` toggle |
| `PUT` | `/me/restaurant/categories/order` | `RESTAURANT_OWNER` | Reorder category display (`ids: string[]`) |

### 3.2 Menu Items (`/me/restaurant/items`)
| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/me/restaurant/items?categoryId=&page=&limit=` | `RESTAURANT_OWNER` | List menu items with variants |
| `POST` | `/me/restaurant/items` | `RESTAURANT_OWNER` | Create item with `basePrice` or `variants` |
| `PATCH` | `/me/restaurant/items/:id` | `RESTAURANT_OWNER` | Update details, price, category, `isAvailable` |
| `PUT` | `/me/restaurant/items/order` | `RESTAURANT_OWNER` | Reorder items within category |
| `PUT` | `/me/restaurant/items/:id/variants` | `RESTAURANT_OWNER` | Replace variants array |
| `POST` | `/me/restaurant/items/:id/image` | `RESTAURANT_OWNER` | Upload multipart JPEG/PNG/WebP image (max 3MB) |
| `DELETE` | `/me/restaurant/items/:id/image` | `RESTAURANT_OWNER` | Remove image |

---

## 4. Money & Currency Architecture
- Backend stores prices as integer **paisa** ($1\text{ PKR} = 100\text{ paisa}$).
- Helper library in `src/lib/money/index.ts`:
  - `toPaisa(rupees: number): number`
  - `fromPaisa(paisa: number): number`
  - `formatPkr(paisa: number): string` (renders `Rs 1,200`)
- Forms take PKR rupees input from the user and convert to integer paisa upon submit.

---

## 5. UI/UX & Design Conventions
- Built with Tailwind CSS, Base UI, Tabler Icons, Lucide Icons, and `@tanstack/react-query`.
- Fully responsive across desktop, tablet, and mobile.
- Complete RTL support for Urdu (`ur`) and Pashto (`ps`).
- Loading skeletons, empty states, and error alerts.
- Optimistic updates or fast toast notifications with `sonner`.

---

## 6. Acceptance Criteria
- [ ] Categories can be created, edited, toggled active/inactive, and reordered.
- [ ] Menu items can be listed, filtered by category, and searched by name.
- [ ] Menu items can be created with either a base price or multiple size variants.
- [ ] Availability toggle (`isAvailable`) can be clicked directly to immediately change status.
- [ ] Photos can be uploaded and displayed with proper image previews.
- [ ] Full localization in English, Urdu, and Pashto.
- [ ] Strict TypeScript (`tsc --noEmit`) and linter (`oxlint`) checks pass with 0 errors.

