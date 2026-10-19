# Spec: [005] Orders & Order Intents (WhatsApp Flow)

- **Status:** Approved
- **Author:** AI + Usman
- **Date:** 2026-10-19
- **Target Module:** `src/features/orders/`, `src/app/[locale]/dashboard/orders/`

---

## 1. Context & Business Value
- **Who needs this:** Restaurant Owners in Lower Dir / Timergara.
- **Problem solved:** In Dir Food, customers build carts and initiate WhatsApp order handoffs. Restaurant owners need a real-time order dashboard (`/dashboard/orders`) to see incoming order intents, track status (`WHATSAPP_HANDOFF_READY` vs `WHATSAPP_OPENED`), view customer address & landmark in Timergara, review dish quantities and total PKR amounts, directly tap to open customer WhatsApp chats, and monitor order volume analytics.
- **User Journey:**
  1. Restaurant Owner navigates to **Orders** (`/dashboard/orders`).
  2. Views recent orders in an organized list/table with status badges, customer details, area, and total amount in PKR.
  3. Clicks an order row to open the **Order Details Modal** displaying dish items snapshot, quantities, line totals, delivery fee, landmark, and a direct WhatsApp button.
  4. Filters orders by status or searches by reference code (e.g. `TM-7K4P9Q`).

---

## 2. Access Control & Multi-Tenancy (CRITICAL)
- **Role(s) Allowed:** `RESTAURANT_OWNER`
- **Guards Applied:** Authenticated session with `RESTAURANT_OWNER` role.
- **Tenant Isolation:** Enforced on backend via JWT bearer token (`user.restaurantId`). Backend automatically filters `orderIntent.restaurantId = user.restaurantId`.

---

## 3. API Contract & Endpoints

### 3.1 Order Intents (`/me/restaurant/order-intents`)
| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/me/restaurant/order-intents?page=&limit=&q=&status=` | `RESTAURANT_OWNER` | List incoming orders (last 30 days) |
| `GET` | `/me/restaurant/order-intents/:id` | `RESTAURANT_OWNER` | Get complete order details with item snapshots |
| `GET` | `/me/restaurant/stats?range=7d` | `RESTAURANT_OWNER` | Get requests count, WhatsApp opened count, and top items |

---

## 4. UI/UX Features
- **Summary Metrics Cards:**
  - Total Orders (Last 30 Days)
  - WhatsApp Inquiries Opened
  - Estimated Order Volume in PKR
- **Orders Table / Cards:**
  - Reference code (e.g. `TM-7K4P9Q`)
  - Customer name & phone number
  - Delivery neighborhood in Timergara & landmark
  - Items summary (e.g. *1x Special Chicken Karahi, 2x Naan*)
  - Total Amount (`subtotal + deliveryFee`) formatted with `formatPkr`
  - Status badge: `WHATSAPP_HANDOFF_READY` vs `WHATSAPP_OPENED`
  - Action button: View details & chat on WhatsApp
- **Order Details Modal:**
  - Full items breakdown with unit price, quantity, line total
  - Customer delivery location, landmark, and optional directions
  - Delivery fee status (`KNOWN` vs `TO_BE_CONFIRMED`)
  - Direct WhatsApp chat link (`https://wa.me/92...`)
- Trilingual localization (`en`, `ur`, `ps`) with RTL support.
