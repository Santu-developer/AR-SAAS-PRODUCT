# AGENT_README.md
# ⚠️ READ THIS ENTIRE FILE BEFORE WRITING A SINGLE LINE OF CODE
# This is the single source of truth for this project.

---

## WHAT YOU ARE BUILDING

You are building the **React JS frontend** for **AR Smart Menu** — a multi-tenant SaaS platform
for restaurants. The backend is a Spring Boot 3.2 monolith already built.

Full backend API contract is in `design.md` (project root). Read the relevant section before
building any module. Stitch HTML files in `/stitch/` folder are **visual layout references only**
— do NOT convert them line by line. Use them only to understand layout intent.

---

## THREE PORTALS IN THIS SYSTEM

| Portal | Route Prefix | Who Uses It |
|--------|-------------|-------------|
| Restaurant Dashboard | `/dashboard/*` | RESTAURANT_OWNER, MANAGER, STAFF |
| Customer AR App | `/ar/*` | Customers (OTP-based auth, mobile PWA) |
| Super Admin Panel | `/admin/*` | SUPER_ADMIN only |

**Build order: Restaurant Portal → Customer AR App → Super Admin**

---

## TECH STACK (everything already installed — do NOT npm install anything extra except noted)

```
React 18 + Vite
TailwindCSS + @tailwindcss/vite
react-router-dom v6        → use createBrowserRouter (NOT BrowserRouter)
axios
zustand
@tanstack/react-query v5
react-hook-form + zod + @hookform/resolvers
framer-motion
three + @react-three/fiber + @react-three/drei
react-hot-toast
lucide-react
react-qr-code
react-dropzone
clsx + tailwind-merge
shadcn/ui (already configured)
```

**Add these two when needed (not yet installed):**
- `@dnd-kit/sortable` — for Phase 5 category drag-to-reorder
- `recharts` — for Phase 7 analytics charts

---

## SKILLS FOLDER

Skills are in the `/skills/` folder in this project. Each skill is a `.md` file with rules,
patterns, and examples. **Read the relevant skill file before building that part of the UI.**

| When building... | Read this skill file |
|-----------------|---------------------|
| Any UI component (layout, spacing, typography) | `frontend-design.md` + `impeccable.md` + `emil-kowalski.md` |
| Animations and transitions | `motion-framer.md` |
| Forms, Tables, Dialogs, Overlays | `shadcn-expert.md` |
| Dashboard widgets, stat cards, plan progress | `21st-dev.md` |
| 3D model viewer (AR preview) | `threejs.md` |
| Folder structure, routing, stores | `react-architect.md` |
| Responsive layout, design tokens | `tailwind-master.md` |
| User flows, empty states, loading states | `ui-ux-pro-max.md` |

---

## FOLDER STRUCTURE (follow exactly — do not invent new folders)

```
src/
├── app/
│   ├── router.jsx              ← ALL routes defined here with createBrowserRouter
│   └── providers.jsx           ← QueryClientProvider, Toaster, auth wrappers
│
├── features/                   ← Feature-first architecture (NOT layer-first)
│   ├── auth/
│   │   ├── components/         ← LoginForm, RegisterForm, OtpForm
│   │   ├── hooks/              ← useLogin, useRegister
│   │   ├── store/
│   │   │   └── authStore.js    ← Zustand store
│   │   └── api/
│   │       └── auth.api.js     ← All auth axios calls
│   ├── restaurant/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── api/
│   ├── menu/
│   ├── orders/
│   ├── analytics/
│   ├── subscription/
│   ├── customer/               ← Customer AR portal (separate from dashboard)
│   └── admin/
│
├── shared/
│   ├── components/
│   │   ├── ui/                 ← shadcn auto-generated components (do NOT manually edit)
│   │   ├── layout/             ← Sidebar, Navbar, PageHeader, DashboardLayout
│   │   └── common/             ← DataTable, EmptyState, PageLoader, ErrorBoundary,
│   │                               SkeletonCard, ConfirmDialog
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   ├── usePagination.js
│   │   └── usePermission.js    ← role-based permission checks
│   ├── lib/
│   │   ├── axios.js            ← axios instance + interceptors (READ PATTERN BELOW)
│   │   ├── queryClient.js      ← React Query global config
│   │   └── utils.js            ← cn(), formatCurrency(), formatDate()
│   └── constants/
│       ├── roles.js            ← ROLES object: { SUPER_ADMIN, RESTAURANT_OWNER, ... }
│       └── planLimits.js       ← plan tier limits mirror of backend
│
├── styles/
│   └── index.css               ← Tailwind directives + ALL CSS custom properties here
│
└── main.jsx
```

