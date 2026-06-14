# AR Restaurant SaaS Platform - Overall Project Document

## Overview

This project is a modular monolithic multi-tenant SaaS platform for restaurants built with Spring Boot on the backend and React on the frontend. The platform combines restaurant onboarding, QR-based browser ordering, role-based dashboards, subscription billing, and WebAR-ready menu experiences in one deployable application instead of a microservices architecture.[cite:42][cite:45][cite:48]

The customer journey starts when a diner scans a table QR code, opens the menu in the browser, browses items, adds them to a cart, and places an order without installing a native app. This browser-first model is a strong fit for dine-in QR ordering because it reduces friction and supports fast access from the restaurant table.[cite:21][cite:27][cite:17]

## Architecture Decision

The preferred architecture for this product is a modular monolith, not microservices. Sources on Spring Boot modular monoliths describe this model as one deployable application with clear internal module boundaries, which reduces distributed-system complexity while keeping the codebase scalable and easier to evolve later.[cite:42][cite:45][cite:48]

This is a good fit because the platform is still being shaped, the business flows are tightly connected, and operational simplicity matters. Orders, subscriptions, restaurant management, authentication, feedback, staff workflows, and customer flows all need to work together closely, so a modular monolith avoids premature distributed complexity.[cite:45][cite:48]

## Final Tech Stack

### Backend

- Java 21.
- Spring Boot 3.
- Spring Security.
- JWT authentication.
- Spring Data JPA.
- Bean Validation.
- MapStruct.
- Lombok.
- MySQL.

The backend should remain one application but be divided by business modules rather than only by technical layers. Sources on modular monolith design recommend defining module boundaries around business capabilities and minimizing direct internal coupling between modules.[cite:45][cite:48][cite:51]

### Frontend

- React JS.
- React Router DOM.
- Tailwind CSS.
- Zustand.
- Axios.
- Optional TypeScript.

For this specific platform, TypeScript is recommended rather than optional in practice because the frontend will grow into a large admin and customer-facing system with many roles, forms, and API contracts. Sources discussing React at scale describe TypeScript as especially useful for catching API mismatches early, documenting component contracts, and keeping larger codebases maintainable.[cite:44][cite:47][cite:50]

### Payments

- Razorpay.
- UPI support through Razorpay Checkout.[cite:46]
- Subscription billing through Razorpay Subscriptions.[cite:3][cite:43]
- Potential recurring billing support through Razorpay UPI Autopay for subscription scenarios where applicable.[cite:49]

## Core Product Scope

This is a full-scope restaurant platform from the start, even if implementation happens in phases. The system should be designed now to support all target modules so that future additions do not force a redesign of the application structure.[cite:45][cite:48]

### Main Platform Modules

| Module | Purpose |
|---|---|
| Identity & Access | Login, JWT, roles, permissions, tenant context |
| Super Admin | Restaurant onboarding, plans, subscriptions, support, analytics |
| Restaurant Management | Profile, branches if needed later, settings |
| Table & QR | Table records, QR generation, QR mapping |
| Menu Management | Categories, items, media, AR references |
| Orders | Customer cart, order placement, kitchen flow, order status |
| Staff Management | Owner-managed staff access and role assignments |
| Billing & Subscription | Plans, trials, billing status, Razorpay integration |
| Feedback | Ratings, comments, issue reporting |
| Analytics | Revenue, order insights, popular dishes, AR usage later |
| Customer Web Experience | Browser menu, cart, order tracking, profile optional |
| Support | Ticket management and admin resolution |

## User Roles

### Super Admin

- Manage all restaurants.
- View all subscriptions.
- Create plans.
- Activate, suspend, or impersonate tenants safely.
- Manage support tickets.
- View platform-wide analytics.

### Restaurant Owner

- Manage own restaurant profile.
- Manage tables and QR codes.
- Create and update menu.
- Upload images and AR-ready files.
- Manage orders.
- Manage staff access.
- View billing and renew subscription.
- Review feedback and analytics.

### Staff

- Access only the workflows granted by owner.
- Usually view and update orders.
- Kitchen display and waiter status handling.

