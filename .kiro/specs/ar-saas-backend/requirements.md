# Requirements Document — AR Smart Menu SaaS Backend

## Introduction

Yeh document ek production-grade multi-tenant SaaS backend ke liye complete requirements define karta hai jisko **AR Smart Menu** platform ke naam se jaana jaata hai. Platform restaurant owners ko ek QR-code-based Augmented Reality menu system provide karta hai jahan customers table pe QR scan karke 3D food models dekh sakte hain, cart mein items add kar sakte hain, OTP se login karke order place kar sakte hain.

**Tech Stack (as-is):** Java 17, Spring Boot 3.2.5, Maven, MySQL, Redis, Cloudinary, Razorpay, ZXing (QR), Bucket4j (rate limiting), JJWT 0.12.5, MapStruct, spring-dotenv.

**Roles:** Super Admin (platform owner), Restaurant Owner / Tenant (primary SaaS user), Manager, Staff, Customer (end diner).

**Current State:** Foundation, auth, restaurant (partial), subscription (Razorpay integrated), analytics (scan events), AR menu (public read), QR (partial), media, menu entity, common utilities — already implemented. Remaining modules need to be built per this spec.

---

## Glossary

- **System**: The AR Smart Menu Spring Boot backend application
- **Super_Admin**: A platform-level administrator with full access to all tenants
- **Tenant**: A restaurant owner account — the primary SaaS subscriber
- **Restaurant**: A restaurant entity owned by a Tenant
- **Manager**: A staff member with elevated permissions within a single Restaurant
- **Staff**: A restaurant employee who manages orders
- **Customer**: A diner who scans a QR code to view the menu and place orders
- **QR_Code**: A QR image that encodes the AR menu URL for a specific Table
- **Table**: A physical restaurant table identified by a label (e.g., Table-1)
- **Menu_Item**: A food or beverage item listed in a Category within a Restaurant's menu
- **Category**: A grouping of Menu_Items (e.g., Pizza, Drinks, Desserts)
- **AR_Model**: A 3D model file (GLTF/GLB) stored in Cloudinary and linked to a Menu_Item
- **Subscription**: A billing relationship between a Tenant and the platform, backed by Razorpay
- **Plan**: A tier (TRIAL, STARTER, GROWTH, ENTERPRISE) that defines feature limits
- **Order**: A confirmed set of Order_Items placed by a Customer at a Table
- **Order_Item**: A single Menu_Item line within an Order, with quantity and price snapshot
- **Cart**: A temporary, Redis-backed in-memory basket for a Customer session before order placement
- **OTP**: A 6-digit one-time password sent to a Customer's phone/email for authentication
- **BaseEntity**: A JPA MappedSuperclass providing UUID id, tenant_id, created_at, updated_at, is_deleted fields
- **ApiResponse**: A standard JSON envelope `{success, message, data, timestamp}` returned by all endpoints
- **JwtAuthFilter**: A Spring Security filter that validates JWT access tokens on every request
- **RateLimitFilter**: A Bucket4j-based filter that enforces per-IP request rate limits
- **Audit_Log**: An immutable record of every write action performed by a user
- **Scan_Event**: An analytics event recorded each time a Customer scans a QR code
- **Cloudinary**: The CDN used to store and serve food images and AR 3D models
- **Razorpay**: The payment gateway used for subscription billing
- **Redis**: In-memory cache used for JWT refresh token storage, menu caching, cart sessions, and OTP storage
- **Dashboard**: A summary view for a Tenant showing key business metrics

---

## Requirements

---

### Requirement 1: Project Foundation — Common Infrastructure

**User Story:** As a developer, I want standardized infrastructure utilities, so that all modules use consistent patterns for IDs, responses, error handling, and security.

#### Acceptance Criteria

1. THE System SHALL use `BaseEntity` as the parent class for all JPA entities, providing UUID primary key (auto-generated), `tenant_id`, `created_at`, `updated_at`, and soft-delete flag `is_deleted`.
2. THE System SHALL return all API responses in the `ApiResponse<T>` envelope containing `success` (boolean), `message` (string), `data` (generic), and `timestamp` (ISO-8601).
3. WHEN an unhandled exception occurs, THE System SHALL return an `ApiResponse` with `success: false` and an appropriate HTTP status code via `GlobalExceptionHandler`.
4. WHEN a `404 Not Found` condition occurs, THE System SHALL return HTTP 404 with a descriptive message and `success: false`.
5. WHEN a `403 Forbidden` condition occurs, THE System SHALL return HTTP 403 with `success: false` and not expose internal role logic.
6. WHEN a validation constraint is violated on a request body, THE System SHALL return HTTP 400 with a field-level error map inside `data`.
7. THE System SHALL enforce layered architecture: all request handling MUST pass through Controller → Service → Repository, never Controller → Repository directly.
8. THE System SHALL prefix all API paths with `/api/v1/`.
9. THE System SHALL expose Swagger UI at `/swagger-ui.html` and OpenAPI spec at `/api-docs`, accessible without authentication.
10. THE System SHALL use `tenant_id` on every BaseEntity to scope all database queries within a tenant's data boundary.

