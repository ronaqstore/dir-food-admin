# Spec: [006] Platform Admin Restaurant Management & Approvals

- **Status:** Approved
- **Author:** AI + Usman
- **Date:** 2026-10-19
- **Target Module:** `src/features/platform/`, `src/app/[locale]/dashboard/platform/restaurants/`

---

## 1. Context & Business Value
- **Who needs this:** Platform Admin / Super Admin for Dir Food in Timergara & Lower Dir.
- **Problem solved:** Platform admins need a central portal to review incoming restaurant applications, inspect readiness prerequisites (active items, delivery areas, hours, WhatsApp number), approve restaurants into their 30-day free trial, suspend/deactivate violating accounts, register restaurants on behalf of owners (admin-assisted onboarding) with a one-time setup password link, and extend subscriptions after receiving offline cash or Easypaisa/JazzCash payments.
- **User Journey:**
  1. Platform Admin navigates to `/dashboard/platform/restaurants`.
  2. Filters by status (`ALL`, `PENDING`, `ACTIVE`, `SUSPENDED`, `DEACTIVATED`) or searches by name, slug, or phone.
  3. Clicks **Review** on a pending restaurant to inspect owner information, menu completeness, and approve with 1 click.
  4. Clicks **Add Restaurant** to create a restaurant + owner record and immediately copy the single-use setup password link to send via WhatsApp.
  5. Clicks **Extend Subscription** to grant +30, +60, or +90 days after offline cash collection in Lower Dir.

---

## 2. Access Control & Multi-Tenancy (CRITICAL)
- **Role(s) Allowed:** `PLATFORM_ADMIN`
- **Guards Applied:** Authenticated session with `PLATFORM_ADMIN` role.
- **Tenant Scope:** Platform Admin operates cross-tenant with full visibility across all restaurants in Lower Dir.

---

## 3. API Contract & Endpoints

| Method | Path | Auth / Role | Description |
|---|---|---|---|
| `GET` | `/admin/restaurants?page=&limit=&q=&status=` | `PLATFORM_ADMIN` | List all restaurants with search & filters |
| `POST` | `/admin/restaurants` | `PLATFORM_ADMIN` | Admin-assisted onboarding (creates restaurant + owner + setup link) |
| `GET` | `/admin/restaurants/:id` | `PLATFORM_ADMIN` | Full restaurant details & approval readiness checklist |
| `PATCH` | `/admin/restaurants/:id` | `PLATFORM_ADMIN` | Edit restaurant profile & admin notes |
| `PATCH` | `/admin/restaurants/:id/status` | `PLATFORM_ADMIN` | Approve (`ACTIVE`), suspend, or deactivate |
| `POST` | `/admin/restaurants/:id/subscription/extend` | `PLATFORM_ADMIN` | Extend subscription by N days |
| `POST` | `/admin/restaurants/:id/setup-link` | `PLATFORM_ADMIN` | Re-generate single-use setup link |

---

## 4. UI/UX Features
- **Summary Metrics**:
  - Total Restaurants
  - Pending Approvals
  - Active Stores
  - Suspended / Inactive
- **Search & Filter Bar**:
  - Search by store name, slug, or phone number
  - Status tabs (`All`, `Pending`, `Active`, `Suspended`, `Deactivated`)
  - "Add Restaurant" button (opens assisted onboarding dialog)
- **Restaurants Table**:
  - Store Name & slug
  - Owner Name & phone number
  - Status badge with color coding
  - Subscription status & expiry date
  - Counts: active items, delivery areas, hours configured
  - Actions dropdown / buttons:
    - Review & Approve (for Pending)
    - Extend Subscription
    - Copy Setup Link
    - Suspend / Reactivate
- **Modals**:
  - `CreateRestaurantDialog`: Admin-assisted onboarding with name, phone, WhatsApp, owner name, initial cuisines, and setup link display with 1-click copy.
  - `ReviewApprovalDialog`: Shows readiness checklist (WhatsApp, Hours, Active Items, Delivery Areas) with one-click "Approve & Start 30-Day Trial".
  - `ExtendSubscriptionDialog`: Quick presets (+30 days, +60 days, +90 days, +365 days) and custom days with notes.
  - `StatusChangeDialog`: Required reason prompt for suspension / deactivation.
