# AR Restaurant SaaS Platform - Frontend UI and Full Responsive Document

## Overview

The frontend should be built as a fully responsive multi-role web application for Super Admin, Restaurant Owner, Staff, and Customer. Every screen must work cleanly across small mobile, large mobile, tablet, laptop, and large desktop without layout breaking, clipped actions, unreadable tables, overlapping forms, or inaccessible controls.

This means the product must not be designed with assumptions such as admin only uses desktop or customer only uses phone. Real-world usage changes by situation, so all role-based screens must adapt properly to narrow, medium, and wide screen sizes.

## Core Responsive Principle

The UI should be responsive by system design, not by later patching. CSS, layout rules, spacing, typography, navigation, tables, forms, drawers, modals, cards, charts, filters, and action bars should all be built with breakpoints from the start.

Main responsive goals:

- No screen should horizontally break in normal use.
- No important action should become hidden on small screens.
- Forms should remain usable with touch input.
- Tables should transform intelligently, not just shrink until unreadable.
- Dashboard widgets should reorder based on priority.
- QR customer flow should remain very fast on mobile.
- Owner, Staff, and Admin screens should remain functional on tablet and small laptop.
- Large screens should use space efficiently without becoming too stretched.

## Supported Screen Sizes

The full UI should support these device classes.

| Screen class | Approx width | Target usage |
|---|---|---|
| Small mobile | 320px to 374px | Compact phones |
| Mobile | 375px to 639px | Standard customer and staff phone usage |
| Small tablet | 640px to 767px | Foldables and small tablet layouts |
| Tablet | 768px to 1023px | iPad and medium operational devices |
| Laptop | 1024px to 1279px | Main owner and admin usage |
| Large desktop | 1280px to 1535px | Full dashboard usage |
| Extra large desktop | 1536px+ | Analytics-heavy layouts |

## Recommended Breakpoints

Use a mobile-first responsive strategy.

```css
/* Mobile first base */
/* >= 640px  */
/* >= 768px  */
/* >= 1024px */
/* >= 1280px */
/* >= 1536px */
```

If Tailwind CSS is used, preferred breakpoints should map like this:

- `sm` = 640px
- `md` = 768px
- `lg` = 1024px
- `xl` = 1280px
- `2xl` = 1536px

## Final Frontend Stack

- React JS
- TypeScript
- React Router DOM
- Zustand
- Axios
- Tailwind CSS
- React Hook Form
- Zod
- Framer Motion only where needed

TypeScript should be treated as required here because a large responsive SaaS product with multiple dashboards, forms, and shared UI components becomes difficult to maintain safely without strict domain types.

## Design System Requirement

A shared design system should be created before building screens.

### Design tokens to define early

- Colors
- Typography scale
- Spacing scale
- Border radius scale
- Shadows
- Z-index rules
- Container widths
- Form heights
- Button variants
- Table density variants
- Responsive visibility helpers

### Typography scale guidance

The text system should scale cleanly across devices.

- Small labels: 12px to 13px
- Secondary labels: 14px
- Body text: 15px to 16px
- Section titles: 18px to 24px
- Page titles: 24px to 32px
- Dashboard hero stats: responsive but controlled

Avoid oversized headings on mobile and tiny unreadable data labels on desktop.

## Responsive Layout System

All screens should follow a consistent responsive layout structure.

### Layout building rules

- Use fluid containers with max widths.
- Prefer CSS grid for dashboards and form sections.
- Prefer flex for aligned action bars and compact blocks.
- Use `minmax()` and `auto-fit` or `auto-fill` for dynamic card grids.
- Avoid fixed widths for forms, modals, cards, and sidebars.
- Use `overflow-x-auto` only as fallback, not as primary responsive strategy.

### Container strategy

```css
.container-page {
  width: 100%;
  margin-inline: auto;
  padding-inline: 16px;
}

@media (min-width: 768px) {
  .container-page {
    padding-inline: 24px;
  }
}

@media (min-width: 1280px) {
  .container-page {
    max-width: 1440px;
    padding-inline: 32px;
  }
}
```

