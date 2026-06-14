# AR Restaurant SaaS Platform - Backend API Document

## Overview

This backend is designed as a Spring Boot modular monolith with REST APIs under a localhost base URL for development. The API design is grouped by business role and capability so that Super Admin, Restaurant Owner, Staff, and Customer flows remain clear and tenant-safe.[cite:45][cite:48]

### Development Base URL

`http://localhost:8080/api/v1`

### Main API Principles

- JWT-secured admin, owner, and staff APIs.
- Public or semi-public customer menu APIs for QR access.
- Strict tenant-aware data access.
- Clear role separation.
- RESTful URLs with feature grouping.

## Authentication APIs

| URL | Method | Used by | Purpose | What it does |
|---|---|---|---|---|
| `/auth/login` | POST | Super Admin, Owner, Staff | Login | Verifies credentials and returns JWT access token plus role and tenant context. |
| `/auth/refresh` | POST | Super Admin, Owner, Staff | Refresh token | Issues a new access token when the old one expires if refresh strategy is enabled. |
| `/auth/logout` | POST | Super Admin, Owner, Staff | Logout | Invalidates session/token handling logic on server side if blacklist strategy is used. |
| `/auth/me` | GET | Super Admin, Owner, Staff | Current user | Returns the logged-in user profile, role, and tenant data. |
| `/auth/forgot-password` | POST | Owner, Staff | Reset initiation | Sends password reset instructions. |
| `/auth/reset-password` | POST | Owner, Staff | Password reset | Sets a new password using a secure reset token. |

## Super Admin APIs

### Tenant and Restaurant Control

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/admin/restaurants` | GET | List restaurants | Returns paginated list of all tenant restaurants on the platform. |
| `/admin/restaurants` | POST | Create restaurant tenant | Creates tenant record, owner account, and initial restaurant setup. |
| `/admin/restaurants/{restaurantId}` | GET | Restaurant details | Returns full profile, plan, subscription, and status for one restaurant. |
| `/admin/restaurants/{restaurantId}` | PUT | Update restaurant | Updates platform-level restaurant information. |
| `/admin/restaurants/{restaurantId}/status` | PATCH | Activate or suspend | Changes tenant operational status. |
| `/admin/restaurants/{restaurantId}/impersonate` | POST | Support access | Creates a secure support session so admin can inspect the tenant environment. |

### Plans and Subscription Control

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/admin/plans` | GET | List plans | Returns all subscription plans. |
| `/admin/plans` | POST | Create plan | Creates a new SaaS plan with pricing, duration, and features. |
| `/admin/plans/{planId}` | GET | Plan details | Returns one plan definition. |
| `/admin/plans/{planId}` | PUT | Update plan | Modifies name, pricing, limits, or features of a plan. |
| `/admin/plans/{planId}` | DELETE | Delete plan | Removes a plan if not in protected use. |
| `/admin/subscriptions` | GET | List subscriptions | Returns all tenant subscriptions across the platform. |
| `/admin/subscriptions/{subscriptionId}` | GET | Subscription details | Returns one tenant subscription record. |
| `/admin/subscriptions/{subscriptionId}/status` | PATCH | Change subscription state | Marks active, paused, expired, cancelled, or suspended states. |

### Support and Analytics

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/admin/support-tickets` | GET | List tickets | Returns all support tickets across tenants. |
| `/admin/support-tickets/{ticketId}` | GET | Ticket details | Returns one support ticket. |
| `/admin/support-tickets/{ticketId}/reply` | POST | Reply to ticket | Adds admin response to a support ticket. |
| `/admin/support-tickets/{ticketId}/status` | PATCH | Update status | Changes ticket status such as open, in-progress, resolved, closed. |
| `/admin/analytics/dashboard` | GET | Platform dashboard | Returns total restaurants, active subscriptions, revenue indicators, and trial counts. |
| `/admin/analytics/revenue` | GET | Revenue analytics | Returns revenue metrics and filters by range. |
| `/admin/analytics/trials` | GET | Trial overview | Returns expiring and active trial information. |

## Restaurant Owner APIs

### Restaurant Profile

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/owner/restaurant` | GET | Own restaurant details | Returns current tenant restaurant profile. |
| `/owner/restaurant` | PUT | Update profile | Updates name, address, phone, GST, logo, hours, and other profile data. |
| `/owner/restaurant/settings` | GET | Settings | Returns restaurant configuration values. |
| `/owner/restaurant/settings` | PUT | Update settings | Saves service, tax, display, and ordering settings. |

