# AR Restaurant SaaS Platform - Database Document

## Overview

The database for this platform should support a multi-tenant restaurant SaaS model inside a modular monolithic Spring Boot application. Since the application is not microservices-based, one central MySQL database is a practical choice, but the schema should still be designed with clear module boundaries and strict tenant isolation.[cite:45][cite:51]

## Database Strategy

For this project, the most practical starting approach is a single MySQL database with tenant-aware tables using `tenant_id` wherever data belongs to a restaurant tenant. Multi-tenant guidance for Spring applications emphasizes strict tenant-scoped access, while modular monolith guidance emphasizes keeping module boundaries clear even when one database is used.[cite:4][cite:7][cite:45]

### Recommended Approach

- One MySQL database.
- Shared schema or logically grouped schemas depending on DBA preference.
- Every tenant-owned table contains `tenant_id`.
- Global platform tables remain tenant-independent where appropriate.
- Foreign keys should preserve relational integrity.
- Auditing fields should be added broadly.

### Why This Works

This approach is simpler operationally than microservice-specific databases and is faster to build for a single Spring Boot deployment. It still supports strong logical isolation if query rules, security rules, and service rules always enforce tenant filtering.[cite:4][cite:45]

## Database Modules

The schema can be thought of as grouped by business modules:

- Identity and access.
- Tenant and restaurant.
- Tables and QR.
- Menu.
- Orders.
- Staff.
- Subscription and billing.
- Feedback.
- Support.
- Analytics support data.

## Core Tables

### 1. tenants

Stores tenant-level information for each restaurant business onboarded to the platform.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Internal tenant ID |
| code | VARCHAR | Unique tenant code or slug |
| status | VARCHAR | Trial, active, suspended, expired |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 2. users

Stores platform users including Super Admin, Restaurant Owner, and Staff.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | User ID |
| tenant_id | BIGINT FK NULL | Null for Super Admin, set for owner and staff |
| name | VARCHAR | Full name |
| email | VARCHAR UNIQUE | Login email |
| password | VARCHAR | Encrypted password |
| phone | VARCHAR | Mobile number |
| role | VARCHAR | SUPER_ADMIN, RESTAURANT_OWNER, STAFF |
| status | VARCHAR | Active, inactive, blocked |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 3. restaurants

Stores the restaurant business profile for each tenant.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Restaurant ID |
| tenant_id | BIGINT FK | Tenant relation |
| name | VARCHAR | Restaurant name |
| logo_url | VARCHAR | Logo path |
| email | VARCHAR | Contact email |
| phone | VARCHAR | Contact phone |
| address | TEXT | Address |
| gst_number | VARCHAR | GST value |
| cuisine_type | VARCHAR | Cuisine tag |
| opening_hours | JSON or TEXT | Opening time info |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 4. restaurant_tables

Stores dine-in table information and QR mapping.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Table ID |
| tenant_id | BIGINT FK | Tenant relation |
| table_number | VARCHAR | Human-readable table number |
| qr_code_url | VARCHAR | QR image path or URL |
| qr_target_url | VARCHAR | Browser target URL |
| status | VARCHAR | Active or inactive |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 5. categories

Stores menu category data.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Category ID |
| tenant_id | BIGINT FK | Tenant relation |
| name | VARCHAR | Category name |
| display_order | INT | Sorting |
| status | VARCHAR | Active or inactive |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 6. menu_items

Stores restaurant dishes and associated assets.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Item ID |
| tenant_id | BIGINT FK | Tenant relation |
| category_id | BIGINT FK | Category relation |
| name | VARCHAR | Dish name |
| description | TEXT | Dish description |
| price | DECIMAL(10,2) | Selling price |
| image_url | VARCHAR | Dish image |
| ar_model_url | VARCHAR | GLB or AR asset path |
| is_available | BOOLEAN | Availability |
| is_veg | BOOLEAN | Veg marker if needed |
| prep_time_minutes | INT | Optional estimate |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 7. customers

Optional table for repeat or identified customers if mobile or OTP-based profile is supported.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Customer ID |
| tenant_id | BIGINT FK NULL | Optional tenant relation if customer remains restaurant-linked |
| name | VARCHAR | Customer name |
| phone | VARCHAR | Mobile number |
| email | VARCHAR | Optional email |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 8. orders

Stores order headers.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Order ID |
| tenant_id | BIGINT FK | Tenant relation |
| table_id | BIGINT FK | Source table |
| customer_id | BIGINT FK NULL | Optional customer |
| order_number | VARCHAR | Human-friendly order code |
| status | VARCHAR | Pending, accepted, preparing, ready, served, cancelled |
| payment_status | VARCHAR | Pending, paid, failed, refunded |
| payment_mode | VARCHAR | Cash, UPI, online |
| subtotal_amount | DECIMAL(10,2) | Subtotal |
| tax_amount | DECIMAL(10,2) | Tax |
| total_amount | DECIMAL(10,2) | Final total |
| notes | TEXT | Customer notes |
| placed_at | DATETIME | Order time |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 9. order_items