## Role-Based Responsive UI Requirement

## 1. Customer UI

Customer UI must be mobile-first because QR users usually arrive from a phone camera scan. But the same flow should also work on tablets and desktop browsers.

### Customer screens

- QR landing page
- Menu page
- Category navigation
- Item detail drawer or sheet
- Cart page
- Checkout page
- Order success page
- Live order tracking
- Feedback page
- Optional login or profile page

### Customer responsive rules

- On mobile, use single-column layout.
- Keep sticky cart bar visible but not intrusive.
- Category filters should become horizontal scroll chips on small screens.
- Item details should open in bottom sheet on mobile and modal on larger screens.
- Cart summary should be sticky bottom on mobile and sticky sidebar on desktop.
- Menu cards should shift from 1 column to 2 columns to 3 columns based on width.
- Images and AR buttons must remain above the fold for key dishes.
- Order status should use large touch-friendly blocks.

### Customer layout example

| Screen | Layout behavior |
|---|---|
| Small mobile | 1-column menu, sticky cart footer, drawer-based item details |
| Mobile | 1-column menu, improved spacing, bottom sheet cart interactions |
| Tablet | 2-column menu grid, side filter or top filter tabs |
| Laptop | 2 or 3-column menu with sticky cart panel |
| Large desktop | 3-column menu with stable side summary |

## 2. Restaurant Owner Dashboard

Owner screens should be dashboard-first but still fully usable on mobile and tablet because restaurant owners may check orders, edit items, or update availability from a phone.

### Owner screens

- Login
- Dashboard home
- Restaurant profile
- Menu categories
- Menu items
- Item create or edit form
- Table management
- QR management
- Orders list
- Order detail
- Staff management
- Subscription and billing
- Invoices
- Feedback
- Analytics
- Support tickets
- Settings

### Owner responsive rules

- Desktop should use sidebar + content layout.
- Tablet should allow collapsed sidebar or icon rail.
- Mobile should switch to top bar + drawer navigation.
- KPI cards should stack vertically first, then 2-up, then 4-up.
- Long forms should become single column on mobile and 2-column on desktop.
- Order management tables should transform into card lists on small screens.
- Filters should wrap correctly and not push buttons outside the viewport.
- QR actions should remain easy to tap and download.
- Billing and invoice areas should support print or export actions.

### Owner table behavior

For menu items, orders, staff, invoices, and support tickets, do not simply compress large tables on mobile.

Use one of these strategies:

- Priority columns only on tablet
- Card transformation on mobile
- Horizontal scroll with sticky first column only if absolutely needed
- Expandable row detail panels
- Tabbed dataset views for dense information

## 3. Staff Panel

Staff screens should be optimized for speed, visibility, and touch interaction. Kitchen or counter staff may use tablets more often than laptops, so the UI should be especially strong on medium screens.

### Staff screens

- Login
- Kitchen board
- New order queue
- Preparing queue
- Ready queue
- Served history
- Order detail
- Quick status actions

### Staff responsive rules

- On mobile, use stacked order cards.
- On tablet, use 2-column or 3-column ticket board.
- On laptop, use Kanban-style queue board.
- Touch actions should be large and color-safe.
- Timer, status, table number, and item count must remain visible without opening details.
- Sound or visual alerts should not block interaction.
- Kitchen cards should avoid tiny fonts and tightly packed badges.

## 4. Super Admin Dashboard

Super Admin screens are likely to be used more on laptop and desktop, but they still must not break on tablet or mobile. Responsive support here means controlled simplification, not full feature removal.

### Admin screens

- Login
- Platform dashboard
- Restaurants management
- Restaurant detail
- Plans management
- Subscription management
- Trial management
- Revenue analytics
- Support ticket management
- User management
- Impersonation logs
- Security logs
- Settings

### Admin responsive rules