---

## LOCKED DECISIONS (do not re-discuss, do not change, do not ask about these)

1. **NO useState for server/API data** → React Query handles everything from the server
2. **NO prop drilling** → Zustand stores for global state
3. **NO localStorage for accessToken** → memory only (security requirement)
4. **NO inline styles** → Tailwind utility classes only
5. **NO arbitrary Tailwind values** like `w-[347px]` unless mathematically unavoidable
6. **NO Three.js outside 2 places**: (a) menu item AR model viewer, (b) customer app hero scene
7. **NO Framer Motion on**: hover states, button clicks, form inputs. Only: page transitions,
   modal entrance, sidebar collapse, cart drawer slide, table row stagger, tab layout animation
8. **Every page needs all 4 states**: Loading skeleton → Data → Empty state → Error state
9. **Every destructive action** (delete, deactivate, cancel order) → AlertDialog confirmation first
10. **shadcn tokens must match brand** → never use default shadcn blue/slate palette

---

## API INTEGRATION PATTERN (use this exact pattern, always)

```javascript
// ─── src/shared/lib/axios.js ───────────────────────────────────────────────

import axios from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:8080
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Inject JWT Bearer token on every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401: try refresh → retry original request → if fails, logout
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await apiClient.post('/api/v1/auth/refresh-token', {
          refreshToken: useAuthStore.getState().refreshToken,
        });
        const newToken = res.data.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

```javascript
// ─── Backend response envelope ─────────────────────────────────────────────
// ALL responses from backend: { success, message, data, timestamp }
// ALWAYS access: response.data.data  (not response.data)

// ─── React Query GET pattern ───────────────────────────────────────────────
const { data, isLoading, error } = useQuery({
  queryKey: ['restaurants'],
  queryFn: () => apiClient.get('/api/v1/restaurants').then((r) => r.data.data),
  staleTime: 60_000, // match backend Redis TTL where applicable
});

// ─── React Query mutation pattern ──────────────────────────────────────────
const mutation = useMutation({
  mutationFn: (payload) => apiClient.post('/api/v1/restaurants', payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    toast.success('Restaurant created');
  },
  onError: (err) => {
    const msg = err.response?.data?.message || 'Something went wrong';
    const status = err.response?.status;
    if (status === 403) toast.error('Plan limit reached. Upgrade to continue.');
    else toast.error(msg);
  },
});
```

---

## DESIGN TOKENS (must be defined in src/styles/index.css before any component is built)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 6%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 6%;
    --popover-foreground: 0 0% 98%;
    --primary: 262 83% 58%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 262 83% 58%;
    --radius: 0.5rem;
  }
}

/* Font: Inter for UI body, Geist for display headings */
```

Dark theme is default and permanent. No light/dark toggle needed for now.

---

## ROLE CONSTANTS (src/shared/constants/roles.js)

```javascript
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};

export const DASHBOARD_ROLES = [ROLES.RESTAURANT_OWNER, ROLES.MANAGER, ROLES.STAFF];
```

---

## PROTECTED ROUTE PATTERN

```jsx
// src/shared/components/common/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}
```

---

## DEVELOPMENT PHASES & STATUS

> Update the Status column after completing each phase. This is how the next session knows where to continue.

| Phase | What Gets Built | Status |
|-------|----------------|--------|
| **1** | Foundation setup + Auth (login, register, JWT, stores, routing) | ⬜ NOT STARTED |
| **2** | Restaurant Portal shell (DashboardLayout, sidebar, dashboard home, plan banner) | ⬜ NOT STARTED |
| **3** | Restaurant management (CRUD, activate/deactivate, plan limit guard) | ⬜ NOT STARTED |
| **4** | Table + QR management (CRUD, QR generate/download, scan count) | ⬜ NOT STARTED |
| **5** | Menu management (categories drag-to-reorder, menu items, AR model upload/preview) | ⬜ NOT STARTED |
| **6** | Order management (Kanban/table view, status machine, real-time polling) | ⬜ NOT STARTED |
| **7** | Analytics + Subscription (charts, Razorpay upgrade flow, payment history) | ⬜ NOT STARTED |
| **8** | Customer AR App (OTP flow, menu browse, cart drawer, place order — mobile PWA) | ⬜ NOT STARTED |
| **9** | Super Admin portal (tenant list, plan override, audit logs, platform stats) | ⬜ NOT STARTED |

