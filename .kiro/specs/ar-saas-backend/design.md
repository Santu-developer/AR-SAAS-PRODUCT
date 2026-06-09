# Design Document — AR Smart Menu SaaS Backend

## Overview

The AR Smart Menu SaaS Backend is a production-grade, multi-tenant Spring Boot 3.2 monolith that powers three distinct portals: a **Super Admin Portal** for platform management, a **Restaurant Portal** for tenant operations, and a **Customer QR Portal** for diner-facing AR menu experiences.

The platform lets restaurant owners (tenants) onboard, configure AR-enhanced menus, generate per-table QR codes, and receive orders placed by customers who scan those QR codes. Customers authenticate via OTP (email/phone), browse a cached AR menu, and place orders — all without a password-based account. A tiered subscription model (TRIAL → STARTER → GROWTH → ENTERPRISE) gated by Razorpay billing controls feature access (number of restaurants, tables, menu items, AR model uploads).

**Stack:** Java 17 · Spring Boot 3.2.5 · Maven · MySQL · Redis · Cloudinary · Razorpay · ZXing · Bucket4j · JJWT 0.12.5 · MapStruct · Lombok · springdoc-openapi 2.5.0

---

## Architecture

### High-Level System Diagram

```mermaid
graph TB
    subgraph Clients
        SA[Super Admin Browser]
        RO[Restaurant Portal Browser]
        CQ[Customer Mobile / QR Scan]
    end

    subgraph AR Backend - Spring Boot Monolith
        direction TB
        RL[RateLimitFilter\nBucket4j per-IP]
        JF[JwtAuthFilter\nJWKS Bearer validation]
        SC[SecurityConfig\nStateless · @PreAuthorize]

        subgraph Core Modules
            AUTH[auth\nJWT · Refresh · Register]
            RESTAURANT[restaurant\nCRUD · Plan Limit Guard]
            PLAN[plan\nTier Definitions]
            SUB[subscription\nRazorpay Checkout · Webhook]
            TABLE[table/qr\nZXing Generation]
            CAT[category\nOrdered List]
            MENU[menu\nCRUD · Price · Availability]
            MEDIA[media\nCloudinary Upload]
            CUSTOMER[customer\nOTP Auth]
            CART[cart\nRedis Session]
            ORDER[order\nState Machine]
            AR[ar\nPublic Read API]
            ANALYTICS[analytics\nScan Events · Reports]
            DASHBOARD[dashboard\nSummary Metrics]
            AUDIT[audit\nAppend-only Log]
            EMAIL[email\nAsync SMTP]
            COMMON[common\nBaseEntity · ApiResponse\nTenantContext · Exceptions]
        end

        RL --> JF --> SC
        SC --> AUTH
        SC --> RESTAURANT
        SC --> PLAN
        SC --> SUB
        SC --> TABLE
        SC --> CAT
        SC --> MENU
        SC --> MEDIA
        SC --> CUSTOMER
        SC --> CART
        SC --> ORDER
        SC --> AR
        SC --> ANALYTICS
        SC --> DASHBOARD
        SC --> AUDIT
    end

    subgraph Infrastructure
        MYSQL[(MySQL\nPrimary Store)]
        REDIS[(Redis\nCache · OTP · Cart · Sessions)]
        CDN[Cloudinary CDN\nImages · GLTF/GLB Models]
        RAZORPAY[Razorpay\nPayment Gateway]
        SMTP[Gmail SMTP\nEmail Delivery]
    end

    SA --> AR Backend - Spring Boot Monolith
    RO --> AR Backend - Spring Boot Monolith
    CQ --> AR Backend - Spring Boot Monolith

    AUTH --> MYSQL
    RESTAURANT --> MYSQL
    MENU --> MYSQL
    ORDER --> MYSQL
    ANALYTICS --> MYSQL

    AUTH -.->|refresh tokens| REDIS
    AR -.->|arMenu cache 5min| REDIS
    CART -.->|cart sessions 30min| REDIS
    CUSTOMER -.->|OTP 5min TTL| REDIS
    DASHBOARD -.->|summary cache 1min| REDIS

    MEDIA --> CDN
    SUB --> RAZORPAY
    EMAIL --> SMTP
```

### Request Flow

```
HTTP Request
  └─ RateLimitFilter          (Bucket4j token bucket, per-IP, applied before auth)
      └─ JwtAuthFilter         (extract Bearer token → populate SecurityContext + TenantContext)
          └─ SecurityConfig     (permitAll or authenticated guard)
              └─ Controller     (@RestController, @PreAuthorize role checks)
                  └─ Service    (business logic, plan limit guards, tenant isolation)
                      └─ Repository (JPA query, always includes tenantId filter)
                          └─ MySQL / Redis / Cloudinary / Razorpay
                              └─ ApiResponse<T> envelope (all responses)
```

### Filter Chain Order

1. `RateLimitFilter` — Bucket4j token bucket (currently: 5 login requests/min per IP on `/api/v1/auth/login`; extendable to all endpoints)
2. `JwtAuthFilter` — validates Bearer JWT, populates `SecurityContextHolder` and `TenantContext`
3. Spring Security's `UsernamePasswordAuthenticationFilter` — (not used for login flow; present for completeness)

Public paths bypassing `JwtAuthFilter`: `/api/v1/auth/**`, `/api/v1/public/**`, `/api/v1/webhooks/razorpay`, `/api/v1/health`, Swagger UI paths.

---

## Components and Interfaces

### Module Breakdown