### Customer

- Scan QR code.
- Open browser menu.
- Browse dishes.
- Add to cart.
- Place order.
- Track status.
- Give feedback.

## Customer Experience Model

The customer experience should remain browser-first because QR ordering works best when customers can start immediately without installing an app. QR ordering references and WebAR references both support the no-install model as a major usability advantage, especially for table-side experiences.[cite:21][cite:25][cite:27]

The final customer path should be:

1. Scan QR code.
2. Open browser menu.
3. Auto-detect restaurant and table.
4. Browse menu.
5. View item details and optional AR preview.
6. Add items to cart.
7. Place order.
8. Restaurant dashboard receives order.
9. Staff updates status.
10. Customer sees status and optionally gives feedback.[cite:17][cite:12][cite:18]

## MVP Meaning In This Project

In this project, MVP does not mean a tiny demo. It means the smallest production-usable version of the complete restaurant ordering platform. Since the platform is intended to support a full business flow, the MVP should include all foundational capabilities required to run one or more real restaurants on the system, while non-essential premium enhancements can be deferred.[cite:45][cite:48]

### Recommended MVP Scope

| Included in MVP | Why it must be included |
|---|---|
| Auth and JWT security | Core access control |
| Multi-tenant restaurant onboarding | Essential SaaS foundation |
| Restaurant profile management | Tenant identity setup |
| Table management and QR generation | Required for table ordering |
| Menu categories and menu items | Core ordering data |
| Customer browser menu | Core customer entry point |
| Cart and order placement | Core transaction flow |
| Restaurant order dashboard | Required for operations |
| Staff access control | Required for kitchen and service team |
| Razorpay one-time payment collection where needed | Required for online payment support and UPI checkout flows.[cite:46] |
| Subscription plan structure | Required for SaaS monetization |
| Trial and subscription status tracking | Required for activation logic.[cite:3][cite:43] |

### Can Be After MVP But Must Be Planned Now

| Feature | Planning status |
|---|---|
| WebAR dish preview | Plan now, implement after ordering flow is stable |
| Advanced analytics | Plan now |
| AI descriptions and recommendations | Plan now |
| Loyalty or coupon engine | Plan now |
| Referral system | Plan now |
| Deep support workflows | Plan now |

## Suggested Modular Monolith Structure

The backend should be one Spring Boot application organized by feature modules. Spring modular monolith guidance emphasizes business-aligned modules, low coupling, and interface-based communication inside the monolith.[cite:45][cite:48][cite:51]

Suggested top-level modules:

- `auth`
- `tenant`
- `restaurant`
- `tableqr`
- `menu`
- `order`
- `staff`
- `subscription`
- `payment`
- `feedback`
- `analytics`
- `support`
- `shared`

These modules should communicate through services, interfaces, and internal events where appropriate instead of becoming a tangled monolith. Spring Modulith-style thinking is useful here even if the implementation stays with standard Spring Boot packaging.[cite:48]

## Security Model

JWT-based security with Spring Security is a suitable approach for this application. Tenant isolation must not rely only on frontend parameters; modular SaaS and multi-tenant guidance recommends validating user identity, role, and tenant ownership on every relevant request.[cite:4][cite:7]

### Security Layers

- JWT authentication.
- Role-based authorization.
- Tenant context resolution.
- Tenant validation filter.
- Resource ownership checks.
- Audit logging for admin impersonation and sensitive actions.

### Main Roles

| Role | Access |
|---|---|
| SUPER_ADMIN | Full platform access |
| RESTAURANT_OWNER | Full tenant access |
| STAFF | Restricted tenant operational access |
| CUSTOMER | Public or lightweight authenticated ordering access |

## Payment Model

Razorpay is a suitable fit because it supports UPI acceptance for payments and also offers subscription tooling for recurring SaaS billing. Razorpay documentation covers UPI payment acceptance through checkout as well as subscription-oriented flows and related FAQs.[cite:46][cite:3][cite:43]

Payment usage in this platform can have two tracks:

- SaaS billing for restaurant subscriptions.
- Customer ordering payments if online payment is enabled at restaurant level.