---

## CURRENT SESSION STATE

> ⚠️ THIS SECTION IS FILLED IN BEFORE EACH SESSION — UPDATE IT EVERY TIME

**Resuming at Phase:** 1  
**Last task completed:** Nothing — project start  
**Files already created:** None  
**Any known issues/bugs from last session:** None  
**Next task to start:** Setup index.css tokens → axios.js → router.jsx → authStore.js → Login page

---

## PHASE DETAILS (full task list per phase)

### PHASE 1 — Foundation + Auth

Read skill files: `react-architect.md`, `tailwind-master.md`, `frontend-design.md`, `motion-framer.md`, `shadcn-expert.md`

Tasks:
1. `src/styles/index.css` — all CSS custom properties (tokens from section above)
2. `src/shared/lib/axios.js` — full interceptor setup as shown above
3. `src/shared/lib/queryClient.js` — React Query client with default options
4. `src/shared/lib/utils.js` — cn(), formatCurrency(), formatDate()
5. `src/shared/constants/roles.js` — ROLES constants
6. `src/features/auth/store/authStore.js` — Zustand: { user, accessToken, refreshToken, isAuthenticated } + { login, logout, setToken }. accessToken in memory only.
7. `src/app/router.jsx` — createBrowserRouter with all routes (lazy loaded). Public: /login, /register, /ar/:tableId. Protected: /dashboard/* with PrivateRoute. Admin: /admin/* with PrivateRoute roles check.
8. `src/app/providers.jsx` — wrap with QueryClientProvider + Toaster
9. Login page `/login` — react-hook-form + zod. Fields: email, password. API: POST /api/v1/auth/login. On success: save tokens to store, redirect /dashboard.
10. Register page `/register` — multi-step form. Step 1: name, email, password, phone. Step 2: restaurant name, address, phone, cuisine type. AnimatePresence transition between steps. API: POST /api/v1/auth/register.
11. JWT silent refresh — interceptor already handles it. Test: access a protected route with expired token, verify it auto-refreshes.

Integration test before Phase 2:
- Login → redirect to /dashboard
- Refresh browser → still authenticated (store persists during session)
- Logout → redirect to /login
- Try /dashboard without login → redirect to /login

---

### PHASE 2 — Restaurant Portal Shell

Read skill files: `react-architect.md`, `frontend-design.md`, `motion-framer.md`, `shadcn-expert.md`, `21st-dev.md`

Tasks:
1. `DashboardLayout` — sidebar + navbar wrapper. All /dashboard/* pages render inside this.
2. Sidebar — collapsible (framer-motion spring). Items from roles-based config. Active link highlight. Logo at top. User info + logout at bottom.
3. Mobile sidebar — shadcn Sheet component, hamburger toggle in navbar.
4. Navbar — page title (dynamic), user avatar dropdown (profile, logout).
5. Dashboard home `/dashboard` — hit GET /api/v1/dashboard. Show: total restaurants, total tables, total menu items, orders today. Each as animated stat card (21st.dev pattern). Plan limit progress bars.
6. Plan/subscription banner — if TRIAL: show "X days remaining in trial" + Upgrade button. If any limit reached: show inline warning on the relevant create button. `usePlanLimits()` hook reads from subscription data.

staleTime for dashboard query: 60_000 (1 min — matches backend Redis TTL)

---

### PHASE 3 — Restaurant Management

Read skill files: `shadcn-expert.md`, `ui-ux-pro-max.md`, `tailwind-master.md`

Tasks:
1. `/dashboard/restaurants` — DataTable (sortable, paginated). Columns: name, cuisine, status, tables count, actions.
2. Create restaurant — Dialog with form. react-hook-form + zod. Fields: name, description, address, phone, cuisine_type, logo upload. Plan limit guard: if at max restaurants, button disabled with Tooltip "Upgrade plan to add more restaurants".
3. Edit restaurant — same form pre-populated, PUT /api/v1/restaurants/:id
4. Activate/Deactivate — AlertDialog confirmation. POST /api/v1/restaurants/:id/activate or deactivate.
5. Empty state — if no restaurants: illustration + "Create your first restaurant" CTA.
6. Mobile: table collapses to card view.

API endpoints: GET/POST /api/v1/restaurants, PUT /api/v1/restaurants/:id, POST activate/deactivate

---

### PHASE 4 — Table + QR Management

Read skill files: `shadcn-expert.md`, `ui-ux-pro-max.md`, `react-architect.md`

Tasks:
1. `/dashboard/restaurants/:restaurantId/tables` — card grid of tables.
2. Create/Edit table — Dialog form. Fields: table_number, label. Plan limit guard on create.
3. Soft delete table — AlertDialog confirmation.
4. QR Panel per table card:
   - If QR exists: show QR image (react-qr-code) + scan count Badge
   - Generate button → POST .../qr → show new QR with animation
   - Regenerate confirmation AlertDialog (overwrites old QR)
   - Download button → fetch Cloudinary URL → trigger file download
5. Loading state while QR generates — skeleton placeholder.

API: CRUD /api/v1/restaurants/:rId/tables, POST/GET /api/v1/restaurants/:rId/tables/:tId/qr

---

### PHASE 5 — Menu Management

Read skill files: `shadcn-expert.md`, `threejs.md`, `motion-framer.md`, `frontend-design.md`

Tasks:
1. Category management `/dashboard/restaurants/:rId/categories`:
   - List with drag-to-reorder (install @dnd-kit/sortable)
   - Create/Edit Dialog. Delete — guard: if has active items, show 409 message "Move or delete items first".
   - Bulk reorder → PUT /api/v1/restaurants/:rId/categories/reorder
2. Menu items `/dashboard/restaurants/:rId/menu-items`:
   - List with filter tabs by category + availability toggle
   - Availability switch — optimistic update (useMutation with rollback on error)
   - Inline price edit — click price → inline input → PATCH .../price
   - Item rows stagger-in on mount (framer-motion)
3. Create/Edit menu item — full form:
   - Image upload via react-dropzone → POST /api/v1/media/upload/image
   - AR model upload (GLTF/GLB) — only visible if plan.ar_models_enabled = true. POST /api/v1/media/upload/model
   - Fields: name, description, price, ingredients, categoryId, isAvailable
4. Menu item detail panel/drawer:
   - If model_url exists: render <Canvas> with useGLTF + OrbitControls + Environment from drei
   - Wrap in Suspense + ErrorBoundary
   - Loading: ModelSkeleton (placeholder box with shimmer)
   - Error: "3D model could not be loaded" fallback message

API: CRUD /api/v1/restaurants/:rId/menu-items, PATCH price/availability, media endpoints

---

### PHASE 6 — Order Management

Read skill files: `shadcn-expert.md`, `motion-framer.md`, `ui-ux-pro-max.md`

Tasks:
1. `/dashboard/restaurants/:rId/orders` — view toggle: Kanban columns OR data table.
2. Kanban: columns = PLACED | ACCEPTED | PREPARING | READY | SERVED | COMPLETED | CANCELLED
3. Order card: table number, item count, total, time elapsed, status badge.
4. Click order → Sheet (slide-in panel) with full detail: items list, prices, customer name, notes.
5. Status action buttons — only render valid next states from state machine:
   ```
   PLACED → [Accept, Cancel]
   ACCEPTED → [Start Preparing, Cancel]
   PREPARING → [Mark Ready]
   READY → [Served]
   SERVED → [Complete]
   ```
6. Cancel → AlertDialog confirmation.
7. Auto-refresh: refetchInterval: 30_000 (30 sec polling).
8. Empty states per Kanban column.

API: GET /api/v1/restaurants/:rId/orders, PATCH /api/v1/orders/:orderId/status, POST cancel

---

### PHASE 7 — Analytics + Subscription

Read skill files: `21st-dev.md`, `shadcn-expert.md`, `tailwind-master.md`

Tasks:
1. Analytics `/dashboard/analytics`:
   - Summary cards: total scans, total orders, total revenue. Animated number counters.
   - Daily scan line chart (recharts — install it). Date range filter.
   - Top 10 items bar chart.
   - Monthly revenue bar chart.
   - Tabs: Overview / Scans / Orders / Revenue (shadcn Tabs)
2. Subscription `/dashboard/subscription`:
   - Current plan card: plan name, status, renewal date, limits used.
   - Plan comparison table: TRIAL / STARTER / GROWTH / ENTERPRISE — highlight current.
   - Upgrade CTA → POST /api/v1/subscriptions/create-session → open Razorpay checkout JS → on success → POST /api/v1/subscriptions/verify-payment.
   - Payment history table: date, plan, amount, status.

staleTime for analytics: 60_000

---

### PHASE 8 — Customer AR App

Read skill files: `frontend-design.md`, `motion-framer.md`, `threejs.md`, `shadcn-expert.md`, `tailwind-master.md`, `ui-ux-pro-max.md`

⚠️ CRITICAL DESIGN NOTE: This portal has a completely different aesthetic from the admin dashboard.
Admin = utility, information density, dark SaaS feel.
Customer App = consumer, warm, tactile, food-forward. Think Swiggy/Zomato quality.
Different color palette, larger touch targets (min 44px), bottom-sheet patterns.

Tasks:
1. `/ar/:tableId` — public page, no auth needed. Load GET /api/v1/public/ar/table/:tableId.
   Show: restaurant name/logo, category tabs (sticky, horizontal scroll), menu items grid.
2. OTP Auth flow (triggered when customer tries to add to cart):
   - Bottom Sheet: enter phone or email → request OTP → enter 6-digit OTP → verify
   - customerAuthStore (SEPARATE Zustand store, separate from authStore)
   - Customer JWT stored in memory
3. Item detail → Dialog/bottom sheet: image, description, price, AR model if available. Add to cart CTA.
4. AR model in item detail: same Three.js Canvas setup as Phase 5.
5. Cart: floating cart button with item count badge. Tap → slide-up Sheet drawer (framer-motion).
   - Items list, quantity adjust (+/-), remove, subtotal, total.
   - "Place Order" CTA → POST /api/v1/customer/orders
6. Order success screen: order ID, estimated prep message, status polling.
7. PWA: add manifest.json + service worker basics.

staleTime for AR menu: 300_000 (5 min — matches backend Redis TTL)

---

### PHASE 9 — Super Admin Portal

Read skill files: `shadcn-expert.md`, `react-architect.md`, `ui-ux-pro-max.md`

Tasks:
1. `/admin/tenants` — DataTable: tenant name, email, plan, subscription status, restaurant count, joined date. Paginated.
2. Tenant detail `/admin/tenants/:tenantId` — plan info, restaurants list, assign-plan override.
3. Activate/Deactivate tenant — AlertDialog.
4. `/admin/dashboard` — platform stats: total tenants, active subscriptions, revenue.
5. `/admin/audit-logs` — paginated table with filters (entity type, date range, action).

---

## INTEGRATION CHECKLIST (run after EVERY phase)

- [ ] All API calls hit correct endpoint from design.md
- [ ] All responses unwrapped via `.data.data` pattern
- [ ] Error messages are human-readable (not raw API error strings)
- [ ] Loading skeleton shown before data arrives
- [ ] Empty state shown when list is empty
- [ ] Error boundary catches render errors
- [ ] Role guards work — manually test with different role JWTs
- [ ] Mobile responsive — test at 390px width (iPhone 14)
- [ ] No console errors or warnings
- [ ] Destructive actions all have AlertDialog confirmation

---

## HOW TO START A NEW SESSION (after API limit reset)

1. Update the **CURRENT SESSION STATE** section above with:
   - Which phase you're on
   - Last task completed
   - Files that already exist
   - Any bugs or blockers

2. Paste this message to the new agent:

```
Read AGENT_README.md in the project root completely before doing anything.
That file contains the full project context, architecture decisions, locked patterns, and current status.
Also read design.md for the backend API contract.
After reading, confirm: current phase, last completed task, and what you will build next.
Then start coding — do not re-explain the architecture back to me, just confirm and begin.
```

3. Agent will read the file, confirm state, and continue from exactly where you left off.

---

## QUALITY BARS (non-negotiable, every phase)

1. Lighthouse performance > 85 on mobile
2. No layout shift on page load (skeletons everywhere)
3. Client-side zod validation fires before any API call
4. Every form error message is human-first ("Email is required" not "email: String must contain...")
5. 403 from API → show contextual message ("Plan limit reached" or "Access denied") not generic
6. JWT expiry is handled silently — user never sees an auth error during normal use
7. No magic numbers — use constants from roles.js and planLimits.js