---

### Requirement 2: Rate Limiting

**User Story:** As a platform operator, I want per-IP rate limiting on all endpoints, so that the platform is protected from abuse and brute-force attacks.

#### Acceptance Criteria

1. THE RateLimitFilter SHALL apply to all incoming HTTP requests before JWT authentication.
2. WHEN a client IP exceeds the configured request quota within a time window, THE RateLimitFilter SHALL return HTTP 429 Too Many Requests.
3. THE RateLimitFilter SHALL use Bucket4j token-bucket algorithm to track per-IP request counts.
4. WHEN a rate-limited request is blocked, THE System SHALL return `{"success": false, "message": "Too many requests"}` without processing the request further.

---

### Requirement 3: Authentication — JWT Access + Refresh Token Flow

**User Story:** As a Super Admin or Tenant (Restaurant Owner), I want to log in and receive JWT tokens, so that I can securely access protected APIs.

#### Acceptance Criteria

1. WHEN a user submits valid credentials to `POST /api/v1/auth/login`, THE System SHALL return an `AuthResponse` containing a short-lived access token (15 minutes) and a long-lived refresh token (7 days).
2. WHEN a user submits invalid credentials to `POST /api/v1/auth/login`, THE System SHALL return HTTP 401 with `success: false`.
3. WHEN a valid refresh token is submitted to `POST /api/v1/auth/refresh-token`, THE System SHALL return a new access token and rotate the refresh token.
4. WHEN an expired or invalid refresh token is submitted, THE System SHALL return HTTP 401.
5. WHEN `POST /api/v1/auth/logout` is called with a valid refresh token, THE System SHALL invalidate the refresh token in Redis so it cannot be reused.
6. THE JwtAuthFilter SHALL extract the Bearer token from the `Authorization` header and validate it on every protected request.
7. WHEN a request carries an expired or malformed JWT, THE JwtAuthFilter SHALL return HTTP 401 without forwarding the request to the controller.
8. THE System SHALL store refresh tokens in Redis with TTL equal to the refresh token expiration (7 days).
9. WHEN `GET /api/v1/auth/me` is called with a valid JWT, THE System SHALL return the authenticated user's profile data (id, name, email, role).
10. THE System SHALL support role-based access via Spring Security `@PreAuthorize` annotations, using roles: SUPER_ADMIN, RESTAURANT_OWNER, MANAGER, STAFF, CUSTOMER.

---

### Requirement 4: Restaurant Owner Registration

**User Story:** As a new restaurant owner, I want to register an account, so that I can access the platform and set up my restaurant.

#### Acceptance Criteria

1. WHEN `POST /api/v1/auth/register` is called with name, email, and password, THE System SHALL create a User with role RESTAURANT_OWNER and return an `AuthResponse`.
2. WHEN a registration request includes an email already in use, THE System SHALL return HTTP 409 Conflict with `success: false`.
3. THE System SHALL hash passwords using BCrypt before persisting to the database.
4. WHEN a new Tenant registers, THE System SHALL auto-assign a TRIAL plan subscription with a 14-day expiry.
5. THE System SHALL validate that the email field matches a valid email format and password is at minimum 8 characters; IF validation fails, THE System SHALL return HTTP 400 with field-level errors.

---

### Requirement 5: Super Admin Management

**User Story:** As a Super Admin, I want full visibility and control over all tenants, restaurants, and subscriptions, so that I can manage the platform effectively.

#### Acceptance Criteria

