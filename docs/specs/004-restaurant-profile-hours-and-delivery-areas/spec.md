# Spec: [004] Restaurant Profile, Operating Hours & Delivery Areas

- **Status:** Approved
- **Author:** AI + Usman
- **Date:** 2026-10-19
- **Target Module:** `src/features/settings/`, `src/app/[locale]/dashboard/settings/`

---

## 1. Context & Business Value
- **Who needs this:** Restaurant Owners in Lower Dir / Timergara.
- **Problem solved:** Restaurants need to set up and manage their store identity (business name, WhatsApp ordering number, address, minimum order), specify weekly opening/closing times (to prevent orders when kitchen is closed), configure which neighborhoods in Timergara/Lower Dir they deliver to along with delivery charges, and track their launch readiness checklist before going live.
- **User Journey:**
  1. Restaurant Owner navigates to **Settings** (`/dashboard/settings`).
  2. In the **Profile** tab, updates contact phone, WhatsApp order number, store description, minimum order in PKR, and uploads brand logo / storefront cover.
  3. In the **Operating Hours** tab, sets weekly open/close times (e.g. 11:00 to 23:00) and marks days off.
  4. In the **Delivery Areas** tab, selects served Timergara areas and sets delivery fees.
  5. Reviews the readiness checklist and clicks **Publish Restaurant** to go live.

---

## 2. Access Control & Multi-Tenancy (CRITICAL)
- **Role(s) Allowed:** `RESTAURANT_OWNER`
- **Guards Applied:** Authenticated session with `RESTAURANT_OWNER` role.
- **Tenant Isolation:** Enforced on backend via JWT bearer token (`user.restaurantId`). Frontend interacts via Next.js proxy route handlers with session Bearer token.

---

## 3. API Contract & Endpoints

### 3.1 Profile & Status (`/me/restaurant`)
| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/me/restaurant` | `RESTAURANT_OWNER` | Get restaurant profile, current hours, areas |
| `PATCH` | `/me/restaurant` | `RESTAURANT_OWNER` | Update profile fields (name, phone, whatsapp, minOrderAmount in paisa) |
| `PUT` | `/me/restaurant/availability` | `RESTAURANT_OWNER` | Update manual availability status (`AUTO`, `CLOSED`, `TEMP_UNAVAILABLE`) |
| `POST` | `/me/restaurant/images/:kind` | `RESTAURANT_OWNER` | Upload logo or cover image (JPEG/PNG/WebP, max 3MB) |
| `DELETE` | `/me/restaurant/images/:kind` | `RESTAURANT_OWNER` | Delete logo or cover image |
| `GET` | `/me/restaurant/readiness` | `RESTAURANT_OWNER` | Get publishing prerequisites status |
| `POST` | `/me/restaurant/publish` | `RESTAURANT_OWNER` | Self-publish restaurant (starts 30-day trial) |

### 3.2 Operating Hours (`/me/restaurant/hours`)
| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/me/restaurant/hours` | `RESTAURANT_OWNER` | Get 7-day schedule |
| `PUT` | `/me/restaurant/hours` | `RESTAURANT_OWNER` | Replace weekly schedule (`days: DayHoursDto[]`) |

### 3.3 Delivery Areas (`/me/restaurant/delivery-areas`)
| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/me/restaurant/delivery-areas` | `RESTAURANT_OWNER` | List all platform areas with served status & fee |
| `PUT` | `/me/restaurant/delivery-areas` | `RESTAURANT_OWNER` | Update served areas & fees in paisa |

---

## 4. UI/UX Structure
- **Settings Page (`/dashboard/settings`):**
  - Tab navigation:
    1. **Profile (`profile`)**: Logo/Cover, basic info, WhatsApp number, Min Order, Availability toggle, Readiness card.
    2. **Hours (`hours`)**: 7-day schedule with open/close time pickers and closed-day toggles.
    3. **Delivery Areas (`delivery`)**: List of neighborhoods with served switch and PKR delivery fee input.
- Fully localized in English, Urdu, and Pashto with RTL support.
- Responsive for mobile, tablet, and desktop.