- Desktop can use full sidebar.
- Tablet should use collapsible sidebar and simplified analytics blocks.
- Mobile should use drawer navigation and card summaries.
- Data-heavy sections should prioritize search, filters, and status first.
- Multi-column analytics should stack in meaningful order.
- Charts should resize without clipping labels.
- Wide admin tables should use responsive data strategies, not unreadable shrink.

## Global Navigation Responsiveness

Navigation should adapt by role and screen size.

### Navigation pattern

| Device | Navigation style |
|---|---|
| Mobile | Top app bar + drawer or bottom action bar where needed |
| Tablet | Top app bar + collapsible sidebar |
| Laptop | Sidebar + sticky top bar |
| Large desktop | Full sidebar + content header + utility panel if needed |

### Navigation rules

- Keep active state clearly visible.
- Support long menu labels without overflow.
- Use icons with labels, not icons alone for critical nav.
- Preserve keyboard accessibility.
- Ensure drawer can close easily on touch devices.

## Forms Responsiveness

Forms are a major part of this product, so they need strict responsive planning.

### Form rules

- On mobile, all major forms should be single column.
- On tablet, related fields can become 2-column.
- On desktop, large forms can use grouped sections with 2 or 3 columns.
- Labels should always remain visible.
- Validation messages should not shift layout badly.
- Primary submit action should stay visible near the end of the form.
- File upload zones should scale well for menu image and AR model upload.
- Numeric pricing fields should be easy to edit on touch keyboards.

### Common forms needing strong responsive behavior

- Restaurant onboarding
- Restaurant profile update
- Category form
- Menu item form
- Staff creation form
- Subscription plan form
- Support ticket form
- Feedback moderation form
- Customer checkout form

## Dashboard Responsiveness

Dashboard modules should not use one fixed card structure everywhere.

### KPI card rules

- 1 card per row on very small mobile
- 2 cards per row on standard mobile if space allows
- 2 or 3 cards on tablet
- 4 cards on laptop
- 4 to 6 cards on large desktop depending on density

### Analytics rules

- Charts should have minimum heights.
- Legends should move below chart on smaller screens.
- Filters above charts should wrap neatly.
- Use fewer chart labels on narrow screens.
- Avoid placing 3 charts side by side on tablet.

## Responsive Component Standards

Every shared component should have responsive rules defined before development.

### Components to standardize

- Buttons
- Inputs
- Selects
- Textareas
- Chips
- Tabs
- Drawers
- Modals
- Cards
- Tables
- Pagination
- Search bars
- Status badges
- Toasts
- Empty states
- Loading states
- File upload zones
- QR code preview blocks
- Invoice print views

### Button rules

- Minimum touch height: 44px
- Full width on mobile where needed
- Inline grouping only when space safely allows
- Avoid 3 or more same-level action buttons in one tight row on mobile

### Modal rules

- Use bottom sheet or full-screen modal on mobile
- Use centered modal on tablet and desktop
- Prevent content cut-off with internal scroll
- Keep close action always visible

## CSS Strategy

The CSS approach should be utility-first with structured component patterns.

### Required CSS practices

- Mobile-first classes
- Use `w-full`, `max-w-*`, `min-w-0`, and wrapping utilities properly
- Use `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` style progression
- Use `gap-*` values consistently
- Use `truncate` only for genuinely secondary text
- Use `line-clamp` where needed for card descriptions
- Prevent flex overflow using `min-w-0`
- Use `overflow-hidden` carefully so actions do not disappear

### Important layout examples

```css
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .responsive-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

```css
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

## Responsive Table Strategy

This platform has many data-heavy screens, so table responsiveness needs explicit rules.

### Tables that need planning

- Orders
- Menu items
- Staff list
- Support tickets
- Subscriptions
- Restaurants list
- Revenue records
- Invoices
- Audit logs

### Responsive table strategies

| Screen size | Strategy |
|---|---|
| Small mobile | Card list instead of table |
| Mobile | Card list or compact accordion rows |
| Tablet | Reduced columns + horizontal fallback |
| Laptop | Standard table |
| Large desktop | Standard table with advanced filters |