### Tables and QR

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/owner/tables` | GET | List tables | Returns all tables for the tenant. |
| `/owner/tables` | POST | Create table | Adds a new table with number or code. |
| `/owner/tables/{tableId}` | GET | Table details | Returns one table record. |
| `/owner/tables/{tableId}` | PUT | Update table | Changes table number or related settings. |
| `/owner/tables/{tableId}` | DELETE | Delete table | Deletes a table if safe to remove. |
| `/owner/tables/{tableId}/qr` | GET | Get QR info | Returns QR URL and QR image metadata for a table. |
| `/owner/tables/{tableId}/qr/regenerate` | POST | Regenerate QR | Generates a fresh QR mapping or image if required. |

### Menu Categories

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/owner/categories` | GET | List categories | Returns all menu categories for the tenant. |
| `/owner/categories` | POST | Create category | Creates a category such as beverages or main course. |
| `/owner/categories/{categoryId}` | GET | Category details | Returns one category. |
| `/owner/categories/{categoryId}` | PUT | Update category | Renames or updates category data. |
| `/owner/categories/{categoryId}` | DELETE | Delete category | Deletes a category when allowed. |

### Menu Items

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/owner/menu-items` | GET | List items | Returns all menu items with filtering and pagination. |
| `/owner/menu-items` | POST | Create item | Creates a new dish with pricing, description, category, image, and optional AR model. |
| `/owner/menu-items/{itemId}` | GET | Item details | Returns one item. |
| `/owner/menu-items/{itemId}` | PUT | Update item | Updates dish details, media, price, and availability. |
| `/owner/menu-items/{itemId}` | DELETE | Delete item | Removes an item. |
| `/owner/menu-items/{itemId}/availability` | PATCH | Toggle availability | Marks item available or unavailable. |
| `/owner/menu-items/{itemId}/media` | POST | Upload media metadata | Stores image or model URLs after upload integration completes. |

### Orders

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/owner/orders` | GET | List tenant orders | Returns all orders for the restaurant with filters by status, table, date, or payment status. |
| `/owner/orders/{orderId}` | GET | Order details | Returns detailed order data including items and notes. |
| `/owner/orders/{orderId}/status` | PATCH | Update order status | Changes order state to pending, accepted, preparing, ready, served, or cancelled. |
| `/owner/orders/{orderId}/assign-staff` | PATCH | Assign staff | Links an order to a staff member if workflow requires it. |

### Staff Management

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/owner/staff` | GET | List staff | Returns all staff accounts for the tenant. |
| `/owner/staff` | POST | Create staff | Creates a staff account with role and permissions. |
| `/owner/staff/{staffId}` | GET | Staff details | Returns one staff member record. |
| `/owner/staff/{staffId}` | PUT | Update staff | Updates profile and assigned permissions. |
| `/owner/staff/{staffId}/status` | PATCH | Activate or deactivate | Enables or disables staff access. |
| `/owner/staff/{staffId}` | DELETE | Remove staff | Deletes or archives a staff account. |

### Billing and Support

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/owner/subscription` | GET | Current subscription | Returns current tenant plan, status, dates, and billing information. |
| `/owner/subscription/checkout` | POST | Create payment session | Starts Razorpay plan or payment checkout flow. |
| `/owner/subscription/change-plan` | POST | Upgrade or downgrade | Requests plan change and updates billing workflow. |
| `/owner/subscription/cancel` | POST | Cancel subscription | Starts cancellation flow based on business rules. |
| `/owner/support-tickets` | GET | List own tickets | Returns support tickets raised by this tenant. |
| `/owner/support-tickets` | POST | Raise support ticket | Creates a new support issue. |
| `/owner/support-tickets/{ticketId}` | GET | Ticket details | Returns one ticket. |
| `/owner/support-tickets/{ticketId}/reply` | POST | Add reply | Adds tenant-side message to support conversation. |