## WebAR Position

WebAR should be treated as a premium feature layer on top of the core browser ordering journey. WebAR documentation and `model-viewer` guidance support using the browser to show 3D models and launch AR-compatible experiences without forcing a native app flow.[cite:12][cite:18][cite:25]

This means the base ordering flow must work fully without AR, while dishes that have 3D assets can expose an additional “View in AR” option. That approach keeps the product practical for every restaurant while still allowing a premium experience for restaurants that invest in 3D food visualization.[cite:12][cite:25]

## Delivery Recommendation

The project should be built as a production-focused modular monolith using Spring Boot, Spring Security, JWT, MySQL, React, Zustand, React Router DOM, Tailwind CSS, and Razorpay. TypeScript is recommended because the frontend is expected to become large and role-heavy, and multiple React-at-scale references describe TypeScript as a major advantage for maintainability and safer frontend-backend integration.[cite:44][cite:47][cite:50]

This gives the project a strong balance: one deployable backend, controlled complexity, clear feature modules, browser-first customer UX, UPI-capable payments, and a foundation that can later evolve without rewriting the system from scratch.[cite:42][cite:45][cite:46]

## Responsive Design Requirement

Every screen in this platform must be fully responsive across mobile, tablet, laptop, and large desktop sizes. Even if Super Admin and Restaurant Owner are expected to use laptops more often, the application should still work correctly on phones and tablets because real-world access patterns change and emergency operational access can happen from any device.[cite:58][cite:59][cite:62]

### Device Strategy

| Role or screen type | Primary expected device | Mandatory support requirement |
|---|---|---|
| Super Admin dashboard | Laptop/Desktop | Must also remain usable on tablet and mobile without layout breakage.[cite:58][cite:62] |
| Restaurant Owner dashboard | Laptop/Desktop | Must support tablet and mobile responsive layouts for on-the-go management.[cite:58][cite:65] |
| Staff order screens | Tablet/Mobile | Must also work on laptop and desktop.[cite:62][cite:65] |
| Customer QR menu | Mobile | Must also adapt for tablets and larger screens.[cite:21][cite:27] |

### Required Breakpoint Philosophy

The platform should use responsive CSS so the same application works on different screen sizes instead of building separate UIs per device. Responsive design references recommend using CSS to rearrange layout based on screen width rather than maintaining device-specific pages.[cite:59]

Suggested breakpoints:

- Mobile: 320px to 639px.
- Small tablet: 640px to 767px.
- Tablet: 768px to 1023px.
- Laptop: 1024px to 1279px.
- Large desktop: 1280px and above.

### Non-Negotiable Responsive Rules

- No screen should break horizontally.
- No important action should disappear on smaller screens.
- Tables must transform safely using horizontal scroll, stacked cards, or priority-column behavior on smaller devices.[cite:61][cite:65]
- Touch targets should be easy to tap, and accessibility guidance commonly recommends aiming for 44x44 pixels for better usability.[cite:57][cite:60][cite:63]
- Admin dashboards should simplify density on smaller screens instead of trying to replicate desktop exactly.[cite:56][cite:62][cite:65]
- Customer UI must remain mobile-first because QR ordering starts on the phone.[cite:21][cite:27]

## Additional Important Points Often Missed

A few points are easy to miss during planning and should be included early:

- Skeleton loaders and empty states for all dashboards and menu screens, because multi-role SaaS apps should not show blank or broken states during API loading.[cite:58]
- Consistent error handling for validation, payment failure, QR mismatch, expired session, and unauthorized role access.
- Pagination, filtering, and search for admin and owner tables so dashboards do not become too heavy on smaller devices.[cite:61]
- Print-friendly QR export for restaurant tables.
- Debounced search and optimized list rendering for large menus or large order history tables.[cite:61]
- Device testing strategy across phone, tablet, and desktop before each major release.[cite:62][cite:65]

## Invoice and Billing Requirement

If the platform is taking customer orders, then invoice or bill generation must be part of the system and should not be treated as optional. Restaurant billing references note that a proper food bill should include core details such as restaurant identity, invoice number, date and time, order or table reference, itemized charges, taxes, discounts if any, total amount, and payment method used.[cite:68][cite:71][cite:77]

