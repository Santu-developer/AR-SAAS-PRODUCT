<p align="center">
  <img src="https://img.shields.io/badge/AR--Smart--Menu-v1.0.0-8B5CF6?style=for-the-badge&logo=android&logoColor=white" alt="AR Smart Menu" />
</p>

<h1 align="center">🪄 AR Smart Menu — Restaurant SaaS Platform</h1>

<p align="center">
  <strong>Production-Grade Modular Monolith Multi-Tenant Restaurant SaaS</strong><br />
  Super Admin Portal • Restaurant Dashboard • Staff Panel • Customer QR Ordering • WebAR
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=flat-square&logo=spring-boot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [Database Design](#-database-design)
- [API Endpoints](#-api-endpoints)
- [User Roles](#-user-roles)
- [Getting Started](#-getting-started)
- [Development Phases](#-development-phases)
- [Quality Standards](#-quality-standards)

---

## 🚀 Overview

AR Smart Menu is a **modular monolithic multi-tenant SaaS platform** for restaurants that combines:

- **Super Admin Portal** — Platform-wide management, subscriptions, analytics
- **Restaurant Owner Dashboard** — Menu management, tables, QR codes, orders, staff
- **Staff Panel** — Kitchen board, order management, status updates
- **Customer QR Ordering** — Scan QR → Browse menu → Place order → Track status
- **WebAR Support** — 3D dish previews in browser (no app install)

### Core Flow

```
Customer scans QR → Opens browser menu → Browses dishes → Adds to cart
→ Places order → Restaurant receives order → Staff updates status
→ Customer sees live status → Optional feedback
```

### Tech Stack Overview

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, TypeScript, Tailwind CSS 3.4, Zustand, TanStack Query 5, Framer Motion, Three.js |
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Security, JWT, Spring Data JPA, MySQL, Redis |
| **Payments** | Razorpay (UPI, Cards, Netbanking, Subscriptions) |
| **Media** | Cloudinary (Images, 3D GLTF/GLB models) |
| **QR** | ZXing (QR Code generation) |

---

## 🏗 Architecture

### Modular Monolith

This project follows the **Modular Monolith** architecture — one deployable Spring Boot application with clear internal module boundaries. This avoids microservices complexity while keeping the codebase scalable.

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐  │
│  │   Auth  │ │SuperAdmin│ │  Owner │ │ Customer │  │
│  └─────────┘ └──────────┘ └────────┘ └──────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST (JWT Auth)
┌──────────────────────▼──────────────────────────────┐
│               Backend (Spring Boot)                  │
│  ┌────┐ ┌────────┐ ┌──────┐ ┌─────┐ ┌──────────┐  │
│  │Auth│ │Tenant  │ │Menu  │ │Order│ │Subscription│  │
│  └────┘ └────────┘ └──────┘ └─────┘ └──────────┘  │
│  ┌──────┐ ┌────────┐ ┌──────┐ ┌───────┐ ┌──────┐  │
│  │Staff │ │Payment │ │Feedback│ │Support│ │Analytics│ │
│  └──────┘ └────────┘ └──────┘ └───────┘ └──────┘  │
└──────┬──────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────┐
│                   Data Layer                        │
│  ┌─────────┐  ┌─────────┐  ┌──────────────┐       │
│  │  MySQL  │  │  Redis  │  │  Cloudinary  │       │
│  └─────────┘  └─────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────┘
```

### Request Flow

```
HTTP Request
  └─ RateLimitFilter (Bucket4j token bucket, per-IP)
      └─ JwtAuthFilter (extract Bearer → SecurityContext + TenantContext)
          └─ SecurityConfig (permitAll or authenticated guard)
              └─ Controller (@RestController, @PreAuthorize)
                  └─ Service (business logic, plan limits, tenant isolation)
                      └─ Repository (JPA, always tenantId filter)
                          └─ MySQL / Redis / Cloudinary / Razorpay
```

---

## 🎨 Frontend

### Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 8.x | Build Tool |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 3.4 | Utility CSS |
| Zustand | 5.x | State Management |
| TanStack Query | 5.x | Server State |
| React Router DOM | 7.x | Routing |
| React Hook Form | 7.x | Forms |
| Zod | 4.x | Validation |
| Framer Motion | 12.x | Animations |
| Three.js | 0.162 | 3D Rendering |
| @react-three/fiber | 9.x | React Three.js |
| @react-three/drei | 10.x | Three.js Helpers |
| Axios | 1.x | HTTP Client |
| React Hot Toast | 2.x | Notifications |
| Lucide React | 1.x | Icons |
| Chart.js | 4.x | Charts |
| React QR Code | 2.x | QR Display |

### Folder Structure

```
ar-frontend/src/
├── app/
│   ├── router.jsx          # Route configuration (createBrowserRouter)
│   └── providers.jsx       # QueryClient, Toaster providers
├── features/
│   ├── auth/               # Authentication (Login, Register, store)
│   ├── dashboard/          # Restaurant Owner Dashboard
│   │   ├── pages/          # Dashboard pages (Analytics, Menus, Orders, etc.)
│   │   ├── super-admin/    # Super Admin pages
│   │   └── components/     # Shared dashboard components
│   ├── ar/                 # AR Menu (Customer QR experience)
│   └── ...                 # More feature modules
├── shared/
│   ├── components/
│   │   ├── ui/             # Reusable UI components (Button, Card, Input, etc.)
│   │   ├── layout/         # Layout components (Sidebar, PrivateRoute)
│   │   └── common/         # Common components (PageLoader, ErrorBoundary, Auth3DScene)
│   ├── lib/
│   │   ├── axios.js        # Axios client with JWT interceptor
│   │   ├── queryClient.js  # TanStack Query configuration
│   │   └── utils.js        # Utility functions (cn, formatCurrency, formatDate)
│   ├── hooks/              # Shared React hooks
│   └── constants/          # Constants (roles, API paths)
├── store/                  # Zustand stores
├── assets/                 # Static assets
└── styles/                 # Global styles
```

### Key Features

- **Lazy Loading** — All page components lazy-loaded with Suspense
- **Responsive Design** — Mobile-first, adapts across 320px to 1536px+
- **Dark Theme** — Premium dark SaaS theme with glassmorphism
- **Animations** — Framer Motion spring animations, staggered entries
- **3D Backgrounds** — CSS-only animated backgrounds (no WebGL context loss)
- **Form Validation** — Zod schemas with React Hook Form
- **Error Handling** — Error boundaries, loading skeletons, empty states

---

## ⚙️ Backend

### Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 17 | Language |
| Spring Boot | 3.2.5 | Framework |
| Spring Security | 6.x | Auth & Authorization |
| Spring Data JPA | 3.x | ORM |
| MySQL | 8.0 | Database |
| Redis | 7.0 | Caching, OTP, Sessions |
| JWT (JJWT) | 0.12.5 | Token Auth |
| MapStruct | 1.5.5 | Object Mapping |
| Lombok | 1.18.32 | Boilerplate Reduction |
| Cloudinary | 1.36 | Media Storage |
| Razorpay | 1.4.5 | Payments |
| ZXing | 3.5.3 | QR Generation |
| Bucket4j | 8.10.1 | Rate Limiting |
| Springdoc OpenAPI | 2.5.0 | API Documentation |

### Project Structure

```
AR-Backend/src/main/java/com/armenu/
├── ArSmartMenuApplication.java      # Application entry point
├── config/
│   ├── SecurityConfig.java          # Spring Security configuration
│   ├── RedisConfig.java             # Redis cache manager
│   ├── CloudinaryConfig.java        # Cloudinary configuration
│   ├── CorsConfig.java              # CORS configuration
│   └── SwaggerConfig.java           # OpenAPI/Swagger configuration
├── common/
│   ├── BaseEntity.java              # Base JPA entity (id, timestamps, soft-delete)
│   ├── ApiResponse.java             # Standard API response wrapper
│   ├── TenantContext.java           # ThreadLocal tenant context
│   └── GlobalExceptionHandler.java  # Global exception handler
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java / AuthServiceImpl.java
│   ├── JwtService.java / JwtServiceImpl.java
│   └── JwtAuthFilter.java
├── restaurant/
│   ├── RestaurantController.java
│   ├── RestaurantService.java / RestaurantServiceImpl.java
│   ├── Restaurant.java (entity)
│   └── RestaurantRepository.java
├── menu/
│   ├── CategoryController.java
│   ├── MenuItemController.java
│   ├── CategoryService.java / MenuItemService.java
│   ├── Category.java / MenuItem.java (entities)
│   └── CategoryRepository.java / MenuItemRepository.java
├── order/
│   ├── OrderController.java
│   ├── OrderService.java / OrderServiceImpl.java
│   ├── Order.java / OrderItem.java (entities)
│   └── OrderRepository.java
├── subscription/
│   ├── SubscriptionController.java
│   ├── PlanService.java / SubscriptionService.java
│   ├── Plan.java / Subscription.java (entities)
│   └── PlanRepository.java / SubscriptionRepository.java
├── staff/
│   └── ... (Staff management)
├── payment/
│   └── ... (Razorpay integration)
├── feedback/
│   └── ... (Customer feedback)
├── support/
│   └── ... (Support tickets)
├── analytics/
│   └── ... (Analytics & reporting)
└── email/
    └── ... (Email notifications)
```

### Authentication Flow

```
1. POST /api/v1/auth/login → { email, password }
   → Returns { accessToken (15min), refreshToken (7d), user }

2. Every request includes: Authorization: Bearer <accessToken>

3. POST /api/v1/auth/refresh → { refreshToken }
   → Returns new accessToken

4. POST /api/v1/auth/logout → Revokes refresh token

5. POST /api/v1/auth/register → Creates owner + restaurant + trial subscription
```

### Security Architecture

- **JWT Authentication** — Short-lived access tokens (15 min) + refresh tokens (7 days)
- **Role-Based Authorization** — SUPER_ADMIN, RESTAURANT_OWNER, STAFF, CUSTOMER
- **Tenant Isolation** — Every query filtered by tenant ID from JWT context
- **Rate Limiting** — Bucket4j per-IP throttling on sensitive endpoints
- **Audit Logging** — All sensitive actions logged for compliance
- **OWASP Protection** — Object-level authorization, property-level protection

---

## 💾 Database Design

### Entity Relationship (Core Tables)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `tenants` | Tenant businesses | id, code, status |
| `users` | Platform users | id, tenant_id, email, password, role |
| `restaurants` | Restaurant profiles | id, tenant_id, name, address, cuisine |
| `restaurant_tables` | Dine-in tables | id, tenant_id, table_number, qr_code_url |
| `categories` | Menu categories | id, tenant_id, name, display_order |
| `menu_items` | Dishes with media | id, tenant_id, category_id, name, price, ar_model_url |
| `customers` | Customer records | id, name, phone, email |
| `orders` | Order headers | id, tenant_id, table_id, customer_id, status, total |
| `order_items` | Order line items | id, order_id, menu_item_id, quantity, unit_price |
| `plans` | SaaS plan definitions | id, name, price, features_json |
| `subscriptions` | Tenant subscriptions | id, tenant_id, plan_id, status, dates |
| `payments` | Payment records | id, tenant_id, order_id, subscription_id, amount |
| `invoices` | Order invoices | id, tenant_id, order_id, invoice_number, total |
| `feedback` | Customer feedback | id, tenant_id, order_id, rating, comment |
| `support_tickets` | Support issues | id, tenant_id, subject, status |
| `audit_logs` | Sensitive action audit | id, tenant_id, user_id, action_type |
| `refresh_tokens` | Refresh token tracking | id, user_id, token_hash, expires_at |

### Tenant Isolation

- Every tenant-owned table includes `tenant_id`
- Repository queries always filter by `tenant_id`
- Unique constraints are tenant-scoped: `(tenant_id, table_number)`, `(tenant_id, category_name)`
- Super Admin queries are explicitly separated

---

## 🔌 API Endpoints

Base URL: `http://localhost:8080/api/v1`

### Authentication (`/auth/*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login → JWT tokens |
| POST | `/auth/register` | Public | Register owner + restaurant |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Bearer | Revoke session |
| GET | `/auth/me` | Bearer | Current user profile |

### Super Admin (`/admin/*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/restaurants` | SUPER_ADMIN | List all restaurants |
| POST | `/admin/restaurants` | SUPER_ADMIN | Create restaurant tenant |
| GET | `/admin/restaurants/{id}` | SUPER_ADMIN | Restaurant details |
| PATCH | `/admin/restaurants/{id}/status` | SUPER_ADMIN | Activate/suspend |
| GET | `/admin/plans` | SUPER_ADMIN | List plans |
| POST | `/admin/plans` | SUPER_ADMIN | Create plan |
| GET | `/admin/analytics/dashboard` | SUPER_ADMIN | Platform dashboard |

### Restaurant Owner (`/owner/*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/owner/restaurant` | Owner | Own restaurant profile |
| PUT | `/owner/restaurant` | Owner | Update profile |
| GET | `/owner/tables` | Owner | List tables |
| POST | `/owner/tables` | Owner | Create table |
| GET | `/owner/tables/{id}/qr` | Owner | Get QR info |
| GET | `/owner/categories` | Owner | List categories |
| POST | `/owner/categories` | Owner | Create category |
| GET | `/owner/menu-items` | Owner | List menu items |
| POST | `/owner/menu-items` | Owner | Create menu item |
| GET | `/owner/orders` | Owner | List orders |
| PATCH | `/owner/orders/{id}/status` | Owner | Update order status |
| GET | `/owner/staff` | Owner | List staff |
| POST | `/owner/staff` | Owner | Create staff |
| GET | `/owner/subscription` | Owner | Current subscription |
| GET | `/owner/analytics/dashboard` | Owner | Dashboard metrics |
| GET | `/owner/invoices` | Owner | List invoices |

### Staff (`/staff/*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/staff/orders` | Staff | Accessible orders |
| GET | `/staff/orders/{id}` | Staff | Order details |
| PATCH | `/staff/orders/{id}/status` | Staff | Update status |
| GET | `/staff/kitchen/board` | Staff | Kitchen board view |

### Customer (`/public/*`, `/customer/*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/public/menu/{slug}/table/{num}` | Public | QR menu bootstrap |
| GET | `/public/orders` | Public | Place order |
| GET | `/public/orders/{id}` | Public | Order status |
| POST | `/public/feedback` | Public | Submit feedback |
| POST | `/customer/auth/send-otp` | Public | OTP login start |
| POST | `/customer/auth/verify-otp` | Public | Verify OTP |

### Payments (`/payments/*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/razorpay/order` | Bearer | Create Razorpay order |
| POST | `/payments/razorpay/verify` | Bearer | Verify payment |
| POST | `/payments/razorpay/webhook` | Public | Webhook receiver |

---

## 👥 User Roles

| Role | Access Level |
|------|-------------|
| **SUPER_ADMIN** | Full platform access — manage restaurants, plans, subscriptions, support, analytics |
| **RESTAURANT_OWNER** | Full tenant access — manage restaurant, tables, menus, orders, staff, billing |
| **STAFF** | Restricted tenant access — orders, kitchen board, status updates |
| **CUSTOMER** | Public — scan QR, browse menu, place order, track status |

---

## 🚦 Development Phases

### Combined Full-Stack Overview

| Phase | Module | Frontend UI | Backend API | Combined |
|-------|--------|:-----------:|:-----------:|:--------:|
| 0 | Foundation & Architecture | ✅ Complete | ✅ Complete | ✅ |
| 1 | Authentication (Login, Register, JWT) | ✅ Complete | ✅ Complete | ✅ |
| 2 | Super Admin Foundation | ✅ Complete | ✅ Complete | ✅ |
| 3 | Restaurant Onboarding | ✅ Complete | ✅ Complete | ✅ |
| 4 | Table & QR Management | ✅ Complete | ✅ Complete | ✅ |
| 5 | Menu Management | ✅ Complete | ✅ Complete | ✅ |
| 6 | Customer QR Experience | ✅ Complete | ✅ Complete | ✅ |
| 7 | Order Management | ✅ Complete | ✅ Complete | ✅ |
| 8 | Staff Management | ✅ Complete | ✅ Complete | ✅ |
| 9 | Billing & Subscriptions | ✅ Complete | ✅ Complete | ✅ |
| 10 | Invoices | ✅ Complete | ✅ Complete | ✅ |
| 11 | Feedback & Support | ✅ Complete | ✅ Complete | ✅ |
| 12 | Analytics | ✅ Complete | ✅ Complete | ✅ |
| 13 | WebAR | ✅ Complete | ✅ Complete | ✅ |

### Phase Details — Frontend UI

| Phase | Module | Pages Built | Key Components |
|-------|--------|-------------|----------------|
| 0 | Foundation | Vite + React + Tailwind, Router, Zustand stores | `router.jsx`, `axios.js`, `queryClient.js`, `utils.js` |
| 1 | Authentication | Login, Register, Forgot/Reset Password, 403 Forbidden | `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `PrivateRoute`, `authStore` |
| 2 | Super Admin | Dashboard, Restaurants, Plans, Subscriptions, Support, Analytics, Audit Logs | `SuperAdminDashboard`, `AdminRestaurantsPage`, `AdminPlansPage`, `AdminSubscriptionsPage`, `AdminAnalyticsPage` |
| 3 | Onboarding | Guided 4-step wizard | `RestaurantOnboardingPage` with Welcome, Details, Cuisine & Contact, Next Steps |
| 4 | Table & QR | Table CRUD with QR generation | `TablesPage`, `TableDialog`, QR download, react-qr-code |
| 5 | Menu Management | Menu items + categories CRUD | `MenusPage`, `CategoryDialog`, `MenuItemDialog`, search/filter, availability toggle |
| 6 | Customer QR | Mobile-first QR menu experience | `ARMenuView`, `CategoryTabs`, `MenuItemCard`, `ItemDetailModal`, search, share |
| 7 | Order Management | Order cards with status workflow | `OrdersPage`, `OrderCard`, status tabs (PENDING→DELIVERED), cancel, stats |
| 8 | Staff Management | Staff CRUD with role badges | `StaffPage`, `StaffDialog`, active/inactive toggle, search |
| 9 | Billing | Plan cards + subscription management | `SubscriptionPage`, `PlanCard`, payment history table, checkout session |
| 10 | Invoices | Invoice list + detail + download | `InvoicesPage`, `InvoiceDetailDialog`, PDF download, generate from order |
| 11 | Support | Owner support ticket management | `SupportPage`, `CreateTicketDialog`, `TicketDetailDialog`, reply thread, filters |
| 12 | Analytics | Charts + stats + insights | `AnalyticsPage`, `BarChart`, `LineChart`, `TopItemsList`, scan table, stat cards |
| 13 | WebAR | 3D model viewer in browser | `ARViewer3D` (Three.js, OrbitControls, auto-rotate, loading/error states), integrated into `ARMenuView` |

### Phase Details — Backend API

| Phase | Module | Controllers | Key Services |
|-------|--------|-------------|--------------|
| 0 | Foundation | — | `SecurityConfig`, `RedisConfig`, `CloudinaryConfig`, `CorsConfig`, `SwaggerConfig`, `BaseEntity`, `TenantContext`, `GlobalExceptionHandler` |
| 1 | Authentication | `AuthController` | `AuthServiceImpl`, `JwtServiceImpl`, `JwtAuthFilter`, `UserDetailsServiceImpl` |
| 2 | Super Admin | `AdminController`, `DashboardController` | Platform-wide tenant management, stats, audit logs |
| 3 | Onboarding | `RestaurantController` | `RestaurantServiceImpl`, plan limit enforcement, auto-create trial |
| 4 | Table & QR | `TableController`, `QrController` | ZXing QR generation, Cloudinary upload, download, scan tracking |
| 5 | Menu Management | `CategoryController`, `MenuItemController` | Category CRUD + reorder, MenuItem CRUD, availability toggle, plan limit guard |
| 6 | Customer QR | `ArController` (public) | Public AR menu read, scan event logging, Redis cache (5min) |
| 7 | Order Management | `OrderController`, `CustomerOrderController` | Order state machine (PENDING→DELIVERED), cart integration, cancel flow |
| 8 | Staff Management | `StaffController` | Staff CRUD, role assignment, active/inactive |
| 9 | Billing | `SubscriptionController`, `WebhookController` | Razorpay checkout, webhook verification, plan change, payment history |
| 10 | Invoices | `InvoiceController` | Invoice generation from orders, PDF download, payment history |
| 11 | Support | `SupportTicketController` | Ticket CRUD, reply threads, status management (OPEN→RESOLVED) |
| 12 | Analytics | `AnalyticsController`, `DashboardController` | Scan events, daily scans, top items, monthly revenue, platform-wide stats |
| 13 | WebAR | `MediaController` (model upload) | Cloudinary GLTF/GLB upload, AR model URL management, media files CRUD |

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Redis 7.0+
- Maven 3.8+

### Backend Setup

```bash
# Navigate to backend
cd AR-Backend

# Copy environment configuration
cp .env.example .env
# Edit .env with your database, Redis, Razorpay, Cloudinary credentials

# Build and run
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend Setup

```bash
# Navigate to frontend
cd ar-frontend

# Install dependencies
npm install

# Set environment variables
echo "VITE_API_BASE_URL=http://localhost:8080" > .env

# Start development server
npm run dev
```

### Environment Variables (Backend)

```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=ar_smart_menu
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-256-bit-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=900000    # 15 minutes in ms
JWT_REFRESH_TOKEN_EXPIRY=604800000 # 7 days in ms

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_app_password
```

---

## 📐 Quality Standards

### Responsive Design

Every screen is fully responsive across these breakpoints:

| Class | Width | Target |
|-------|-------|--------|
| Default | < 640px | Mobile |
| `sm` | ≥ 640px | Tablet small |
| `md` | ≥ 768px | Tablet |
| `lg` | ≥ 1024px | Laptop |
| `xl` | ≥ 1280px | Desktop |
| `2xl` | ≥ 1536px | Large desktop |

### Mandatory Requirements

- ✅ Type safety (TypeScript where applicable)
- ✅ Loading states (skeletons, spinners)
- ✅ Error states (error boundaries, retry buttons)
- ✅ Empty states (illustration + CTA)
- ✅ Toast notifications (success, error, info)
- ✅ Form validation (Zod schemas)
- ✅ Accessibility (focus states, keyboard nav, ARIA labels)
- ✅ Touch targets (minimum 44px)
- ✅ Mobile-first responsive design
- ✅ Role-based access checks
- ✅ Tenant isolation checks
- ✅ Lazy loading for all route components
- ✅ Dark theme with glassmorphism

---

## 📝 License

This project is proprietary software. All rights reserved.

---

<p align="center">
  <strong>Built with ❤️ by the AR Smart Menu Team</strong>
</p>