### Owner Analytics

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/owner/analytics/dashboard` | GET | Dashboard metrics | Returns order count, revenue, ratings, and subscription summary. |
| `/owner/analytics/popular-items` | GET | Popular dishes | Returns top ordered items. |
| `/owner/analytics/orders-trend` | GET | Orders trend | Returns order count trend by day, week, or month. |
| `/owner/analytics/ratings` | GET | Ratings view | Returns rating trends and feedback summary. |

## Staff APIs

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/staff/orders` | GET | List accessible orders | Returns orders visible to staff according to assigned permissions. |
| `/staff/orders/{orderId}` | GET | Order details | Returns one order and its kitchen or service details. |
| `/staff/orders/{orderId}/status` | PATCH | Update status | Allows staff to update allowed order states. |
| `/staff/kitchen/board` | GET | Kitchen board | Returns kitchen-focused grouped orders for live operational use. |

## Customer APIs

### QR Menu Access

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/public/menu/{tenantSlug}/table/{tableNumber}` | GET | Open QR menu | Validates table and returns restaurant and menu bootstrap data for customer UI. |
| `/public/menu/{tenantSlug}/categories` | GET | Categories | Returns visible categories for customer menu. |
| `/public/menu/{tenantSlug}/items` | GET | Menu items | Returns visible items with category filters and availability. |
| `/public/menu/{tenantSlug}/items/{itemId}` | GET | Item detail | Returns one dish with image, description, price, and AR asset reference if available. |

### Cart and Orders

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/public/orders` | POST | Place order | Creates a new customer order for a restaurant and table. |
| `/public/orders/{orderId}` | GET | Order status | Returns customer-facing order details and current status. |
| `/public/orders/{orderId}/cancel` | POST | Cancel order | Allows cancellation only if business rules permit early-stage cancellation. |

### Customer Feedback

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/public/feedback` | POST | Submit feedback | Stores rating and comment for restaurant or order experience. |

### Customer Optional Profile APIs

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/customer/auth/send-otp` | POST | OTP start | Starts lightweight customer authentication if mobile-based profile is added. |
| `/customer/auth/verify-otp` | POST | OTP verify | Verifies customer OTP and creates customer session. |
| `/customer/profile` | GET | Profile | Returns customer profile information. |
| `/customer/orders` | GET | Order history | Returns prior customer orders if authenticated experience is enabled. |