1. THE System SHALL restrict all `/api/v1/admin/**` endpoints to users with role SUPER_ADMIN.
2. WHEN `GET /api/v1/admin/tenants` is called, THE System SHALL return a paginated list of all registered Tenant accounts with their subscription status.
3. WHEN `GET /api/v1/admin/tenants/{tenantId}` is called, THE System SHALL return detailed Tenant profile including active subscription, restaurant count, and plan.
4. WHEN `POST /api/v1/admin/tenants/{tenantId}/activate` is called, THE System SHALL set the Tenant's `is_active` flag to true.
5. WHEN `POST /api/v1/admin/tenants/{tenantId}/deactivate` is called, THE System SHALL set the Tenant's `is_active` flag to false and prevent further API access by that Tenant.
6. WHILE a Tenant is deactivated, THE System SHALL return HTTP 403 for all requests made by that Tenant's users.
7. WHEN `GET /api/v1/admin/stats` is called, THE System SHALL return platform-level stats: total tenants, active subscriptions by plan, total orders today, and total revenue this month.
8. WHEN `POST /api/v1/admin/tenants/{tenantId}/assign-plan` is called with a valid plan, THE System SHALL update the Tenant's subscription plan and reset the billing cycle.

---

### Requirement 6: Restaurant Management

**User Story:** As a Tenant, I want to create and manage my restaurant profile, so that customers see accurate information when they scan my QR code.

#### Acceptance Criteria

1. WHEN `POST /api/v1/restaurants` is called by an authenticated RESTAURANT_OWNER, THE System SHALL create a Restaurant linked to that owner's `tenant_id`.
2. THE System SHALL enforce a maximum number of restaurants per Tenant based on their active Plan (STARTER: 1, GROWTH: 3, ENTERPRISE: unlimited).
3. WHEN a Tenant attempts to create a Restaurant beyond their plan limit, THE System SHALL return HTTP 403 with a plan upgrade message.
4. WHEN `PUT /api/v1/restaurants/{id}` is called, THE System SHALL update only the fields provided (name, description, address, phone, cuisineType, logoUrl).
5. WHEN `GET /api/v1/restaurants` is called by a RESTAURANT_OWNER, THE System SHALL return only the restaurants belonging to that Tenant.
6. WHEN `GET /api/v1/restaurants/{id}` is called, THE System SHALL verify the restaurant belongs to the requesting Tenant before returning data; IF not, THE System SHALL return HTTP 403.
7. WHEN `POST /api/v1/restaurants/{id}/activate` is called by a Super Admin or the owning Tenant, THE System SHALL set the Restaurant's active status to true.
8. WHEN `POST /api/v1/restaurants/{id}/deactivate` is called, THE System SHALL set the Restaurant's active status to false and make its QR menu inaccessible to Customers.
9. WHILE a Restaurant is inactive, THE System SHALL return HTTP 404 on `GET /api/v1/public/ar/table/{tableId}` for that Restaurant's tables.

---

### Requirement 7: Plan Management

**User Story:** As a Super Admin, I want to define subscription plans with feature limits, so that Tenants can choose a tier that suits their needs.

#### Acceptance Criteria

1. THE System SHALL maintain four plan tiers: TRIAL, STARTER, GROWTH, ENTERPRISE with the following limits:
   - TRIAL: 1 restaurant, 1 table, 10 menu items, no AR models, 14-day validity
   - STARTER: 1 restaurant, 5 tables, 50 menu items, AR models enabled, monthly billing
   - GROWTH: 3 restaurants, 20 tables per restaurant, 200 menu items, AR models enabled, monthly billing
   - ENTERPRISE: unlimited restaurants, unlimited tables, unlimited menu items, AR models enabled, monthly billing
2. WHEN `GET /api/v1/subscriptions/plans` is called, THE System SHALL return all plans with their limits and Razorpay plan IDs.
3. THE System SHALL enforce plan feature limits at the service layer before any create operation for restaurants, tables, and menu items.
4. WHEN a plan limit is exceeded, THE System SHALL return HTTP 403 with a message specifying the limit and suggesting an upgrade.

---

### Requirement 8: Subscription Management with Razorpay

**User Story:** As a Tenant, I want to subscribe to a paid plan using Razorpay, so that I can unlock higher feature limits.

#### Acceptance Criteria