### What The Platform Should Generate

The system should generate two kinds of billing records:

- Customer order invoice or receipt for each placed order.[cite:68][cite:71]
- Restaurant subscription invoice or payment receipt for SaaS billing.[cite:74]

### Customer Invoice Minimum Fields

| Field | Why it is needed |
|---|---|
| Invoice number | Unique tracking and audit trail.[cite:74] |
| Restaurant name, address, contact | Business identity and support reference.[cite:71][cite:77] |
| GST or tax details if applicable | Compliance and accounting support.[cite:77] |
| Order number and table number | Operational traceability.[cite:68] |
| Date and time | Record keeping.[cite:68][cite:77] |
| Itemized order lines | Clear billing transparency.[cite:68][cite:71] |
| Quantity, unit price, line total | Accurate calculation and reporting.[cite:71] |
| Taxes, service charges, discounts | Financial clarity and compliance.[cite:68][cite:77] |
| Final total | Payment summary.[cite:71] |
| Payment method and payment status | Settlement and reconciliation support.[cite:68] |

### Why Invoice Matters In This Platform

Invoices are important not only for customers but also for restaurant accounting, dispute handling, tax records, and daily sales reconciliation. Without invoice generation, order history and payment records become weaker for audits, refund cases, and end-of-day settlement processes.[cite:68][cite:77]

## Privacy and Data Protection Requirement

Customer and restaurant privacy should be treated as a core platform requirement, not a later enhancement. OWASP API security guidance highlights that broken object-level authorization and similar authorization flaws can expose other users’ or tenants’ data if server-side checks are weak.[cite:69][cite:72]

### Privacy Goals

- No tenant should ever access another tenant’s data.[cite:69][cite:72]
- Staff should access only the minimum data required for their role.
- Customer data should be minimized and collected only where genuinely needed.
- Sensitive business data such as revenue, subscription, staff, and order history must remain protected.

### Important Privacy Practices

- Collect only necessary customer data, such as phone or name only when required.
- Avoid storing unnecessary personal information inside tokens because JWT best-practice guidance warns against putting sensitive information in tokens.[cite:73][cite:76]
- Mask sensitive fields in logs and admin views.
- Provide audit logs for sensitive access actions.
- Restrict admin impersonation and log every impersonation event.

## Strong Security Requirement

Security must be designed aggressively because this platform handles restaurant business data, customer orders, payments, and potentially tax-related invoice details. Spring Security and JWT guidance recommends short-lived access tokens, secure refresh handling, HTTPS in production, proper endpoint authorization, and clean token validation workflows.[cite:70][cite:73]

### Main Security Risks To Prevent

| Risk | Why it matters |
|---|---|
| Broken Object Level Authorization | A user could try to access another order, tenant, or invoice by changing IDs in requests.[cite:69][cite:72] |
| Broken property-level authorization | Attackers may try to change restricted fields such as role, plan, or payment status.[cite:75] |
| Token misuse | Weak token handling can expose sessions or allow replay attacks.[cite:70][cite:73] |
| Sensitive data leakage | Logs, APIs, or JWT claims can unintentionally expose personal or platform data.[cite:73][cite:76] |
| Payment spoofing | Fake payment success callbacks can corrupt billing if not verified properly. |

### Mandatory Security Controls

- Use role-based and tenant-based authorization together.[cite:69][cite:72]
- Validate ownership of every order, invoice, menu item, and support ticket on the server side.[cite:69][cite:72]
- Keep JWT access tokens short-lived and use safer refresh handling.[cite:70][cite:73]
- Never store passwords, secrets, or private customer details in JWT payloads.[cite:73][cite:76]
- Enforce HTTPS in production.[cite:70][cite:73]
- Verify Razorpay signatures and webhook authenticity for all payment events.
- Add rate limiting for login, OTP, and public order APIs.
- Add audit logs for login, impersonation, payment updates, subscription changes, and invoice generation.
- Encrypt passwords strongly and protect secrets outside source code.
- Sanitize and validate all request data.