| Package | Responsibility | Key Classes |
|---------|---------------|-------------|
| `common` | BaseEntity, ApiResponse, TenantContext, GlobalExceptionHandler, RateLimitFilter | `BaseEntity`, `ApiResponse<T>`, `TenantContext`, `GlobalExceptionHandler` |
| `config` | Spring Security, Redis cache manager, Cloudinary, CORS, Swagger | `SecurityConfig`, `RedisConfig`, `CloudinaryConfig`, `SwaggerConfig`, `CorsConfig` |
| `auth` | JWT login/register/refresh/logout for Super Admin + Tenant users | `AuthController`, `AuthServiceImpl`, `JwtServiceImpl`, `JwtAuthFilter`, `UserDetailsServiceImpl` |
| `restaurant` | Restaurant CRUD, plan limit enforcement, activate/deactivate | `RestaurantController`, `RestaurantServiceImpl`, `Restaurant`, `RestaurantTable` |
| `plan` | Plan tier definitions, limits lookup | `PlanController`, `PlanServiceImpl`, `Plan` |
| `subscription` | Razorpay checkout, webhook handling, payment history | `SubscriptionController`, `SubscriptionServiceImpl`, `WebhookController`, `Subscription`, `PaymentHistory` |
| `category` | Category CRUD + reorder for a restaurant | `CategoryController`, `CategoryServiceImpl`, `Category` |
| `menu` | MenuItem CRUD, price/availability patches, plan limit guard | `MenuItemController`, `MenuItemServiceImpl`, `MenuItem`, `MenuMapper` |
| `media` | Cloudinary upload/delete for images + GLTF/GLB models | `MediaController`, `MediaServiceImpl`, `MediaFile` |
| `qr` | ZXing QR generation, Cloudinary storage, download | `QrController`, `QrServiceImpl`, `QrCode` |
| `customer` | OTP request/verify, Customer entity, Customer JWT | `CustomerAuthController`, `CustomerAuthServiceImpl`, `Customer` |
| `cart` | Redis-backed cart session per customer+restaurant | `CartController`, `CartServiceImpl` |
| `order` | Order placement from cart, status state machine, restaurant order view | `OrderController`, `CustomerOrderController`, `OrderServiceImpl`, `Order`, `OrderItem` |
| `ar` | Public unauthenticated AR menu read, scan event logging | `ArController`, `ArServiceImpl` |
| `analytics` | Scan events (async write), daily scans, top items, monthly revenue | `AnalyticsController`, `AnalyticsServiceImpl`, `ScanEvent` |
| `dashboard` | Tenant + Super Admin summary endpoint (Redis cached 1 min) | `DashboardController`, `DashboardServiceImpl` |
| `audit` | Async append-only audit log for all write operations | `AuditLogServiceImpl`, `AuditLog` |
| `email` | Async SMTP email for welcome, OTP, subscription events | `EmailServiceImpl` |

### Service Interface Contracts

Every module follows the pattern:

```
XyzController
  → @PreAuthorize checked
  → XyzService (interface)
      → XyzServiceImpl (business logic, tenant scoping, plan checks)
          → XyzRepository (JpaRepository<Entity, UUID>)
```

Shared utilities injected across services:
- `SecurityUtils.getCurrentUser()` — retrieves `User` from `SecurityContextHolder`
- `SecurityUtils.getCurrentTenantId()` — retrieves `tenantId` from `TenantContext`
- `AuditLogService.logAsync(...)` — fire-and-forget audit write via `@Async`
- `EmailService.send*(...)` — fire-and-forget email via `@Async`

---

## Data Models

### Entity Relationship Diagram

```mermaid
erDiagram
    users {
        UUID id PK
        UUID tenant_id
        VARCHAR name
        VARCHAR email UK
        VARCHAR phone
        VARCHAR password
        ENUM role
        BOOLEAN is_active
        BOOLEAN is_deleted
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    refresh_tokens {
        UUID id PK
        VARCHAR token UK
        UUID user_id FK
        TIMESTAMP expiry_date
        BOOLEAN is_revoked
    }

    restaurants {
        UUID id PK
        UUID tenant_id
        VARCHAR name
        TEXT description
        TEXT address
        VARCHAR phone
        VARCHAR cuisine_type
        VARCHAR logo_url
        UUID owner_id FK
        BOOLEAN is_active
        BOOLEAN is_deleted
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    restaurant_tables {
        UUID id PK
        UUID tenant_id
        UUID restaurant_id FK
        VARCHAR table_number
        VARCHAR label
        BOOLEAN is_active
        BOOLEAN is_deleted
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    qr_codes {
        UUID id PK
        UUID tenant_id
        UUID table_id FK UK
        UUID restaurant_id
        VARCHAR qr_image_url
        TEXT qr_url
        BIGINT scan_count
        BOOLEAN is_deleted
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    plans {
        UUID id PK
        VARCHAR name UK
        VARCHAR display_name
        DECIMAL price
        INT duration_days
        INT max_restaurants
        INT max_tables_per_restaurant
        INT max_menu_items
        BOOLEAN ar_models_enabled
        BOOLEAN analytics_enabled
        VARCHAR razorpay_plan_id
        TEXT description
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    subscriptions {
        UUID id PK
        UUID tenant_id
        UUID user_id FK
        ENUM plan
        ENUM status
        VARCHAR razorpay_customer_id
        VARCHAR razorpay_subscription_id
        VARCHAR razorpay_order_id
        TIMESTAMP current_period_start
        TIMESTAMP current_period_end
        BOOLEAN is_deleted
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    payment_history {
        UUID id PK
        UUID tenant_id
        UUID user_id FK
        ENUM plan
        DECIMAL amount
        VARCHAR currency
        VARCHAR status
        VARCHAR razorpay_payment_id
        VARCHAR razorpay_order_id
        TIMESTAMP paid_at
        BOOLEAN is_deleted
        TIMESTAMP created_at
    }

    categories {
        UUID id PK
        UUID tenant_id
        UUID restaurant_id FK
        VARCHAR name
        TEXT description
        INT display_order
        BOOLEAN is_deleted
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    menu_items {
        UUID id PK
        UUID tenant_id
        UUID restaurant_id FK
        UUID category_id FK
        VARCHAR name
        TEXT description
        DECIMAL price
        TEXT ingredients
        VARCHAR image_url
        VARCHAR model_url
        BOOLEAN has_ar_model
        BOOLEAN is_available
        ENUM status
        BOOLEAN is_deleted
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    media_files {
        UUID id PK
        UUID tenant_id
        VARCHAR public_id UK
        VARCHAR url
        ENUM resource_type
        BIGINT file_size
        UUID linked_item_id
        BOOLEAN is_deleted
        TIMESTAMP created_at
    }

    customers {
        UUID id PK
        VARCHAR name
        VARCHAR phone UK
        VARCHAR email
        BOOLEAN is_verified
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    orders {
        UUID id PK
        UUID tenant_id
        UUID customer_id FK
        UUID restaurant_id FK
        UUID table_id FK
        ENUM status
        DECIMAL total_amount
        TEXT notes
        BOOLEAN is_deleted
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    order_items {
        UUID id PK
        UUID order_id FK
        UUID menu_item_id
        VARCHAR item_name
        DECIMAL unit_price
        INT quantity
        DECIMAL subtotal
        VARCHAR notes
    }

    scan_events {
        UUID id PK
        UUID tenant_id
        UUID restaurant_id
        UUID table_id
        UUID item_id
        VARCHAR user_agent
        VARCHAR ip_hash
        TIMESTAMP scanned_at
    }

    audit_logs {
        UUID id PK
        UUID tenant_id
        UUID user_id
        ENUM action
        VARCHAR entity_type
        UUID entity_id
        JSON old_value
        JSON new_value
        VARCHAR ip_address
        TIMESTAMP created_at
    }

    users ||--o{ restaurants : "owns"
    users ||--o{ subscriptions : "has"
    users ||--o{ refresh_tokens : "has"
    restaurants ||--o{ restaurant_tables : "contains"
    restaurant_tables ||--|| qr_codes : "has"
    restaurants ||--o{ categories : "has"
    categories ||--o{ menu_items : "contains"
    restaurants ||--o{ menu_items : "has"
    customers ||--o{ orders : "places"
    restaurants ||--o{ orders : "receives"
    restaurant_tables ||--o{ orders : "at"
    orders ||--o{ order_items : "contains"
```

