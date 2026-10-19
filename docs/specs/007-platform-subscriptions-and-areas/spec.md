# Spec: [007] Platform Subscriptions & Master Delivery Areas

- **Status:** Approved
- **Author:** AI + Usman
- **Date:** 2026-10-19
- **Target Module:** `src/features/platform/`, `src/app/[locale]/dashboard/platform/subscriptions/`, `src/app/[locale]/dashboard/platform/settings/`

---

## 1. Context & Business Value
- **Who needs this:** Platform Admin / Super Admin for Dir Food in Timergara & Lower Dir.
- **Problem solved:**
  1. **Subscriptions Hub (`/dashboard/platform/subscriptions`)**: Track which restaurant subscriptions are currently active, in 30-day trial, expiring soon (<7 days), or expired. Enable rapid offline subscription extensions (+30, +60, +90, +365 days) when owners pay via cash, JazzCash, or Easypaisa.
  2. **Master Delivery Areas (`/dashboard/platform/settings`)**: Manage the standard geographical coverage areas of Timergara and Lower Dir (e.g. *Timergara Main Bazaar*, *Balambat*, *Talash*, *Khadagzai*, *Munda*, *Timergara Hospital Road*). Restaurants select from these master areas to set their delivery fees.
- **User Journey:**
  1. Platform Admin navigates to **Subscriptions** (`/dashboard/platform/subscriptions`), filters by "Expiring Soon", identifies restaurants requiring renewal, and clicks "Extend Subscription".
  2. Platform Admin navigates to **Settings** (`/dashboard/platform/settings`), views all Timergara delivery areas, creates new neighborhoods, or reorders them by priority.

---

## 2. Access Control & Multi-Tenancy (CRITICAL)
- **Role(s) Allowed:** `PLATFORM_ADMIN`
- **Guards Applied:** Authenticated session with `PLATFORM_ADMIN` role.
- **Tenant Scope:** Platform-wide admin access across Lower Dir.

---

## 3. API Contract & Endpoints

### 3.1 Subscriptions
- Handled through `GET /admin/restaurants` and `POST /admin/restaurants/:id/subscription/extend`.

### 3.2 Master Areas (`/admin/areas`)
| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/admin/areas` | `PLATFORM_ADMIN` | List all master delivery areas with active restaurant counts |
| `POST` | `/admin/areas` | `PLATFORM_ADMIN` | Create a new master delivery area |
| `PATCH` | `/admin/areas/:id` | `PLATFORM_ADMIN` | Update area name, slug, sort order, or active status |

---

## 4. UI/UX Features
- **Subscriptions Page (`/dashboard/platform/subscriptions`)**:
  - Summary cards: Total Subscriptions, Active, Expiring Soon (≤ 7 days), Expired.
  - Subscriptions table with days remaining countdown badge, expiry date, owner contact, and quick "Extend Subscription" button.
  - Search by restaurant or owner name.
- **Settings Page (`/dashboard/platform/settings`)**:
  - Master delivery areas list with sort order, active switch, and active restaurants count.
  - "Add Master Area" modal (`CreateAreaDialog`).
  - "Edit Area" modal (`EditAreaDialog`).
- **Trilingual localization**: English, Urdu, and Pashto with RTL support.