### Must-have table behaviors

- Sticky header where useful
- Search and filter always accessible
- Row actions grouped safely
- Bulk actions never hidden beyond reach
- Empty and loading states handled cleanly

## Image, Media, and AR Responsiveness

AR and media areas also need responsive planning.

### Rules

- Dish images should use fixed aspect ratios.
- AR preview buttons must stay prominent.
- 3D preview launch area should not overflow mobile viewports.
- Model loading states must be visible.
- Fallback image should appear if AR asset is unavailable.
- Camera or AR launch instructions should be concise on small screens.

## Print and Download Responsiveness

Some screens need print-friendly behavior as well.

### Print-sensitive modules

- QR code print view
- Customer invoice
- Owner invoice
- Subscription receipt
- Restaurant report export

### Print rules

- Use separate print CSS
- Hide unnecessary navigation in print mode
- Preserve QR contrast and scannability
- Ensure invoice content fits common paper widths

## Accessibility and Device Safety

Responsive design is not complete without accessibility.

### Required accessibility rules

- Minimum touch target around 44px
- Visible focus states
- Sufficient color contrast
- Readable body text sizes
- No reliance only on hover
- Keyboard support for desktop workflows
- Screen-reader labels for buttons and icon actions

## Performance Rules For Responsive UI

Responsive UI should stay fast across weaker mobile devices too.

### Performance rules

- Lazy load heavy dashboard modules
- Use skeleton states
- Virtualize very long lists if needed
- Compress images
- Keep chart libraries optimized
- Avoid heavy animations on operational screens
- Load AR assets only when needed

## Testing Requirement

All screens must be tested role by role across devices.

### Required test sizes

- 320px
- 375px
- 390px
- 414px
- 640px
- 768px
- 820px
- 1024px
- 1280px
- 1440px
- 1536px

### What to test

- Navigation opening and closing
- Table readability
- Form submission flow
- Validation message layout
- Modal behavior
- Drawer behavior
- Chart overflow
- Sticky elements
- Button reachability
- QR print preview
- Invoice print preview
- AR launch area
- Long text handling
- Empty state and error state behavior

## Screens That Must Never Break

The following screens need especially strict responsive QA because they are operationally important.

- Customer menu page
- Customer cart and checkout
- Live order tracking
- Owner order management
- Owner menu item form
- Staff kitchen board
- Super Admin restaurant list
- Super Admin subscription controls
- Invoice view and download page
- QR print page

## Extra Important Points Often Missed

These are commonly missed but should be included from the start.

- Safe area support for mobile notch devices
- Sticky bottom action bars on mobile
- Empty state design for every module
- Loading and skeleton states for every role
- Error state design for API failures
- Offline or weak-network handling for customer order flow
- Image fallback when dish image is missing
- AR fallback when model is not supported
- Pagination responsiveness
- Filter drawer on mobile for dense datasets
- Search debounce for heavy listings
- Long GST, invoice, and email text wrapping
- Dark mode readiness if future support is planned
- Localization-safe layouts for longer text labels
- Browser zoom safety and high-resolution display testing

## Suggested Frontend Folder Structure

```text
src/
  app/
    router/
    providers/
    store/
  shared/
    components/
    layouts/
    hooks/
    lib/
    utils/
    types/
    constants/
  features/
    auth/
    super-admin/
    owner/
    staff/
    customer/
    menu/
    orders/
    tables/
    subscriptions/
    payments/
    invoices/
    feedback/
    analytics/
    support/
  assets/
  styles/
```

## Final UI Recommendation

The entire UI should be treated as fully responsive by requirement, not by preference. Customer, Staff, Owner, and Super Admin screens must all work across mobile, tablet, laptop, and large desktop, with special care for forms, tables, dashboards, invoices, QR flows, and AR entry points.

The best implementation approach is mobile-first CSS, shared design tokens, responsive layout primitives, role-based screen patterns, table transformation rules, and a strict multi-device QA checklist before every module is marked complete.