### Key Design Decisions on Entities

**BaseEntity** — All tenant-scoped entities extend `BaseEntity` which provides `UUID id` (auto via `@UuidGenerator`), `UUID tenantId`, `LocalDateTime createdAt/updatedAt`, and `Boolean isDeleted = false`. This enforces the soft-delete and tenant-isolation patterns universally.

**Exceptions to BaseEntity** — `Customer`, `Plan`, `ScanEvent`, `AuditLog`, `OrderItem`, and `RefreshToken` do NOT extend `BaseEntity` for specific reasons:
- `Customer`: global entity (not tenant-specific — a customer can visit any restaurant)
- `Plan`: platform-level configuration, not tenant-owned
- `AuditLog`: append-only, immutable — no soft-delete semantics needed
- `ScanEvent`: high-volume write, custom index-optimized
- `OrderItem`: child of `Order` (inherits tenant context from parent)
- `RefreshToken`: user session artifact, not a business entity

**Soft Delete** — `is_deleted = true` is the deletion mechanism for all `BaseEntity` subclasses. Repositories use `findByXxxAndIsDeletedFalse(...)` conventions. Hard DELETEs are never used for core entities.

**Tenant Isolation** — `TenantContext` (ThreadLocal) is populated by `JwtAuthFilter` from the authenticated user's `tenantId`. All service methods call `SecurityUtils.getCurrentTenantId()` and pass it to every repository query. This prevents cross-tenant data leakage at the service layer.

**Price Snapshot in Orders** — `OrderItem.unitPrice` stores the menu item price *at the time of order placement*, not a foreign key reference. This prevents retroactive price changes from affecting historical order totals.

**Plan Entity vs Enum** — A `Plan` JPA entity exists alongside a `SubscriptionPlan` enum. The entity stores Razorpay plan IDs and limits that can be updated by Super Admin without a redeploy. The enum (`TRIAL`, `STARTER`, `GROWTH`, `ENTERPRISE`) is used in code logic. The `plans` table records serve as the authoritative source for limits.

**QR Code 1:1 with Table** — Enforced by `UNIQUE` constraint on `qr_codes.table_id`. Regeneration replaces the Cloudinary image and updates the URL in-place.

**Redis Key Namespaces** — Documented in the Redis section below.

---

## API Design

All endpoints are prefixed with `/api/v1/`. All responses use the `ApiResponse<T>` envelope: `{success, message, data, timestamp}`.

### Auth Module — `/api/v1/auth/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Register RESTAURANT_OWNER, auto-create restaurant, assign TRIAL |
| POST | `/auth/login` | Public | Email+password login → access + refresh tokens |
| POST | `/auth/refresh-token` | Public | Rotate refresh token → new access token |
| POST | `/auth/logout` | Bearer | Revoke refresh token in Redis/DB |
| GET | `/auth/me` | Bearer | Return current authenticated user profile |

### Super Admin Module — `/api/v1/admin/**` (SUPER_ADMIN only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/tenants` | SUPER_ADMIN | Paginated list of all tenants with subscription status |
| GET | `/admin/tenants/{tenantId}` | SUPER_ADMIN | Tenant detail with plan, restaurant count |
| POST | `/admin/tenants/{tenantId}/activate` | SUPER_ADMIN | Set tenant is_active = true |
| POST | `/admin/tenants/{tenantId}/deactivate` | SUPER_ADMIN | Set tenant is_active = false |
| POST | `/admin/tenants/{tenantId}/assign-plan` | SUPER_ADMIN | Override tenant subscription plan |
| GET | `/admin/stats` | SUPER_ADMIN | Platform-level stats |
| GET | `/admin/audit-logs` | SUPER_ADMIN | Paginated audit log (all tenants) |
| GET | `/admin/dashboard` | SUPER_ADMIN | Platform-wide dashboard summary |

### Restaurant Module — `/api/v1/restaurants/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/restaurants` | RESTAURANT_OWNER | Create restaurant (plan limit enforced) |
| GET | `/restaurants` | RESTAURANT_OWNER | List own restaurants |
| GET | `/restaurants/{id}` | RESTAURANT_OWNER | Get single restaurant (tenant scope verified) |
| PUT | `/restaurants/{id}` | RESTAURANT_OWNER | Update restaurant fields |
| POST | `/restaurants/{id}/activate` | OWNER or SUPER_ADMIN | Activate restaurant |
| POST | `/restaurants/{id}/deactivate` | OWNER or SUPER_ADMIN | Deactivate restaurant |