1. WHEN `POST /api/v1/subscriptions/create-session` is called with a target plan, THE System SHALL create a Razorpay order and return `{orderId, amount, currency, keyId}` for use in the frontend Razorpay checkout modal.
2. WHEN a `payment.captured` webhook is received at `POST /api/v1/webhooks/razorpay`, THE System SHALL verify the HMAC-SHA256 signature using the webhook secret; IF invalid, THE System SHALL return HTTP 400.
3. WHEN a verified `payment.captured` event is processed, THE System SHALL activate the corresponding Subscription, set `current_period_start` and `current_period_end`, and update the Tenant's active plan.
4. WHEN a `subscription.cancelled` webhook event is verified and processed, THE System SHALL set the Subscription status to CANCELLED.
5. WHEN a `subscription.expired` webhook event is verified and processed, THE System SHALL set the Subscription status to EXPIRED and downgrade the Tenant to TRIAL.
6. WHEN `GET /api/v1/subscriptions/current` is called, THE System SHALL return the authenticated Tenant's current plan, status, billing dates, and Razorpay subscription ID.
7. WHEN `GET /api/v1/subscriptions/payments/history` is called, THE System SHALL return a chronological list of past payments with amount, date, plan, and Razorpay payment ID.
8. THE System SHALL store Razorpay IDs (customerId, subscriptionId, orderId) in the Subscription entity without exposing internal column aliases in API responses.

---

### Requirement 9: Table Management

**User Story:** As a Tenant, I want to create and manage tables in my restaurant, so that each table has its own QR code for customers.

#### Acceptance Criteria

1. WHEN `POST /api/v1/restaurants/{restaurantId}/tables` is called, THE System SHALL create a Table with a label (e.g., "Table-1"), linked to the specified Restaurant.
2. THE System SHALL enforce the maximum table count per Restaurant based on the active Plan before creating a new Table.
3. WHEN a table creation request exceeds the plan limit, THE System SHALL return HTTP 403 with a plan upgrade message.
4. WHEN `GET /api/v1/restaurants/{restaurantId}/tables` is called, THE System SHALL return all non-deleted Tables for that Restaurant.
5. WHEN `PUT /api/v1/restaurants/{restaurantId}/tables/{tableId}` is called, THE System SHALL update the Table's label or active status.
6. WHEN `DELETE /api/v1/restaurants/{restaurantId}/tables/{tableId}` is called, THE System SHALL soft-delete the Table by setting `is_deleted = true`.
7. IF a soft-deleted Table's QR code is scanned, THE System SHALL return HTTP 404 on the public AR endpoint.
8. THE System SHALL ensure all Table operations are scoped to the requesting Tenant's `tenant_id`.

---

### Requirement 10: QR Code Generation and Management

**User Story:** As a Tenant, I want to generate and download QR codes for each table, so that customers can scan them to access the AR menu.

#### Acceptance Criteria

1. WHEN `POST /api/v1/restaurants/{restaurantId}/tables/{tableId}/qr` is called, THE System SHALL generate a QR code image encoding the URL `{AR_FRONTEND_URL}/menu/{tableId}` using ZXing.
2. THE System SHALL upload the generated QR code PNG image to Cloudinary and store the public URL in the `qr_codes` table.
3. WHEN a QR code already exists for a Table, THE System SHALL regenerate it and replace the previous Cloudinary image.
4. WHEN `GET /api/v1/restaurants/{restaurantId}/tables/{tableId}/qr` is called, THE System SHALL return the QR code's image URL, the encoded AR URL, and the total scan count.
5. WHEN `GET /api/v1/restaurants/{restaurantId}/tables/{tableId}/qr/download` is called, THE System SHALL return the QR image as a downloadable PNG file with `Content-Disposition: attachment`.
6. THE System SHALL ensure each Table has at most one QR code record (1:1 relationship enforced by unique constraint on `table_id`).
7. THE System SHALL scope all QR management endpoints to the owning Tenant's `tenant_id`.

---

### Requirement 11: Category Management

**User Story:** As a Tenant, I want to organize menu items into categories, so that customers can browse the menu by food type.

#### Acceptance Criteria

1. WHEN `POST /api/v1/restaurants/{restaurantId}/categories` is called, THE System SHALL create a Category (name, description, display order) linked to the Restaurant.
2. WHEN `GET /api/v1/restaurants/{restaurantId}/categories` is called, THE System SHALL return all non-deleted Categories for that Restaurant ordered by `displayOrder`.
3. WHEN `PUT /api/v1/restaurants/{restaurantId}/categories/{categoryId}` is called, THE System SHALL update the Category's name, description, or displayOrder.
4. WHEN `DELETE /api/v1/restaurants/{restaurantId}/categories/{categoryId}` is called, THE System SHALL soft-delete the Category; IF the Category has active Menu_Items, THE System SHALL return HTTP 409 Conflict.
5. THE System SHALL scope all Category operations to the requesting Tenant's `tenant_id`.
6. WHEN `PUT /api/v1/restaurants/{restaurantId}/categories/reorder` is called with an ordered list of category IDs, THE System SHALL update the `displayOrder` of all provided Categories in a single transaction.