Stores ordered item rows.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Order item ID |
| order_id | BIGINT FK | Parent order |
| menu_item_id | BIGINT FK | Related dish |
| item_name_snapshot | VARCHAR | Name snapshot for historical accuracy |
| quantity | INT | Qty |
| unit_price | DECIMAL(10,2) | Per-item price |
| total_price | DECIMAL(10,2) | Row total |
| created_at | DATETIME | Creation timestamp |

### 10. staff_permissions

Stores granular permission mappings if staff access becomes more detailed than one static role.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Record ID |
| tenant_id | BIGINT FK | Tenant relation |
| user_id | BIGINT FK | Staff user |
| permission_code | VARCHAR | Permission key |
| created_at | DATETIME | Creation timestamp |

### 11. plans

Stores master SaaS plan definitions.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Plan ID |
| name | VARCHAR | Starter, Growth, Premium |
| price | DECIMAL(10,2) | Plan amount |
| billing_cycle | VARCHAR | Monthly, yearly |
| features_json | JSON | Plan features |
| status | VARCHAR | Active or inactive |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 12. subscriptions

Stores tenant subscription lifecycle.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Subscription ID |
| tenant_id | BIGINT FK | Tenant relation |
| plan_id | BIGINT FK | Chosen plan |
| razorpay_subscription_id | VARCHAR | External reference |
| trial_start_date | DATETIME | Trial begin |
| trial_end_date | DATETIME | Trial expiry |
| start_date | DATETIME | Paid start |
| end_date | DATETIME | Current end |
| status | VARCHAR | Trial, active, past_due, expired, cancelled |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 13. payments

Stores both restaurant SaaS payments and optionally customer order payments if unified accounting is needed.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Payment ID |
| tenant_id | BIGINT FK NULL | Tenant relation |
| order_id | BIGINT FK NULL | Customer order relation |
| subscription_id | BIGINT FK NULL | SaaS subscription relation |
| razorpay_order_id | VARCHAR | External order ID |
| razorpay_payment_id | VARCHAR | External payment ID |
| amount | DECIMAL(10,2) | Amount |
| currency | VARCHAR | Usually INR |
| payment_type | VARCHAR | Order or subscription |
| payment_status | VARCHAR | Created, paid, failed, refunded |
| payment_method | VARCHAR | UPI, card, netbanking, cash |
| paid_at | DATETIME | Paid time |
| created_at | DATETIME | Creation timestamp |

### 14. feedback

Stores ratings and comments.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Feedback ID |
| tenant_id | BIGINT FK | Tenant relation |
| order_id | BIGINT FK NULL | Related order |
| customer_id | BIGINT FK NULL | Related customer |
| rating | INT | Numeric rating |
| comment | TEXT | Customer comment |
| created_at | DATETIME | Creation timestamp |

### 15. support_tickets

Stores tenant support issues.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Ticket ID |
| tenant_id | BIGINT FK | Tenant relation |
| raised_by_user_id | BIGINT FK | Request owner |
| subject | VARCHAR | Ticket subject |
| description | TEXT | Issue detail |
| priority | VARCHAR | Low, medium, high |
| status | VARCHAR | Open, in-progress, resolved, closed |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

## Entity Relationships

Key relationships should be:

- One tenant to one or more users.
- One tenant to one restaurant profile.
- One tenant to many tables.
- One tenant to many categories.
- One tenant to many menu items.
- One tenant to many orders.
- One order to many order items.
- One tenant to one active subscription at a time, but historical records can be preserved.
- One tenant to many staff permission rows.
- One tenant to many support tickets and feedback entries.

## Tenant Isolation Rules

Because the project is multi-tenant, tenant isolation is one of the most important database concerns. Spring multi-tenancy references emphasize that tenant-aware query design and request validation are essential to prevent cross-tenant data leakage.[cite:4][cite:7]

Mandatory database-related rules:

- Every tenant-owned table includes `tenant_id`.
- Repository queries must always filter by `tenant_id` where relevant.
- Unique constraints should often be tenant-scoped, such as `(tenant_id, table_number)` or `(tenant_id, category_name)` where suitable.
- Super Admin queries are the exception and should be explicitly separated.

## Indexing Recommendations

Suggested indexes:

- `users(email)` unique.
- `restaurants(tenant_id)` unique if one restaurant per tenant.
- `restaurant_tables(tenant_id, table_number)` unique.
- `categories(tenant_id, name)`.
- `menu_items(tenant_id, category_id, is_available)`.
- `orders(tenant_id, status, placed_at)`.
- `subscriptions(tenant_id, status)`.
- `payments(subscription_id)` and `payments(order_id)`.
- `feedback(tenant_id, created_at)`.
- `support_tickets(tenant_id, status)`.

## Auditing Columns

Most business tables should include:

- `created_at`
- `updated_at`
- `created_by` where useful
- `updated_by` where useful
- soft delete flag if business needs historical retention