### Plan Module — `/api/v1/subscriptions/plans`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/subscriptions/plans` | Public | Return all plan tiers with limits and Razorpay plan IDs |

### Subscription Module — `/api/v1/subscriptions/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/subscriptions/current` | RESTAURANT_OWNER | Current subscription details |
| POST | `/subscriptions/create-session` | RESTAURANT_OWNER | Create Razorpay order → return {orderId, keyId, amount} |
| POST | `/subscriptions/verify-payment` | RESTAURANT_OWNER | Server-side payment signature verification |
| GET | `/subscriptions/payments/history` | RESTAURANT_OWNER | Payment history |
| POST | `/webhooks/razorpay` | Public (HMAC-verified) | Razorpay webhook handler |

### Table Module — `/api/v1/restaurants/{restaurantId}/tables/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/restaurants/{rId}/tables` | OWNER/MANAGER | Create table (plan limit enforced) |
| GET | `/restaurants/{rId}/tables` | OWNER/MANAGER/STAFF | List non-deleted tables |
| PUT | `/restaurants/{rId}/tables/{tId}` | OWNER/MANAGER | Update label or active status |
| DELETE | `/restaurants/{rId}/tables/{tId}` | OWNER/MANAGER | Soft-delete table |

### QR Code Module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/restaurants/{rId}/tables/{tId}/qr` | OWNER/MANAGER | Generate/regenerate QR, upload to Cloudinary |
| GET | `/restaurants/{rId}/tables/{tId}/qr` | OWNER/MANAGER/STAFF | Get QR URL + scan count |
| GET | `/restaurants/{rId}/tables/{tId}/qr/download` | OWNER/MANAGER | Download QR PNG (Content-Disposition: attachment) |

### Category Module — `/api/v1/restaurants/{restaurantId}/categories/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/categories` | OWNER/MANAGER | Create category |
| GET | `/categories` | OWNER/MANAGER/STAFF | List categories ordered by displayOrder |
| PUT | `/categories/{cId}` | OWNER/MANAGER | Update name, description, displayOrder |
| DELETE | `/categories/{cId}` | OWNER/MANAGER | Soft-delete (409 if has active items) |
| PUT | `/categories/reorder` | OWNER/MANAGER | Bulk update displayOrder in a single transaction |

### Menu Item Module — `/api/v1/restaurants/{restaurantId}/menu-items/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/menu-items` | OWNER/MANAGER | Create menu item (plan limit enforced) |
| GET | `/menu-items` | OWNER/MANAGER/STAFF | List items, filterable by categoryId, isAvailable |
| GET | `/menu-items/{itemId}` | OWNER/MANAGER/STAFF | Get single item |
| PUT | `/menu-items/{itemId}` | OWNER/MANAGER | Full update |
| PATCH | `/menu-items/{itemId}/price` | OWNER/MANAGER | Price-only update + cache invalidation |
| PATCH | `/menu-items/{itemId}/availability` | OWNER/MANAGER/STAFF | Toggle is_available + cache invalidation |
| DELETE | `/menu-items/{itemId}` | OWNER/MANAGER | Soft-delete + cache invalidation |

### Media Module — `/api/v1/media/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/media/upload/image` | OWNER/MANAGER | Upload image → Cloudinary, return URL |
| POST | `/media/upload/model` | OWNER/MANAGER (non-TRIAL) | Upload GLTF/GLB → Cloudinary, return URL |
| DELETE | `/media/{publicId}` | OWNER/MANAGER | Delete from Cloudinary + remove media_files record |

### Customer Auth Module — `/api/v1/customer/auth/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/customer/auth/request-otp` | Public | Generate OTP, store in Redis 5min TTL, send via email/SMS |
| POST | `/customer/auth/verify-otp` | Public | Verify OTP → create/get Customer → return Customer JWT (30 min) |

### Cart Module — `/api/v1/customer/cart/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/customer/cart/add` | CUSTOMER JWT | Add item + quantity to cart |
| GET | `/customer/cart` | CUSTOMER JWT | Get cart contents with subtotals and total |
| PUT | `/customer/cart/item/{itemId}` | CUSTOMER JWT | Update quantity (0 = remove) |
| DELETE | `/customer/cart` | CUSTOMER JWT | Clear entire cart |

### Order Module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/customer/orders` | CUSTOMER JWT | Place order from cart (clears cart) |
| GET | `/customer/orders/{orderId}` | CUSTOMER JWT | Get order detail |
| GET | `/restaurants/{rId}/orders` | STAFF/MANAGER | List restaurant orders, filterable by status |
| PATCH | `/orders/{orderId}/status` | STAFF/MANAGER | Advance order through state machine |
| POST | `/orders/{orderId}/cancel` | CUSTOMER or OWNER/MANAGER | Cancel PENDING/ACCEPTED order |

### Public AR Module — `/api/v1/public/**` (no auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/public/ar/table/{tableId}` | Public | Full ArMenuResponse (Redis cached 5 min) |
| GET | `/public/ar/item/{itemId}` | Public | Single item AR data |
| POST | `/public/analytics/scan` | Public | Log scan event (async, non-blocking) |

### Analytics Module — `/api/v1/analytics/**`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analytics/summary` | OWNER/MANAGER | Total scans, orders, revenue with optional date range |
| GET | `/analytics/scans/daily` | OWNER/MANAGER | Daily scan time-series |
| GET | `/analytics/menu/top-items` | OWNER/MANAGER | Top 10 items by order frequency |
| GET | `/analytics/revenue/monthly` | OWNER/MANAGER | Monthly revenue for current year |

### Dashboard Module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard` | OWNER/MANAGER | Tenant dashboard (Redis cached 1 min) |
| GET | `/admin/dashboard` | SUPER_ADMIN | Platform-wide dashboard |