---

### Requirement 12: Menu Item Management

**User Story:** As a Tenant, I want full CRUD control over menu items including price updates and availability toggling, so that my menu stays current.

#### Acceptance Criteria

1. WHEN `POST /api/v1/restaurants/{restaurantId}/menu-items` is called, THE System SHALL create a Menu_Item with name, description, price, ingredients, categoryId, and initial availability set to true.
2. THE System SHALL enforce the maximum Menu_Item count per Restaurant based on the active Plan.
3. WHEN a menu item creation exceeds the plan limit, THE System SHALL return HTTP 403 with a plan upgrade message.
4. WHEN `PUT /api/v1/restaurants/{restaurantId}/menu-items/{itemId}` is called, THE System SHALL update the provided fields without changing unspecified fields.
5. WHEN `PATCH /api/v1/restaurants/{restaurantId}/menu-items/{itemId}/price` is called with a new price, THE System SHALL update only the price field and invalidate any Redis cache for this item.
6. WHEN `PATCH /api/v1/restaurants/{restaurantId}/menu-items/{itemId}/availability` is called, THE System SHALL toggle the `is_available` flag and invalidate the Restaurant's menu cache in Redis.
7. WHEN `DELETE /api/v1/restaurants/{restaurantId}/menu-items/{itemId}` is called, THE System SHALL soft-delete the Menu_Item and invalidate the menu cache.
8. WHEN `GET /api/v1/restaurants/{restaurantId}/menu-items` is called, THE System SHALL return all non-deleted items for the Restaurant, optionally filtered by `categoryId` or `isAvailable`.
9. THE System SHALL scope all Menu_Item operations to the requesting Tenant's `tenant_id`.

---

### Requirement 13: Media Upload — Cloudinary Integration

**User Story:** As a Tenant, I want to upload food images and 3D AR model files for menu items, so that customers can see visual content and AR previews.

#### Acceptance Criteria

1. WHEN `POST /api/v1/media/upload/image` is called with a multipart image file, THE System SHALL upload it to Cloudinary under the `ar-menu/{tenantId}/images/` folder and return the public URL.
2. WHEN `POST /api/v1/media/upload/model` is called with a GLTF or GLB file, THE System SHALL upload it to Cloudinary under the `ar-menu/{tenantId}/models/` folder and return the public URL.
3. THE System SHALL enforce a maximum file size of 25 MB per upload, as configured in `spring.servlet.multipart`.
4. WHEN an uploaded file exceeds the 25 MB limit, THE System SHALL return HTTP 413 with a descriptive error.
5. THE System SHALL restrict model upload to users on plans that have AR models enabled (STARTER, GROWTH, ENTERPRISE); IF the Tenant is on TRIAL, THE System SHALL return HTTP 403.
6. WHEN `DELETE /api/v1/media/{publicId}` is called, THE System SHALL delete the resource from Cloudinary and remove the corresponding `media_files` record.
7. THE System SHALL link uploaded media to a Menu_Item by storing the Cloudinary public URL in the `image_url` or `model_url` field of the `menu_items` table.
8. WHEN a model is linked to a Menu_Item, THE System SHALL set `has_ar_model = true` on that Menu_Item.

---

### Requirement 14: Public AR Menu — Customer-Facing Read API

**User Story:** As a Customer, I want to scan a QR code and instantly see the full restaurant menu with AR previews, so that I can make an informed food choice.

#### Acceptance Criteria

1. WHEN `GET /api/v1/public/ar/table/{tableId}` is called, THE System SHALL return the full `ArMenuResponse` including restaurant details, all available Categories, and their Menu_Items with image and model URLs — without requiring authentication.
2. THE System SHALL cache the `ArMenuResponse` in Redis with a 5-minute TTL keyed by `tableId`; WHEN a cache hit occurs, THE System SHALL return the cached response without querying the database.
3. WHEN the Menu_Item list is updated (availability change, price update, new item, delete), THE System SHALL invalidate the Redis cache for the affected Restaurant's tables.
4. WHEN `GET /api/v1/public/ar/item/{itemId}` is called, THE System SHALL return a single `ArItemResponse` with full AR data (model URL, ingredients, price).
5. WHEN a non-existent or soft-deleted tableId is requested, THE System SHALL return HTTP 404.
6. WHEN a Restaurant is inactive, THE System SHALL return HTTP 404 for all public AR requests for that Restaurant's tables.
7. THE System SHALL record a `Scan_Event` asynchronously (non-blocking) when `POST /api/v1/public/analytics/scan` is called, without delaying the menu response.
8. WHEN a scan event is logged, THE System SHALL hash the client IP address before storing it in `scan_events.ip_hash` to protect customer privacy.