## Final Recommendation

The database should start as one MySQL database with strict `tenant_id` isolation, relational consistency, and module-aware schema organization. This matches the chosen modular monolithic Spring Boot architecture well and gives the project a simpler, faster, and safer foundation than prematurely splitting databases around microservices.[cite:45][cite:51][cite:42]

## Invoice Data Model

Because the platform processes restaurant orders, the database should include proper invoice-related structures instead of leaving billing only inside the order table. Billing references emphasize invoice number tracking, itemized data, tax breakdowns, total amount, payment method, and historical records for reconciliation.[cite:68][cite:71][cite:77]

### 16. invoices

Stores invoice or receipt headers for customer orders and can be extended later for other invoice types.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Invoice ID |
| tenant_id | BIGINT FK | Tenant relation |
| order_id | BIGINT FK | Related order |
| invoice_number | VARCHAR | Unique invoice number |
| invoice_type | VARCHAR | Customer order, subscription, receipt |
| invoice_status | VARCHAR | Draft, issued, paid, cancelled, refunded |
| subtotal_amount | DECIMAL(10,2) | Subtotal |
| tax_amount | DECIMAL(10,2) | Tax total |
| service_charge_amount | DECIMAL(10,2) | Optional service charge |
| discount_amount | DECIMAL(10,2) | Discount total |
| total_amount | DECIMAL(10,2) | Final total |
| payment_status | VARCHAR | Pending, paid, failed, refunded |
| payment_method | VARCHAR | UPI, cash, card, online |
| issued_at | DATETIME | Invoice issue time |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### 17. invoice_items

Stores invoice line items for traceable billing snapshots.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Invoice item ID |
| invoice_id | BIGINT FK | Parent invoice |
| menu_item_id | BIGINT FK NULL | Original menu item relation |
| item_name_snapshot | VARCHAR | Final billed item name |
| quantity | INT | Quantity |
| unit_price | DECIMAL(10,2) | Unit price |
| line_tax_amount | DECIMAL(10,2) | Tax on line if required |
| discount_amount | DECIMAL(10,2) | Line discount if any |
| line_total | DECIMAL(10,2) | Final billed line amount |
| created_at | DATETIME | Creation timestamp |

### 18. invoice_sequences

Stores tenant-level invoice numbering logic if unique sequential invoice numbers are required.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Sequence ID |
| tenant_id | BIGINT FK | Tenant relation |
| financial_year | VARCHAR | Financial year reference |
| last_number | BIGINT | Last used invoice sequence |
| prefix | VARCHAR | Optional prefix |
| updated_at | DATETIME | Last update |

## Privacy by Database Design

Database privacy should be enforced by schema design as well as application logic. OWASP guidance on authorization problems shows that data leaks often happen when object ownership checks are weak, so sensitive data separation needs support from both query patterns and table structure.[cite:69][cite:72]

### Sensitive Data Handling Rules

- Store only required customer data.
- Avoid duplicating personal data unnecessarily across multiple tables.
- Keep invoice snapshots for billing accuracy but do not expose them outside authorized contexts.
- Passwords must always be stored as strong hashes, never plain text.
- Payment references should be stored, but raw secrets must never be stored in business tables.
- Consider encrypting highly sensitive fields at rest where business or compliance needs require it.

## Security by Database Design

The database should help support secure application behavior rather than depending only on controller logic. Spring and OWASP security guidance strongly support layered security, where database design, repository design, and API authorization all work together.[cite:69][cite:70][cite:72]

### Additional Security-Oriented Tables To Consider

#### 19. audit_logs

Stores sensitive action trails.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Log ID |
| tenant_id | BIGINT FK NULL | Tenant if applicable |
| user_id | BIGINT FK NULL | Acting user |
| action_type | VARCHAR | Login, impersonation, status change, invoice generation, payment verify |
| entity_type | VARCHAR | Order, invoice, user, subscription |
| entity_id | BIGINT NULL | Related object |
| ip_address | VARCHAR | Request source |
| user_agent | TEXT | Device metadata |
| metadata_json | JSON | Additional safe metadata |
| created_at | DATETIME | Event time |

#### 20. refresh_tokens

Stores controlled refresh token metadata if server-tracked refresh handling is used.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Token record ID |
| user_id | BIGINT FK | User relation |
| token_hash | VARCHAR | Hashed token value |
| expires_at | DATETIME | Expiry |
| revoked_at | DATETIME NULL | Revocation time |
| device_info | VARCHAR | Device or client label |
| ip_address | VARCHAR | Issued IP |
| created_at | DATETIME | Creation timestamp |

### Security Rules To Enforce In Data Layer

- Tenant-scoped unique constraints where relevant.
- No direct trust in client-provided ownership fields.
- Soft delete only where business recovery matters; otherwise use hard delete carefully.
- Audit critical actions like payment verification, invoice creation, subscription changes, and admin impersonation.
- Retain invoice and payment records for reconciliation and dispute support.[cite:68][cite:77]