### Audit Log Module

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/audit-logs` | SUPER_ADMIN | All tenant audit logs, paginated |
| GET | `/audit-logs` | RESTAURANT_OWNER | Own tenant's audit logs |

### Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | Database + Redis connectivity check |

### Pagination Convention

All list endpoints accept:
- `page` (0-indexed, default 0)
- `size` (default 20, max 100)
- `sortBy` (field name, default `createdAt`)
- `sortDirection` (ASC/DESC, default DESC)
- `startDate` / `endDate` (ISO-8601, for analytics and order list endpoints)

Paginated responses use the structure:
```json
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 123,
    "totalPages": 7,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

---

## Security Architecture

### JWT Token Strategy

| Token Type | Expiry | Storage | Purpose |
|-----------|--------|---------|---------|
| Access Token | 15 minutes | Client (memory/localStorage) | Authenticate API requests |
| Refresh Token | 7 days | Redis + DB (`refresh_tokens` table) | Issue new access tokens |
| Customer JWT | 30 minutes | Client | Customer-specific, role=CUSTOMER |

**Access Token Claims:**
```json
{
  "sub": "user-email@example.com",
  "role": "RESTAURANT_OWNER",
  "tenantId": "uuid",
  "iat": 1700000000,
  "exp": 1700000900
}
```

**Signing:** HMAC-SHA256 (`HS256`) with a strong secret loaded from environment variable `JWT_SECRET`. Key length must be ≥ 256 bits.

### Role-Based Access Control

```
SUPER_ADMIN
  └── Full access to /admin/**, plus all other endpoints

RESTAURANT_OWNER (= RESTAURANT_ADMIN)
  └── Full access to own tenant's: restaurants, tables, categories,
      menu-items, media, subscriptions, analytics, dashboard, orders (view)

MANAGER
  └── Same as RESTAURANT_OWNER minus: subscription management, plan changes

STAFF
  └── Read: menu, tables, orders
      Write: order status transitions, item availability toggle

CUSTOMER
  └── Public AR endpoints (no auth), customer/auth, cart, customer/orders
```

**Implementation:** `@PreAuthorize("hasRole('SUPER_ADMIN')")` and `hasAnyRole(...)` on controller methods. Spring Security `@EnableMethodSecurity` is active. Role authority format: `ROLE_` prefix (e.g., `ROLE_RESTAURANT_OWNER`).

**Tenant Isolation at Service Layer:**
```java
// Pattern used in every service that touches tenant-scoped data
UUID tenantId = SecurityUtils.getCurrentTenantId();
Restaurant restaurant = restaurantRepository
    .findByIdAndTenantIdAndIsDeletedFalse(id, tenantId)
    .orElseThrow(() -> new AccessDeniedException("Resource not found or access denied"));
```

### Deactivated Tenant Guard

`JwtAuthFilter` (or a dedicated `TenantStatusFilter`) checks `user.getIsActive()` after token validation. If `isActive = false`, it returns HTTP 403 immediately without populating `SecurityContextHolder`.

### Razorpay Webhook Security

```java
// HMAC-SHA256 verification
String payload = requestBody;
String receivedSignature = request.getHeader("X-Razorpay-Signature");
Mac mac = Mac.getInstance("HmacSHA256");
mac.init(new SecretKeySpec(webhookSecret.getBytes(UTF_8), "HmacSHA256"));
String computedSignature = HexFormat.of().formatHex(mac.doFinal(payload.getBytes(UTF_8)));
if (!MessageDigest.isEqual(computedSignature.getBytes(), receivedSignature.getBytes())) {
    return ResponseEntity.badRequest().body(ApiResponse.error("Invalid signature", "WEBHOOK_INVALID"));
}
```

---

## Redis Usage Patterns

### Key Namespace Design

| Key Pattern | TTL | Content | Managed By |
|-------------|-----|---------|------------|
| `arMenu::table:{tableId}` | 5 min | `ArMenuResponse` JSON | `@Cacheable(value="arMenu")` in `ArServiceImpl` |
| `menuItems::restaurant:{restaurantId}` | 2 min | `List<MenuItemDto>` | `@Cacheable(value="menuItems")` in `MenuItemServiceImpl` |
| `analyticsSummary::tenant:{tenantId}` | 1 min | `AnalyticsSummaryDto` | `@Cacheable(value="analyticsSummary")` in `AnalyticsServiceImpl` |
| `dashboard::tenant:{tenantId}` | 1 min | `DashboardDto` | `@Cacheable(value="dashboard")` in `DashboardServiceImpl` |
| `otp:{phone_or_email}` | 5 min | `"123456"` (6-digit string) | `CustomerAuthServiceImpl` via `StringRedisTemplate` |
| `otp:count:{phone_or_email}` | 15 min | Integer count | OTP rate limiting counter |
| `cart:{customerId}:{restaurantId}` | 30 min | `Map<itemId, CartItem>` JSON | `CartServiceImpl` via `RedisTemplate` |

### Cache Invalidation Strategy

`@CacheEvict` is used on mutation operations to maintain cache coherence:

```java
// Price update → evict arMenu and menuItems caches for that restaurant
@CacheEvict(value = {"arMenu", "menuItems"}, key = "'restaurant:' + #restaurantId")
public void updatePrice(UUID restaurantId, UUID itemId, BigDecimal newPrice) { ... }

// Availability toggle → same eviction
@CacheEvict(value = {"arMenu", "menuItems"}, allEntries = false, key = "...")
public void toggleAvailability(...) { ... }

// New item / delete item → evict all entries in arMenu and menuItems
@CacheEvict(value = {"arMenu", "menuItems"}, allEntries = true)
public void createMenuItem(...) { ... }
```

**Dashboard cache** is evicted when new orders are placed or subscription plans change.

### OTP Flow (Redis)

```
POST /customer/auth/request-otp
  1. Check otp:count:{identifier} in Redis
     → if count >= 3: return 429
  2. Generate 6-digit OTP
  3. SET otp:{identifier} = "654321" EX 300          (5-min TTL)
  4. INCR otp:count:{identifier}; EXPIRE ... 900     (15-min rate limit window)
  5. Send OTP via email/SMS async

POST /customer/auth/verify-otp
  1. GET otp:{identifier}
     → if null: return 410 (expired)
     → if mismatch: return 401
  2. DEL otp:{identifier}          (invalidate immediately — one-time use)
  3. Find or create Customer record
  4. Return Customer JWT (30 min)
```