---

### Requirement 15: Customer Authentication — OTP Login

**User Story:** As a Customer, I want to log in using OTP sent to my phone or email, so that I can place orders without creating a password-based account.

#### Acceptance Criteria

1. WHEN `POST /api/v1/customer/auth/request-otp` is called with a phone number or email, THE System SHALL generate a 6-digit OTP, store it in Redis with a 5-minute TTL, and send it to the Customer.
2. THE System SHALL send OTP via email using the configured SMTP (Gmail); WHERE phone OTP is configured, THE System SHALL send via SMS provider.
3. WHEN `POST /api/v1/customer/auth/verify-otp` is called with a matching OTP within the 5-minute window, THE System SHALL create or retrieve the Customer record and return a short-lived JWT (30 minutes) for the Customer.
4. WHEN `POST /api/v1/customer/auth/verify-otp` is called with an incorrect OTP, THE System SHALL return HTTP 401.
5. WHEN `POST /api/v1/customer/auth/verify-otp` is called after the 5-minute OTP TTL has expired, THE System SHALL return HTTP 410 Gone with a message to request a new OTP.
6. THE System SHALL limit OTP generation to 3 requests per phone/email per 15-minute window to prevent abuse.
7. WHEN the OTP rate limit is exceeded, THE System SHALL return HTTP 429.
8. THE System SHALL invalidate the OTP from Redis immediately after successful verification so it cannot be reused.

---

### Requirement 16: Cart Management

**User Story:** As a Customer, I want to add and manage items in a cart during my session, so that I can review my order before placing it.

#### Acceptance Criteria

1. WHEN `POST /api/v1/customer/cart/add` is called with a Menu_Item ID and quantity, THE System SHALL add the item to the Customer's Redis-backed Cart session keyed by `cart:{customerId}:{restaurantId}`.
2. THE System SHALL store the Cart in Redis with a 30-minute TTL; WHEN any cart modification is made, THE System SHALL reset the TTL.
3. WHEN `GET /api/v1/customer/cart` is called, THE System SHALL return all current Cart items with name, price, quantity, subtotal, and Cart total.
4. WHEN `PUT /api/v1/customer/cart/item/{itemId}` is called with a new quantity, THE System SHALL update the quantity; IF quantity is 0, THE System SHALL remove that item from the Cart.
5. WHEN `DELETE /api/v1/customer/cart` is called, THE System SHALL clear all items from the Customer's Cart.
6. WHEN a Menu_Item with `is_available = false` is requested to be added to the Cart, THE System SHALL return HTTP 409 with an item unavailability message.
7. THE System SHALL validate that all Cart items belong to the same Restaurant before order placement.

---

### Requirement 17: Order Placement and Lifecycle

**User Story:** As a Customer, I want to place an order from my cart and track its status in real time, so that I know when my food is being prepared and served.

#### Acceptance Criteria

1. WHEN `POST /api/v1/customer/orders` is called with a valid Customer JWT and non-empty Cart, THE System SHALL create an Order with status PENDING, snapshot item prices at the time of order, link to the Customer and Table, and clear the Cart from Redis.
2. THE System SHALL create Order_Items for each Cart entry, storing `menu_item_id`, `quantity`, `unit_price` (price at order time), and `subtotal`.
3. WHEN `POST /api/v1/customer/orders` is called with an empty Cart, THE System SHALL return HTTP 400.
4. WHEN `GET /api/v1/customer/orders/{orderId}` is called, THE System SHALL return the full Order with all Order_Items, statuses, and timestamps.
5. WHEN `PATCH /api/v1/orders/{orderId}/status` is called by STAFF or MANAGER with a valid next status, THE System SHALL transition the Order status according to the allowed state machine: PENDING → ACCEPTED → PREPARING → READY → SERVED → COMPLETED.
6. WHEN an invalid status transition is attempted (e.g., PENDING → COMPLETED), THE System SHALL return HTTP 422 Unprocessable Entity.
7. WHEN `POST /api/v1/orders/{orderId}/cancel` is called by a Customer and the Order is in PENDING or ACCEPTED status, THE System SHALL transition the Order to CANCELLED.
8. IF an order cancellation is attempted on an Order in PREPARING, READY, or SERVED status, THE System SHALL return HTTP 409 Conflict with a message that the order is already being processed.
9. WHEN `GET /api/v1/restaurants/{restaurantId}/orders` is called by STAFF or MANAGER, THE System SHALL return all active orders for that Restaurant ordered by `created_at` descending, optionally filtered by status.
10. THE System SHALL ensure all Order operations are scoped to the requesting Tenant's `tenant_id`.