## Payment APIs

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/payments/razorpay/order` | POST | Create Razorpay order | Creates a Razorpay order object for online order payment. |
| `/payments/razorpay/verify` | POST | Verify payment | Verifies Razorpay payment signature after checkout success. |
| `/payments/razorpay/webhook` | POST | Webhook receiver | Receives asynchronous payment and subscription events from Razorpay. |
| `/payments/subscription/create` | POST | Create subscription flow | Creates Razorpay subscription flow for tenant SaaS billing. |
| `/payments/subscription/verify` | POST | Verify subscription payment | Verifies SaaS subscription payment or authorization event. |

## API Flow Examples

### Example 1: Restaurant Owner Creates Menu Item

1. Owner logs in with `/auth/login`.
2. Frontend stores JWT.
3. Owner creates category using `/owner/categories`.
4. Owner creates item using `/owner/menu-items`.
5. Owner uploads image or model and links it via `/owner/menu-items/{itemId}/media`.

### Example 2: Customer Places Order

1. Customer scans QR.
2. Frontend opens `/public/menu/{tenantSlug}/table/{tableNumber}`.
3. Customer fetches items from `/public/menu/{tenantSlug}/items`.
4. Customer places order using `/public/orders`.
5. Owner and staff fetch it from `/owner/orders` or `/staff/orders`.
6. Status updates happen through `/owner/orders/{orderId}/status` or `/staff/orders/{orderId}/status`.

### Example 3: Owner Renews Subscription

1. Owner opens `/owner/subscription`.
2. Frontend starts checkout via `/owner/subscription/checkout`.
3. Backend creates billing flow using Razorpay endpoints and internal payment services.[cite:3][cite:46]
4. Razorpay sends success or lifecycle updates through `/payments/razorpay/webhook`.[cite:43]

## Notes

This API set is intentionally broad because the target is an end-to-end platform, not a narrow demo. The backend remains one monolithic Spring Boot deployment, but the URL and module structure are organized so the project stays understandable and scalable as it grows.[cite:42][cite:45][cite:48]

## Invoice APIs

If orders are created in the system, invoice generation should also be handled by backend APIs so that billing, reconciliation, and download flows stay consistent. Restaurant billing references note that invoices should include itemization, invoice numbers, total calculations, tax details, and payment information.[cite:68][cite:71][cite:77]

### Owner and Admin Invoice APIs

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/owner/invoices` | GET | List invoices | Returns customer order invoices for the tenant with filters by date, payment status, or order number. |
| `/owner/invoices/{invoiceId}` | GET | Invoice details | Returns one invoice with item lines, totals, tax, and payment references. |
| `/owner/invoices/{invoiceId}/download` | GET | Download invoice | Returns printable invoice or PDF-ready response. |
| `/owner/orders/{orderId}/invoice/generate` | POST | Generate invoice from order | Creates invoice record after order confirmation or payment event. |
| `/owner/orders/{orderId}/invoice/regenerate` | POST | Regenerate invoice | Rebuilds invoice if reissued under allowed business rules. |
| `/admin/invoices` | GET | Platform invoice visibility | Allows Super Admin to inspect invoice records for support or audit. |
| `/admin/subscription-invoices` | GET | SaaS invoice records | Returns subscription billing invoices and receipts for restaurant tenants. |

### Customer Invoice APIs

| URL | Method | Purpose | What it does |
|---|---|---|---|
| `/public/orders/{orderId}/invoice` | GET | Customer invoice view | Returns customer-facing invoice details for the placed order if access rules permit. |
| `/public/orders/{orderId}/invoice/download` | GET | Download receipt | Returns printable receipt or downloadable invoice view. |

## Security and Privacy API Notes

Because the API serves multiple tenants and roles, strong authorization is mandatory at object level. OWASP API guidance warns that object-level authorization failures can allow attackers to access other users’ data simply by changing object IDs in requests.[cite:69][cite:72]

### Mandatory API Security Rules

- Every secured endpoint must validate JWT, role, and tenant ownership together.[cite:69][cite:72]
- Every object fetch by `id` must verify that the requested object belongs to the authenticated tenant or allowed customer context.[cite:69][cite:72]
- Sensitive fields such as payment status, invoice totals, subscription state, and role assignments must not be mass-assignable without explicit permission checks.[cite:75]
- JWT must not contain sensitive personal or internal system data.[cite:73][cite:76]
- Access tokens should be short-lived, and refresh token workflows should be more tightly controlled.[cite:70][cite:73]
- Payment verification endpoints must validate Razorpay signatures before marking payment or invoice state as successful.
- Public APIs such as QR menu, OTP, and order placement should have throttling and abuse protection.

### Sensitive API Areas Requiring Extra Care

| Area | Security concern |
|---|---|
| `/admin/restaurants/{id}/impersonate` | Must be fully audited and restricted. |
| `/owner/orders/{orderId}` | Must prevent access to other tenant orders.[cite:69] |
| `/public/orders/{orderId}` | Must not expose another customer’s order without safe validation. |
| `/owner/invoices/{invoiceId}` | Must verify invoice belongs to the same tenant. |
| `/payments/razorpay/webhook` | Must verify event authenticity before state changes. |
| `/owner/staff/{staffId}` | Must prevent unauthorized role or privilege manipulation.[cite:75] |