### Cart Storage (Redis)

Cart is stored as a Redis Hash:

```
HSET cart:{customerId}:{restaurantId} {menuItemId} {CartItemJson}
EXPIRE cart:{customerId}:{restaurantId} 1800    (30 min, reset on every modification)
```

`CartItem` JSON: `{itemId, name, price, quantity, subtotal}`.

---

## Cloudinary Integration Approach

### Configuration

```java
// CloudinaryConfig.java
@Bean
public Cloudinary cloudinary() {
    return new Cloudinary(ObjectUtils.asMap(
        "cloud_name", env.getProperty("CLOUDINARY_CLOUD_NAME"),
        "api_key",    env.getProperty("CLOUDINARY_API_KEY"),
        "api_secret", env.getProperty("CLOUDINARY_API_SECRET"),
        "secure",     true
    ));
}
```

### Folder Structure

```
ar-menu/
  {tenantId}/
    images/       ← food images (JPEG/PNG/WEBP)
    models/       ← 3D AR models (GLTF/GLB)
    qr/           ← generated QR code PNGs
```

### Upload Service Pattern

```java
// MediaServiceImpl — image upload
public MediaUploadResponse uploadImage(MultipartFile file, UUID tenantId) {
    validateFileSize(file, 25 * 1024 * 1024);   // 25 MB max
    validateImageType(file);                       // image/* MIME

    Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
        ObjectUtils.asMap(
            "folder",          "ar-menu/" + tenantId + "/images",
            "resource_type",   "image",
            "use_filename",    true,
            "unique_filename", true
        ));

    String publicId = (String) uploadResult.get("public_id");
    String url      = (String) uploadResult.get("secure_url");

    // Persist to media_files for tracking + deletion
    mediaFileRepository.save(MediaFile.builder()
        .publicId(publicId).url(url)
        .resourceType(ResourceType.IMAGE)
        .tenantId(tenantId).build());

    return MediaUploadResponse.builder().url(url).publicId(publicId).build();
}

// 3D Model upload — plan guard enforced
public MediaUploadResponse uploadModel(MultipartFile file, UUID tenantId) {
    SubscriptionPlan plan = subscriptionService.getCurrentPlan(tenantId);
    if (plan == SubscriptionPlan.TRIAL) {
        throw new PlanLimitException("AR model uploads require STARTER plan or above");
    }

    validateFileSize(file, 25 * 1024 * 1024);
    validateModelType(file);    // .gltf or .glb only

    Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
        ObjectUtils.asMap(
            "folder",        "ar-menu/" + tenantId + "/models",
            "resource_type", "raw",    // GLTF/GLB are binary raw files
            "use_filename",  true
        ));
    // ... persist and return
}

// QR Code upload (from ZXing PNG bytes)
public String uploadQrCode(byte[] pngBytes, UUID tenantId, UUID tableId) {
    Map uploadResult = cloudinary.uploader().upload(pngBytes,
        ObjectUtils.asMap(
            "folder",        "ar-menu/" + tenantId + "/qr",
            "public_id",     "table-" + tableId,  // deterministic — overwrites on regeneration
            "resource_type", "image",
            "overwrite",     true
        ));
    return (String) uploadResult.get("secure_url");
}
```

### Deletion

```java
public void deleteMedia(String publicId, UUID tenantId) {
    // Verify ownership
    MediaFile file = mediaFileRepository.findByPublicIdAndTenantId(publicId, tenantId)
        .orElseThrow(() -> new ResourceNotFoundException("Media not found"));

    // Delete from Cloudinary
    cloudinary.uploader().destroy(publicId,
        ObjectUtils.asMap("resource_type",
            file.getResourceType() == ResourceType.MODEL ? "raw" : "image"));

    // Soft-delete from DB
    file.setIsDeleted(true);
    mediaFileRepository.save(file);
}
```

---

## Async Patterns

The platform uses Spring's `@Async` with a dedicated thread pool for non-blocking operations that must not add latency to the primary request.

### AsyncConfig

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name = "asyncExecutor")
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

### Operations Using @Async

| Operation | Called From | Async Method |
|-----------|-------------|--------------|
| Scan event recording | `ArServiceImpl.logScan()` | `ScanEventRepository.save()` |
| Audit log write | All service write operations | `AuditLogService.logAsync()` |
| Welcome email on registration | `AuthServiceImpl.register()` | `EmailService.sendWelcomeEmail()` |
| OTP email delivery | `CustomerAuthServiceImpl.requestOtp()` | `EmailService.sendOtpEmail()` |
| Subscription confirmation email | `SubscriptionServiceImpl.handlePaymentCaptured()` | `EmailService.sendSubscriptionConfirmationEmail()` |
| Subscription expiry/cancellation email | Webhook handlers | `EmailService.sendSubscriptionExpiredEmail()` |

### Async Failure Handling

All `@Async` methods catch exceptions internally and log at `ERROR` level without rethrowing. This ensures async failures never surface as exceptions to the calling request thread.

```java
@Async("asyncExecutor")
public void sendWelcomeEmail(String toEmail, String name, String restaurantName) {
    try {
        // ... build and send email
    } catch (MailException ex) {
        log.error("Failed to send welcome email to {}: {}", toEmail, ex.getMessage());
        // No rethrow — caller is not affected
    }
}
```

---

## Error Handling

### GlobalExceptionHandler

`@RestControllerAdvice` handles all exceptions globally:

| Exception | HTTP Status | Error Code |
|-----------|-------------|------------|
| `ResourceNotFoundException` | 404 | `RESOURCE_NOT_FOUND` |
| `DuplicateResourceException` | 409 | `DUPLICATE_RESOURCE` |
| `UnauthorizedException` | 401 | `UNAUTHORIZED` |
| `AccessDeniedException` | 403 | `ACCESS_DENIED` |
| `PlanLimitException` | 403 | `PLAN_LIMIT_EXCEEDED` |
| `InvalidStateTransitionException` | 422 | `INVALID_STATE_TRANSITION` |
| `FileUploadException` | 400 | `FILE_UPLOAD_ERROR` |
| `MaxUploadSizeExceededException` | 413 | `FILE_TOO_LARGE` |
| `MethodArgumentNotValidException` | 400 | `VALIDATION_ERROR` (with field map) |
| `Exception` (fallback) | 500 | `INTERNAL_ERROR` |

### Order Status State Machine

Valid transitions are enforced in `OrderServiceImpl`:

```
PLACED → ACCEPTED → PREPARING → READY → SERVED → COMPLETED
PLACED → CANCELLED
ACCEPTED → CANCELLED
```

Any other transition throws `InvalidStateTransitionException` → HTTP 422.

```java
private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
    PLACED,     Set.of(ACCEPTED, CANCELLED),
    ACCEPTED,   Set.of(PREPARING, CANCELLED),
    PREPARING,  Set.of(READY),
    READY,      Set.of(SERVED),
    SERVED,     Set.of(COMPLETED),
    COMPLETED,  Set.of(),
    CANCELLED,  Set.of()
);
```

### Plan Limit Guards

Enforced in service layer before any create operation:

```java
// In RestaurantServiceImpl.createRestaurant()
int currentCount = restaurantRepository.countByTenantIdAndIsDeletedFalse(tenantId);
int planLimit = subscriptionService.getPlanLimits(tenantId).getMaxRestaurants();
if (currentCount >= planLimit) {
    throw new PlanLimitException(
        "Your " + plan.name() + " plan allows " + planLimit + " restaurant(s). " +
        "Upgrade to add more.");
}
```

The same pattern applies for tables (per restaurant) and menu items (per restaurant).

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: ApiResponse Envelope Consistency

*For any* HTTP request to any API endpoint, the response body SHALL always contain the fields `success` (boolean), `message` (string), and `timestamp` (ISO-8601), regardless of whether the request succeeded or failed.

**Validates: Requirements 1.2, 1.3**

---

### Property 2: Validation Rejects Invalid Requests

*For any* request body that contains at least one field violating a validation constraint (e.g., blank required field, invalid email format, password shorter than 8 characters), the system SHALL return HTTP 400 with a non-empty field-level error map in the `data` field.

**Validates: Requirements 1.6, 4.5**

---

### Property 3: Rate Limit Enforcement

*For any* client IP address that has exhausted its request quota within the configured time window, every subsequent request from that IP SHALL receive HTTP 429 with `success: false` until the window resets.

**Validates: Requirements 2.2, 2.4**

---

### Property 4: Refresh Token Rotation (Round-Trip)

*For any* valid, non-expired refresh token, submitting it to `/auth/refresh-token` SHALL return a new access token and a new refresh token, AND the original refresh token SHALL be invalidated so that resubmitting it returns HTTP 401.

**Validates: Requirements 3.3, 3.4**

---

### Property 5: New Tenant Always Gets TRIAL Plan

*For any* successful registration via `POST /auth/register`, the newly created tenant's subscription plan SHALL be TRIAL with a 14-day validity period, regardless of any other request parameters.

**Validates: Requirements 4.4**

---

### Property 6: SUPER_ADMIN Exclusivity on Admin Endpoints

*For any* HTTP request to any path matching `/api/v1/admin/**` made by a user whose role is NOT SUPER_ADMIN, the system SHALL return HTTP 403 with `success: false`, regardless of any other valid authentication.

**Validates: Requirements 5.1**

---

### Property 7: Deactivated Tenant Blocked on All Requests

*For any* API request (except public endpoints) made by a user whose account has `is_active = false`, the system SHALL return HTTP 403, regardless of token validity or role.

**Validates: Requirements 5.5, 5.6**

---

### Property 8: Plan Limits Enforced on Create Operations

*For any* tenant whose current count of a resource (restaurants, tables per restaurant, menu items per restaurant) has reached their plan limit, attempting to create one more of that resource SHALL return HTTP 403 with a message referencing the plan limit and suggesting an upgrade.

**Validates: Requirements 6.2, 6.3, 7.3, 7.4, 9.2, 9.3, 12.2, 12.3**

---

### Property 9: Razorpay Webhook Signature Validation

*For any* incoming request to `/api/v1/webhooks/razorpay`, if the HMAC-SHA256 signature computed from the request body using the webhook secret does NOT match the `X-Razorpay-Signature` header, the system SHALL return HTTP 400 and SHALL NOT process the webhook event.

**Validates: Requirements 8.2**

---

### Property 10: Menu Cache Invalidation on Mutation

*For any* mutation operation on a menu item (price update, availability toggle, create, soft-delete), any subsequent public AR menu read for the affected restaurant's tables SHALL reflect the updated state — meaning stale cached values from before the mutation SHALL NOT be returned.

**Validates: Requirements 12.5, 12.6, 12.7, 14.3**

---

### Property 11: AR Menu Public Access and Cache Hit

*For any* valid, active table ID, the response from `GET /api/v1/public/ar/table/{tableId}` SHALL include the restaurant name, at least one category, and item details including price and availability status — without requiring any authentication header.

**Validates: Requirements 14.1, 14.2**

---

### Property 12: Scan IP Privacy (Hash, Not Raw)

*For any* scan event recorded via `POST /api/v1/public/analytics/scan`, the `ip_hash` field stored in `scan_events` SHALL NOT equal the raw client IP address string — it SHALL be a fixed-length hex-encoded hash of the IP.

**Validates: Requirements 14.8**

---

### Property 13: OTP Rate Limiting

*For any* phone number or email address that has already received 3 OTP requests within a 15-minute window, any additional OTP request within the same window SHALL return HTTP 429 and SHALL NOT generate or send a new OTP.

**Validates: Requirements 15.6, 15.7**

---

### Property 14: OTP One-Time Use

*For any* successfully verified OTP, attempting to use the same OTP code again (even within the 5-minute window) SHALL return HTTP 401 — the OTP SHALL be invalidated in Redis immediately upon successful verification.