---

### Requirement 18: Analytics — QR Scans, Menu Views, Orders, Revenue

**User Story:** As a Tenant, I want analytics dashboards showing scan activity, menu engagement, and revenue, so that I can make data-driven decisions.

#### Acceptance Criteria

1. WHEN `GET /api/v1/analytics/summary` is called, THE System SHALL return total QR scans, unique table scans, total orders, and total revenue for the requesting Tenant's Restaurant, optionally filtered by `startDate` and `endDate`.
2. WHEN `GET /api/v1/analytics/scans/daily` is called, THE System SHALL return a time-series list of `{date, scanCount}` for each day within the requested date range.
3. WHEN `GET /api/v1/analytics/menu/top-items` is called, THE System SHALL return the top 10 Menu_Items by order frequency within the requested date range for the Restaurant.
4. WHEN `GET /api/v1/analytics/revenue/monthly` is called, THE System SHALL return a month-by-month revenue breakdown for the current calendar year.
5. THE System SHALL record scan events asynchronously via `@Async` so that scan logging does not block the menu response.
6. THE System SHALL index `scan_events` on `tenant_id`, `restaurant_id`, and `scanned_at` to ensure analytics queries complete within acceptable time for data sets up to 1 million records.
7. WHEN an analytics endpoint is called, THE System SHALL restrict access to the Tenant's own data based on `tenant_id`.

---

### Requirement 19: Audit Logging

**User Story:** As a Super Admin or Tenant, I want every write action tracked in an audit log, so that I have a complete trail of who changed what and when.

#### Acceptance Criteria

1. THE System SHALL create an `audit_logs` table with fields: `id`, `tenant_id`, `user_id`, `action` (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, STATUS_CHANGE), `entity_type` (e.g., "Restaurant", "MenuItem"), `entity_id`, `old_value` (JSON), `new_value` (JSON), `ip_address`, `created_at`.
2. WHEN any CREATE, UPDATE, DELETE, or status-change operation is executed on a core entity (Restaurant, Table, QR_Code, Category, Menu_Item, Order, Subscription), THE System SHALL record an Audit_Log entry.
3. WHEN a user logs in or logs out, THE System SHALL record an Audit_Log entry with action LOGIN or LOGOUT.
4. THE System SHALL write Audit_Logs asynchronously via `@Async` to avoid adding latency to the primary operation.
5. WHEN `GET /api/v1/admin/audit-logs` is called by a SUPER_ADMIN, THE System SHALL return a paginated, filterable list of audit log entries across all tenants.
6. WHEN `GET /api/v1/audit-logs` is called by a RESTAURANT_OWNER, THE System SHALL return audit log entries scoped to that Tenant's `tenant_id` only.
7. THE System SHALL never allow UPDATE or DELETE operations on audit log records — logs are append-only.

---

### Requirement 20: Dashboard — Tenant Summary View

**User Story:** As a Tenant, I want a single dashboard API endpoint that gives me a snapshot of today's key metrics, so that I can quickly understand my restaurant's performance.

#### Acceptance Criteria

1. WHEN `GET /api/v1/dashboard` is called, THE System SHALL return a summary containing: today's total orders, today's revenue, total active menu items, active tables, total QR scans today, and current subscription plan with expiry date.
2. THE System SHALL serve the dashboard response from Redis cache with a 1-minute TTL to reduce database load.
3. WHEN `GET /api/v1/admin/dashboard` is called by a SUPER_ADMIN, THE System SHALL return platform-wide metrics: total tenants, total active subscriptions by plan tier, total orders across all restaurants today, and total platform revenue this month.
4. THE System SHALL scope Tenant dashboard queries strictly to the Tenant's own `tenant_id`.

---

### Requirement 21: Email Notifications

**User Story:** As a Tenant or Customer, I want to receive email notifications for key events, so that I stay informed without polling the system.

#### Acceptance Criteria

