# AR Smart Menu — Full Test Plan

> **Version:** 1.0  
> **Scope:** Frontend (React/Vite) + Backend (Spring Boot)  
> **Coverage:** All 13 Development Phases  
> **Status:** ✅ Complete

---

## Table of Contents

1. [Phase 0 — Foundation & Architecture](#phase-0--foundation--architecture)
2. [Phase 1 — Authentication](#phase-1--authentication)
3. [Phase 2 — Super Admin Foundation](#phase-2--super-admin-foundation)
4. [Phase 3 — Restaurant Onboarding](#phase-3--restaurant-onboarding)
5. [Phase 4 — Table & QR Management](#phase-4--table--qr-management)
6. [Phase 5 — Menu Management](#phase-5--menu-management)
7. [Phase 6 — Customer QR Experience](#phase-6--customer-qr-experience)
8. [Phase 7 — Order Management](#phase-7--order-management)
9. [Phase 8 — Staff Management](#phase-8--staff-management)
10. [Phase 9 — Billing & Subscriptions](#phase-9--billing--subscriptions)
11. [Phase 10 — Invoices](#phase-10--invoices)
12. [Phase 11 — Feedback & Support](#phase-11--feedback--support)
13. [Phase 12 — Analytics](#phase-12--analytics)
14. [Phase 13 — WebAR](#phase-13--webar)
15. [Cross-Cutting Concerns](#cross-cutting-concerns)

---

## Phase 0 — Foundation & Architecture

### Frontend Tests

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 0.1 | App builds without errors | Run `npm run build` | Build completes with zero errors | Build |
| 0.2 | Dev server starts | Run `npm run dev` | Vite starts on port 5173 | Smoke |
| 0.3 | Router loads all routes | Check `router.jsx` configuration | All route paths resolve to lazy-loaded components | Unit |
| 0.4 | API client configured | Check `axios.js` | JWT interceptor, base URL, error handling set up | Unit |
| 0.5 | Query client configured | Check `queryClient.js` | TanStack Query with proper stale times, retries | Unit |
| 0.6 | Dark theme applies | Navigate to any page | Dark background, light text, glassmorphism effects | Visual |
| 0.7 | Responsive at 320px | Resize browser to 320px width | No horizontal scroll, all content visible | Responsive |
| 0.8 | Responsive at 768px | Resize browser to 768px width | Layout adapts with 2-column grid | Responsive |
| 0.9 | Responsive at 1440px | Resize browser to 1440px width | Full layout with sidebar, multi-column grids | Responsive |

### Backend Tests

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 0.10 | Backend starts | `./mvnw spring-boot:run` | Server starts on port 8080 | Smoke |
| 0.11 | Health check | `GET /api/v1/health` | Returns `{ success: true }` | Smoke |
| 0.12 | CORS configured | Send request from frontend origin | 200 response, CORS headers present | Integration |
| 0.13 | Rate limiting active | Send rapid requests to `/auth/login` | 429 after threshold exceeded | Integration |

---

## Phase 1 — Authentication

### Login

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 1.1 | Login page renders | Navigate to `/login` | Email/password fields, 3D background visible | Visual |
| 1.2 | Valid login | Submit valid credentials | JWT access + refresh tokens returned, redirect to dashboard | E2E |
| 1.3 | Invalid email | Submit wrong email | Error toast, no redirect | E2E |
| 1.4 | Invalid password | Submit wrong password | Error toast, no redirect | E2E |
| 1.5 | Empty fields | Submit empty form | Validation errors shown on fields | E2E |
| 1.6 | Link to Register | Click "Create account" | Navigate to `/register` | Integration |
| 1.7 | Link to Forgot Password | Click "Forgot?" | Navigate to `/forgot-password` | Integration |

### Register

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 1.8 | Register page renders | Navigate to `/register` | Name, email, password, phone fields visible | Visual |
| 1.9 | Valid registration | Fill all fields correctly | Account created, redirect, toast success | E2E |
| 1.10 | Duplicate email | Register with existing email | Error toast, no account created | E2E |
| 1.11 | Password strength | Enter weak password | Visual strength indicator, minimum 8 chars | Integration |
| 1.12 | Empty fields | Submit empty form | Validation errors on required fields | E2E |
| 1.13 | Long name (>100 chars) | Submit with very long name | Truncation or validation error | Integration |

### Forgot / Reset Password

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 1.14 | Forgot page renders | Navigate to `/forgot-password` | Email field + "Send Reset Link" button | Visual |
| 1.15 | Submit forgot password | Enter valid email | Success state shown, email sent message | E2E |
| 1.16 | Reset page with valid token | Navigate to `/reset-password?token=valid` | Password fields shown | Integration |
| 1.17 | Reset page without token | Navigate to `/reset-password` | "Invalid reset link" state shown | Integration |
| 1.18 | Reset with mismatched passwords | Enter different passwords | Validation error, passwords must match | E2E |
| 1.19 | Reset with weak password | Enter weak password | Strength indicator, meets requirements | Integration |

### 403 Forbidden

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 1.20 | Forbidden page renders | Navigate to `/403` | Lock icon, "Access Forbidden" text | Visual |
| 1.21 | Go to Dashboard link | Navigate to `/403`, click link | Redirect to login (unauthenticated) or dashboard | Integration |
| 1.22 | Go Back link | Click "Go Back" | Browser navigates back | Integration |
| 1.23 | Sign Out link | Click "Sign Out" | Logout, redirect to login | Integration |

### Auth Protection

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 1.24 | Unauthenticated access to dashboard | Navigate to `/dashboard/home` | Redirect to `/login` | Integration |
| 1.25 | Unauthenticated API call | Call protected endpoint without token | 401 Unauthorized | Integration |
| 1.26 | Expired token | Call API with expired token | 401, frontend redirects to login | E2E |
| 1.27 | Role-restricted page | Staff tries to access `/admin/dashboard` | 403 Forbidden | E2E |

---

## Phase 2 — Super Admin Foundation

### Super Admin Dashboard

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 2.1 | Dashboard renders | Navigate to `/admin/dashboard` as SUPER_ADMIN | Hero, KPI cards, recent activity, charts | Visual |
| 2.2 | KPI cards load | Wait for data fetch | Total restaurants, users, scans, revenue | E2E |
| 2.3 | Recent activity list | Check activity section | Latest events with timestamps | E2E |

### Admin Restaurants

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 2.4 | Restaurants list renders | Navigate to `/admin/restaurants` | Table/cards with all tenants | Visual |
| 2.5 | Search restaurants | Type in search bar | Filters list by name | E2E |
| 2.6 | Pagination | Scroll through list | Loads more results | E2E |
| 2.7 | Create restaurant | Click "Create", fill form, submit | Restaurant created, toast success | E2E |
| 2.8 | Activate tenant | Click activate toggle | Status changes to active | E2E |
| 2.9 | Deactivate tenant | Click deactivate | Status changes, confirmation dialog | E2E |

### Admin Plans

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 2.10 | Plans page renders | Navigate to `/admin/plans` | Plan list with pricing, features | Visual |
| 2.11 | Create plan | Fill plan form, submit | Plan created, visible in list | E2E |
| 2.12 | Edit plan | Modify plan properties | Changes saved, reflected in UI | E2E |
| 2.13 | Delete plan | Click delete, confirm | Plan removed, warning if in use | E2E |

### Admin Subscriptions

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 2.14 | Subscriptions page renders | Navigate to `/admin/subscriptions` | Stats cards, filterable table | Visual |
| 2.15 | Filter by plan | Select plan from dropdown | List filtered by plan tier | E2E |
| 2.16 | Filter by status | Select status | Filtered by ACTIVE/EXPIRED/etc. | E2E |
| 2.17 | View subscription details | Click row | Dialog with full subscription info | E2E |
| 2.18 | Cancel subscription | Click "Cancel" in dialog | Status updated, toast success | E2E |

### Admin Support Tickets

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 2.19 | Support tickets renders | Navigate to `/admin/support-tickets` | Ticket list, filters, stats | Visual |
| 2.20 | View ticket detail | Click a ticket | Dialog with conversation thread | E2E |
| 2.21 | Reply to ticket | Type reply, click Send | Reply added to thread | E2E |
| 2.22 | Update ticket status | Change status dropdown | Status updated in list | E2E |

### Admin Analytics

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 2.23 | Analytics renders | Navigate to `/admin/analytics` | Platform KPI cards, charts | Visual |
| 2.24 | Revenue chart | Check chart section | Bar chart with monthly data | Visual |
| 2.25 | Top items list | Check items section | Ranked item list with view counts | E2E |

### Admin Audit Logs

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 2.26 | Audit logs renders | Navigate to `/admin/audit-logs` | Paginated log table | Visual |
| 2.27 | Filter logs | Apply date range filter | Filtered results returned | E2E |

---

## Phase 3 — Restaurant Onboarding

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 3.1 | Onboarding renders | Navigate to `/dashboard/onboarding` | Welcome screen with feature highlights | Visual |
| 3.2 | Step navigation | Click "Get Started" | Advances to Step 1 (Restaurant Details) | Integration |
| 3.3 | Step 1 validation | Submit empty form | Validation errors on name field | Integration |
| 3.4 | Step 1 valid data | Fill name, address, description | Advances to Step 2 | Integration |
| 3.5 | Step 2 cuisine selection | Click cuisine type pills | Selected cuisine highlighted | Integration |
| 3.6 | Step 2 phone validation | Enter invalid phone | Validation error shown | Integration |
| 3.7 | Create restaurant | Complete all steps, submit | Restaurant created, toast success | E2E |
| 3.8 | Back navigation | Click "Back" at any step | Returns to previous step with data preserved | Integration |
| 3.9 | Step indicator | Check top progress bar | Shows correct step position | Visual |

---

## Phase 4 — Table & QR Management

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 4.1 | Tables page renders | Navigate to `/dashboard/tables` | Stats cards, search bar, table list | Visual |
| 4.2 | Create table | Click "Add Table", fill form, submit | Table created, appears in list | E2E |
| 4.3 | Edit table | Click edit on a table | Dialog pre-filled, save updates | E2E |
| 4.4 | Delete table | Click delete, confirm | Table soft-deleted, removed from list | E2E |
| 4.5 | Toggle table active | Toggle active switch | Status changes without page reload | E2E |
| 4.6 | Search tables | Type table number in search | Filters visible tables | Integration |
| 4.7 | Generate QR code | Click "Generate QR" on a table | QR code generated, image displayed | E2E |
| 4.8 | Download QR | Click download on QR | PNG file downloads | E2E |
| 4.9 | Regenerate QR | Click regenerate | New QR replaces old one | E2E |
| 4.10 | QR scan count | Check scan count display | Shows number of times QR was scanned | E2E |
| 4.11 | Restaurant selector | Switch restaurant | Tables update for selected restaurant | Integration |

---

## Phase 5 — Menu Management

### Categories

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 5.1 | Menus page renders | Navigate to `/dashboard/menus` | Stats cards, category chips, menu items | Visual |
| 5.2 | Create category | Click "Add Category", fill name, submit | Category created, appears in chips | E2E |
| 5.3 | Edit category | Click edit on category chip | Dialog pre-filled, save updates name | E2E |
| 5.4 | Delete category | Click delete, confirm | Category removed (409 if has items) | E2E |
| 5.5 | Filter by category | Click category chip | Only items in that category shown | Integration |
| 5.6 | Category item count | Check chip badge | Shows count of items in category | E2E |

### Menu Items

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 5.7 | Create menu item | Click "Add Item", fill form, submit | Item created, appears in list | E2E |
| 5.8 | Edit menu item | Click edit on an item | Dialog pre-filled, save updates | E2E |
| 5.9 | Delete menu item | Click delete, confirm | Item soft-deleted | E2E |
| 5.10 | Toggle availability | Click availability toggle | Status switches without page reload | E2E |
| 5.11 | Search items | Type in search bar | Filters by name, description, ingredients | Integration |
| 5.12 | Image upload | Upload item image | Image URL saved, thumbnail displayed | E2E |
| 5.13 | AR model flag | Check AR badge | Items with model show "3D" badge | Visual |
| 5.14 | Price formatting | Enter price value | Formats to currency with 2 decimals | Unit |

---

## Phase 6 — Customer QR Experience

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 6.1 | AR menu loads | Navigate to `/ar/:tableId` | Restaurant header, search bar, menu items | E2E |
| 6.2 | Restaurant info displays | Check header | Name, cuisine type, table identifier visible | Visual |
| 6.3 | Category tabs | Scroll category chips | Horizontal scroll, active indicator | Integration |
| 6.4 | Filter by category | Click category chip | Items filtered by category | Integration |
| 6.5 | Search items | Type in search bar | Filters menu items in real-time | Integration |
| 6.6 | Clear search | Click X on search | Resets to full menu | Integration |
| 6.7 | Item card displays | Check a menu card | Image, name, price, description, ingredients | Visual |
| 6.8 | Item detail modal | Click an item card | Bottom sheet with full details, AR button if applicable | E2E |
| 6.9 | AR badge visible | Check AR-enabled items | "3D" badge on card corner, "View in AR" text | Visual |
| 6.10 | Share button | Click share icon | Share dialog opens | Integration |
| 6.11 | Loading state | Slow network simulator | Skeleton placeholders shown | E2E |
| 6.12 | Error state | Kill backend | Error screen with retry button | E2E |
| 6.13 | Empty state | Restaurant has no items | "No menu items available" message | E2E |
| 6.14 | Mobile responsive | Mobile viewport (375px) | Single column, bottom bar, touch-friendly | Responsive |

---

## Phase 7 — Order Management

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 7.1 | Orders page renders | Navigate to `/dashboard/orders` | Stats cards, status tabs, order cards | Visual |
| 7.2 | Status tabs filter | Click each status tab | Orders filtered by selected status | Integration |
| 7.3 | Tab counts update | Check tab badges | Shows count of orders per status | E2E |
| 7.4 | Advance order status | Click "Move to ACCEPTED" | Order status advances, toast success | E2E |
| 7.5 | Full status flow | Advance through all statuses | PENDING → ACCEPTED → PREPARING → READY → DELIVERED | E2E |
| 7.6 | Cancel order | Click "Cancel" on PENDING order | Status changes to CANCELLED | E2E |
| 7.7 | Search orders | Type order ID or table number | Filters matching orders | Integration |
| 7.8 | Order card details | Check card content | Items preview, customer name, time, amount, notes | Visual |
| 7.9 | Restaurant selector | Switch restaurant in dropdown | Orders update for selected restaurant | Integration |
| 7.10 | Loading state | Slow network | Skeleton placeholders | E2E |
| 7.11 | Empty state | No orders for restaurant | "No orders yet" message | E2E |
| 7.12 | Revenue calculation | Check stats | Revenue shows sum of delivered orders | E2E |

---

## Phase 8 — Staff Management

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 8.1 | Staff page renders | Navigate to `/dashboard/staff` | Stats cards, staff cards, search bar | Visual |
| 8.2 | Create staff member | Click "Add Staff", fill form, submit | Staff created, appears in list | E2E |
| 8.3 | Edit staff | Click edit on a staff card | Dialog pre-filled, save updates | E2E |
| 8.4 | Delete staff | Click delete, confirm | Staff removed from list | E2E |
| 8.5 | Toggle active status | Toggle active switch | Staff status updated | E2E |
| 8.6 | Search staff | Type name in search | Filters by name, email, role | Integration |
| 8.7 | Role badge colors | Check STAFF vs MANAGER badges | Different colors for each role | Visual |
| 8.8 | Stats cards | Check stats | Total, active, inactive, manager counts | E2E |
| 8.9 | Staff count by role | Add multiple staff | Stats update correctly | E2E |

---

## Phase 9 — Billing & Subscriptions

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 9.1 | Subscription page renders | Navigate to `/dashboard/subscription` | Current plan bar, plan cards, payment history | Visual |
| 9.2 | Current plan displays | Check hero section | Plan name, status badge, period end date, price | E2E |
| 9.3 | Plan cards render | Scroll plan grid | 4 plan tiers (Trial, Starter, Growth, Enterprise) | Visual |
| 9.4 | Feature comparison | Check each plan card | Features listed, disabled features greyed out | Visual |
| 9.5 | Popular badge | Check Starter plan | "Most Popular" ribbon on Starter | Visual |
| 9.6 | Upgrade flow | Click "Upgrade" on a plan | Checkout session created | E2E |
| 9.7 | Current plan disabled | Click current plan button | Button disabled, shows "Current Plan" | Integration |
| 9.8 | Payment history table | Check table section | Date, plan, amount, status columns | E2E |
| 9.9 | Payment status styles | Check different statuses | Green for COMPLETED, red for FAILED, etc. | Visual |
| 9.10 | Total payments | Check table footer | Shows sum of all payments | E2E |
| 9.11 | Error banner | Backend unavailable | Non-blocking error banner shown | E2E |

---

## Phase 10 — Invoices

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 10.1 | Invoices page renders | Navigate to `/dashboard/invoices` | Hero, stats cards, table | Visual |
| 10.2 | Invoice table columns | Check table | Invoice #, Date, Status, Amount, Actions | Visual |
| 10.3 | Filter by status | Select status from dropdown | Table filters by selected status | Integration |
| 10.4 | Search invoices | Type invoice number | Filters by number or order ID | Integration |
| 10.5 | View invoice details | Click eye icon | Detail dialog with full breakdown | E2E |
| 10.6 | Download invoice | Click download on PAID invoice | PDF downloads | E2E |
| 10.7 | Print invoice | Click print in detail dialog | Browser print dialog opens | Integration |
| 10.8 | Generate invoice from order | Click "Generate Invoice", enter order ID | Invoice created, toast success | E2E |
| 10.9 | Invoice line items | Check detail dialog items | Item names, quantities, prices listed | Visual |
| 10.10 | Amount breakdown | Check dialog | Subtotal, tax, discount, total calculated | Visual |

---

## Phase 11 — Feedback & Support

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 11.1 | Support page renders | Navigate to `/dashboard/support` | Hero, stats cards, ticket cards | Visual |
| 11.2 | Create support ticket | Click "New Ticket", fill form, submit | Ticket created, appears in list | E2E |
| 11.3 | Ticket form validation | Submit empty form | Validation errors on subject and description | Integration |
| 11.4 | Category selection | Select from dropdown | Options: General, Billing, Technical, Feature Request, Account | Integration |
| 11.5 | Priority selection | Select priority level | LOW, MEDIUM, HIGH, URGENT options | Integration |
| 11.6 | View ticket detail | Click a ticket | Detail dialog with description, replies | E2E |
| 11.7 | Reply to ticket | Type reply, click Send | Reply added to conversation | E2E |
| 11.8 | Status filter | Select status | Filters by OPEN, IN_PROGRESS, RESOLVED, CLOSED | Integration |
| 11.9 | Search tickets | Type in search | Filters by subject and description | Integration |
| 11.10 | Status line colors | Check ticket cards | Colored left border per status | Visual |
| 11.11 | Priority icons | Check priority badges | Different icon + color per priority level | Visual |

---

## Phase 12 — Analytics

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 12.1 | Analytics page renders | Navigate to `/dashboard/analytics` | Hero, KPI cards, charts, insights | Visual |
| 12.2 | KPI cards load | Wait for data | Total Scans, Total Orders, Revenue, Top Items | E2E |
| 12.3 | QR scans line chart | Check chart area | SVG line chart with animated path, dots, grid | Visual |
| 12.4 | Revenue bar chart | Check revenue section | Gradient bars, monthly labels, dollar values | Visual |
| 12.5 | Top items list | Check items section | Rank 1-8 with gold/silver/bronze badges | Visual |
| 12.6 | Insights panel | Check side panel | Summary cards for key metrics | Visual |
| 12.7 | Scan activity table | Scroll down | Date, scan count, progress bars | E2E |
| 12.8 | Animated counters | Watch values on load | Numbers count up from 0 | Visual |
| 12.9 | Empty chart state | Empty dataset | "No data yet" message with icon | E2E |

---

## Phase 13 — WebAR

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| 13.1 | AR viewer opens | Click "3D" badge on item | Full-screen 3D viewer overlay appears | Visual |
| 13.2 | Model loads | Wait for GLTF to load | Progress bar, then model displayed | E2E |
| 13.3 | Orbit controls | Drag to rotate model | Model rotates with touch/mouse | E2E |
| 13.4 | Auto-rotate toggle | Click rotate button | Model auto-rotation toggles on/off | Integration |
| 13.5 | Zoom in | Click + button | Camera moves closer to model | Integration |
| 13.6 | Zoom out | Click - button | Camera moves away from model | Integration |
| 13.7 | Close viewer | Click X button | Viewer closes, returns to menu | Integration |
| 13.8 | Loading state | Slow network | Animated spinner with progress percentage | Visual |
| 13.9 | Error state | Broken model URL | Error screen with retry and close buttons | E2E |
| 13.10 | Retry after error | Click "Retry" | Model reloads | E2E |
| 13.11 | Item detail AR button | Open item detail, click "View in Augmented Reality" | AR viewer opens with that item's model | E2E |
| 13.12 | 3D badge clickable | Click "3D" on card | AR viewer opens (without triggering card click) | Integration |
| 13.13 | Bottom hint bar | Check bottom of viewer | "Drag to explore • Pinch to zoom" hint | Visual |
| 13.14 | Top bar shows item name | Check viewer header | Item name displayed, close button visible | Visual |

---

## Cross-Cutting Concerns

### Loading States

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| C.1 | Skeleton loaders | Slow network simulation | All pages show animated skeleton placeholders | E2E |
| C.2 | Button loading state | Submit a mutation | Button shows spinner, disabled during request | Integration |
| C.3 | Data fetching indicator | Check for syncing text | Pages show "syncing..." when refetching | Visual |

### Error States

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| C.4 | API error banner | Backend unavailable | Error banner with retry button shown | E2E |
| C.5 | Toast errors | Trigger API error | Red error toast appears | Integration |
| C.6 | Toast success | Complete an action | Green success toast appears | Integration |
| C.7 | Empty state | No data available | Illustration + message + CTA shown | E2E |
| C.8 | 404 routing | Navigate to unknown route | Redirect to dashboard | Integration |

### Empty States

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| C.9 | No restaurants | New account with no restaurants | Empty state with "Create your first restaurant" | E2E |
| C.10 | No menu items | Restaurant with no items | "No menu items" with add CTA | E2E |
| C.11 | No orders | Restaurant with no orders | "No orders yet" message | E2E |
| C.12 | No tables | Restaurant with no tables | "No tables" with add CTA | E2E |
| C.13 | No staff | No staff members | "Add your first staff member" | E2E |
| C.14 | No tickets | No support tickets | "Create a ticket" empty state | E2E |
| C.15 | No invoices | No payment history | "No invoices yet" message | E2E |
| C.16 | No search results | Search for non-existent item | "No results matching" with clear search | E2E |

### Responsive Design

| # | Test Case | Viewport | Expected Result |
|---|-----------|----------|-----------------|
| C.17 | Mobile 375px | 375px × 812px | Single column, touch targets ≥44px, no horizontal scroll |
| C.18 | Tablet 768px | 768px × 1024px | 2-column grids, collapsible sidebar |
| C.19 | Laptop 1024px | 1024px × 768px | Sidebar visible, 3-4 column grids |
| C.20 | Desktop 1440px | 1440px × 900px | Full layout, spacious grids |
| C.21 | Large 1920px | 1920px × 1080px | Max-width containers, comfortable spacing |

### Accessibility

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| C.22 | Keyboard navigation | Tab through all interactive elements | Focus indicators visible, all buttons reachable | A11y |
| C.23 | Color contrast | Check text on backgrounds | WCAG AA contrast ratio minimum | A11y |
| C.24 | Touch targets | Measure button sizes | Minimum 44×44px for all touch targets | A11y |
| C.25 | Screen reader labels | Navigate with screen reader | Buttons and icons have aria-labels | A11y |

### Performance

| # | Test Case | Steps | Expected Result | Type |
|---|-----------|-------|-----------------|------|
| C.26 | Lazy loading | Check network tab | Route components loaded on demand | Perf |
| C.27 | Build size | Run `npm run build` | Chunks within reasonable limits | Perf |
| C.28 | Image loading | Check images | Lazy loading with placeholder blur | Perf |

---

## Test Execution Checklist

### Pre-requisites
- [ ] MySQL 8.0+ running
- [ ] Redis 7.0+ running
- [ ] Backend started on port 8080
- [ ] Frontend started on port 5173
- [ ] Test user accounts created (SUPER_ADMIN, RESTAURANT_OWNER, STAFF)
- [ ] Sample restaurant, menu items, tables seeded

### Smoke Test Suite (Run First)
- [ ] Backend health check: `GET /api/v1/health`
- [ ] Frontend loads at `http://localhost:5173`
- [ ] Login page renders
- [ ] Register flow works

### E2E Test Suite (Run After Smoke)
- [ ] Auth flow: register → login → access dashboard → logout
- [ ] Super Admin: create restaurant → manage plans → view analytics
- [ ] Owner: complete onboarding → create tables → manage menu
- [ ] Customer: scan QR → browse menu → view item detail → view 3D model
- [ ] Orders: place order → advance status → cancel
- [ ] Staff: create → assign → verify permissions
- [ ] Billing: view subscription → simulate upgrade → view payment history
- [ ] Invoices: view list → view detail → download
- [ ] Support: create ticket → reply → resolve

### Regression Test Suite
- [ ] Run all Phase 0-13 test cases above
- [ ] Check all empty, loading, and error states
- [ ] Verify responsive at all breakpoints
- [ ] Verify no console errors
- [ ] Run `npm run build` to verify production build

---

## Known Issues & Notes

| # | Issue | Priority | Status |
|---|-------|----------|--------|
| 1 | ARMenuView chunk size warning (~994KB) | Low | Pending — Three.js bundle expected size |
| 2 | Backend requires MySQL + Redis + Cloudinary + Razorpay pre-configured | High | Resolved — documented in README |
| 3 | Line ending warnings during git add (LF → CRLF) | Low | Windows environment, cosmetic |

---

*Test plan generated for AR Smart Menu v1.0.0 — All 13 phases covered.*