**Validates: Requirements 15.3, 15.8**

---

### Property 15: Cart Tenant Isolation

*For any* customer cart, all items stored in that cart SHALL belong to the same restaurant (identical `restaurant_id`). Attempting to add an item from a different restaurant than the existing cart items SHALL be rejected with HTTP 409.

**Validates: Requirements 16.7**

---

### Property 16: Order Price Snapshot Immutability

*For any* placed order, the `unit_price` in each `order_item` SHALL equal the menu item's price at the moment the order was placed, and SHALL remain unchanged even if the menu item price is subsequently updated.

**Validates: Requirements 17.1, 17.2**

---

### Property 17: Order Status State Machine Correctness

*For any* order in status S, only transitions in `ALLOWED_TRANSITIONS[S]` SHALL succeed. Any attempt to transition to a state not in `ALLOWED_TRANSITIONS[S]` SHALL return HTTP 422. The combined set of properties (P16 and P17) implies that for any sequence of valid state transitions applied to any order, the final state is always a reachable state in the defined state machine.

**Validates: Requirements 17.5, 17.6, 17.7, 17.8**

---

### Property 18: Analytics Data Tenant Scoping

*For any* analytics endpoint call, the returned data (scan counts, order totals, revenue) SHALL only include records whose `tenant_id` matches the authenticated user's `tenant_id`. Records belonging to other tenants SHALL never appear in the response.

**Validates: Requirements 18.1, 18.7**

---

### Property 19: Audit Log Append-Only Immutability

*For any* audit log entry that has been created, no UPDATE or DELETE SQL operation SHALL be issued against the `audit_logs` table for that record. Audit log entries, once written, are permanent and immutable.

**Validates: Requirements 19.7**

---

### Property 20: Cross-Tenant Resource Access Denied

*For any* tenant A attempting to access, update, or delete a resource (restaurant, table, category, menu item, order) whose `tenant_id` is B (where A ≠ B), the system SHALL return HTTP 403 and SHALL NOT return or modify that resource.

**Validates: Requirements 24.1, 24.2, 24.3**

---

### Property 21: Soft Delete Excludes from Queries

*For any* entity that has been soft-deleted (is_deleted = true), that entity SHALL NOT appear in any list or single-fetch query result. Any direct lookup by ID for a soft-deleted entity SHALL return HTTP 404.

**Validates: Requirements 24.4**

---

## Testing Strategy

### Dual Testing Approach

The platform uses both unit/integration tests and property-based tests for comprehensive coverage.

**Unit Tests** focus on:
- Specific business logic scenarios (state machine transitions, plan limit boundary values)
- Error condition handling (GlobalExceptionHandler responses for each exception type)
- Mapper correctness (MapStruct-generated mappers between entities and DTOs)
- Individual service method logic with mocked repositories

**Integration Tests** focus on:
- Repository layer with `@DataJpaTest` (MySQL schema validation, query correctness)
- Redis cache behavior (TTL verification, cache hit/miss, eviction)
- Razorpay webhook signature verification end-to-end
- `@Async` behavior (scan event and audit log recording with `Awaitility`)
- Cloudinary upload (mocked `cloudinary.uploader()`)

**Property-Based Tests** use [jqwik](https://jqwik.net/) (JUnit 5 compatible, available via `net.jqwik:jqwik:1.8.x`) with a minimum of 100 iterations per property. Each property test is tagged with the design property it validates.

### Property-Based Test Configuration

Add to `pom.xml`:
```xml
<dependency>
    <groupId>net.jqwik</groupId>
    <artifactId>jqwik</artifactId>
    <version>1.8.4</version>
    <scope>test</scope>
</dependency>
```

Each property test uses this tag format in comments:
```java
// Feature: ar-saas-backend, Property 4: Refresh token rotation round-trip
@Property(tries = 100)
void refreshTokenRotation(@ForAll("validRefreshTokens") String token) { ... }
```

### Test Coverage Targets

| Module | Unit Tests | Integration Tests | Property Tests |
|--------|-----------|-------------------|----------------|
| auth | Login/register scenarios, JWT validation | Refresh token Redis TTL | P4, P5, P6 |
| restaurant | Plan limit boundaries | Multi-tenant isolation | P8, P20, P21 |
| order | State machine transitions | Order placement from cart | P16, P17 |
| ar | Cache hit/miss, inactive restaurant 404 | Redis cache TTL | P10, P11 |
| customer | OTP flow, expired OTP | Redis OTP TTL | P13, P14 |
| analytics | Revenue calculation, date range filtering | Async scan event | P18 |
| common | ApiResponse shape, validation errors | Rate limit filter | P1, P2, P3 |
| audit | Log creation on write ops | Async write, append-only | P19 |
| subscription | Webhook handler logic, plan mapping | HMAC signature | P9 |

### Key Unit Test Scenarios (non-property)

- `AuthServiceImpl`: login with inactive user → 401, duplicate email → 409
- `CategoryServiceImpl`: delete category with active items → 409
- `OrderServiceImpl`: cancel PREPARING order → 409
- `QrServiceImpl`: regenerate QR overwrites existing Cloudinary image
- `MediaServiceImpl`: TRIAL tenant uploads model → 403
- `GlobalExceptionHandler`: each exception type maps to correct HTTP status
- `TenantContext`: ThreadLocal cleared after request completes

### Integration Test Setup

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
// Uses H2 in-memory DB for DataJpaTest, Testcontainers MySQL for full integration
// Uses @MockBean for Cloudinary and Razorpay clients
// Uses EmbeddedRedis for Redis (via it.ozimov:embedded-redis or Testcontainers)
```

### Verification Notes

- The order status state machine (Property 17) should also be verified using a model-based test that generates random sequences of status transitions and verifies only legal paths succeed.
- Cross-tenant access (Property 20) should generate pairs of (tenantA, tenantB, resourceOwned by A) and verify B always gets 403.
- Soft delete (Property 21) can be tested by generating arbitrary entity state, soft-deleting, and asserting list queries never return deleted entries.