1. WHEN a new Tenant registers, THE System SHALL send a welcome email to the Tenant's registered email address.
2. WHEN a Customer requests an OTP, THE System SHALL send the 6-digit OTP via email within 60 seconds.
3. WHEN a Subscription is activated, THE System SHALL send a billing confirmation email to the Tenant with plan name, amount, and next billing date.
4. WHEN a Subscription expires or is cancelled, THE System SHALL send a notification email to the Tenant with instructions to renew.
5. THE System SHALL send all emails asynchronously via `@Async` to avoid blocking the request thread.
6. IF an email delivery fails, THE System SHALL log the failure with ERROR level and NOT throw an exception to the caller.

---

### Requirement 22: Health Check and Monitoring

**User Story:** As a DevOps engineer, I want a health check endpoint, so that load balancers and monitoring systems can verify the application is running.

#### Acceptance Criteria

1. WHEN `GET /api/v1/health` is called, THE System SHALL return HTTP 200 with `{"status": "UP"}` without requiring authentication.
2. THE System SHALL include database connectivity and Redis connectivity indicators in the health response.
3. IF the database connection is unavailable, THE System SHALL return HTTP 503 with `{"status": "DOWN", "component": "database"}`.
4. IF the Redis connection is unavailable, THE System SHALL return HTTP 503 with `{"status": "DOWN", "component": "redis"}`.

---

### Requirement 23: Production Deployment — Docker, Nginx, SSL, CI/CD

**User Story:** As a DevOps engineer, I want the application containerized and deployable with Nginx and SSL, so that it is production-ready and can be deployed via CI/CD.

#### Acceptance Criteria

1. THE System SHALL include a `Dockerfile` that builds the Spring Boot fat JAR using a multi-stage Maven build on Java 17 and runs it on a slim JRE image.
2. THE System SHALL include a `docker-compose.yml` that orchestrates the Spring Boot app, MySQL, and Redis services with environment variable injection via `.env`.
3. THE System SHALL include an Nginx configuration that terminates SSL at port 443, proxies requests to the Spring Boot container on port 8080, and redirects HTTP (port 80) to HTTPS.
4. THE System SHALL include a CI/CD pipeline configuration (GitHub Actions or equivalent) that runs Maven build and tests on every push, and deploys to the production server on merge to the main branch.
5. THE System SHALL externalize all secrets (DB credentials, JWT secret, Razorpay keys, Cloudinary keys) via environment variables and MUST NOT hardcode any secrets in source code or configuration files.
6. WHERE a `Procfile` is present, THE System SHALL define the web dyno command as `java -jar target/ar-smart-menu-*.jar` for Heroku-compatible platforms.

---

### Requirement 24: Data Integrity and Multi-Tenancy Isolation

**User Story:** As a platform operator, I want strict multi-tenant data isolation, so that one Tenant can never access another Tenant's data.

#### Acceptance Criteria

1. THE System SHALL include `tenant_id` as a mandatory, non-nullable column on all BaseEntity-derived tables.
2. WHEN any Service method performs a repository query, THE System SHALL pass the authenticated user's `tenant_id` as a query filter parameter.
3. THE System SHALL validate ownership at the service layer before any update or delete operation: IF the retrieved entity's `tenant_id` does not match the authenticated user's `tenant_id`, THE System SHALL throw an AccessDeniedException resulting in HTTP 403.
4. THE System SHALL use soft deletes (is_deleted flag) for all core entities rather than hard DELETE SQL operations.
5. WHEN a paginated list endpoint is called, THE System SHALL apply `tenant_id` filtering before applying pagination to ensure no cross-tenant data leaks through page offsets.

---

### Requirement 25: API Consistency and Pagination

**User Story:** As a frontend developer consuming the API, I want consistent pagination and filtering on all list endpoints, so that I can build reliable UI components.

#### Acceptance Criteria

1. THE System SHALL support `page` (0-indexed) and `size` (default 20, max 100) query parameters on all list endpoints that return collections.
2. WHEN a paginated response is returned, THE System SHALL include in the response: `content` (the data array), `totalElements`, `totalPages`, `currentPage`, and `pageSize`.
3. THE System SHALL support sorting via `sortBy` and `sortDirection` (ASC/DESC) query parameters on all list endpoints.
4. WHEN an invalid `sortBy` field is provided, THE System SHALL return HTTP 400 with a list of valid sort fields.
5. THE System SHALL support date-range filtering via `startDate` and `endDate` query parameters (ISO-8601 format) on analytics and order list endpoints.
