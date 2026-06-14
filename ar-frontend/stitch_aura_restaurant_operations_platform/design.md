DESIGN.md
AR MENU SAAS PLATFORM
Version: 1.0
PROJECT TYPE
Managed AR Menu SaaS Platform
This is NOT a self-service SaaS.
Restaurant owners do not upload AR models.
Restaurant onboarding is managed by Super Admin and AR Team.
The platform consists of:


Marketing Website

Super Admin Portal

Restaurant Portal

Customer QR Experience
DESIGN SYSTEM LOADING
Always load:
frontend-design
ui-ux-pro-max
impeccable
emil-kowalski
motion-framer
react-architect
shadcn-expert
tailwind-master
threejs-animation
threejs-interaction
threejs-lighting
threejs-materials
threejs-postprocessing
Use all skills aggressively.
QUALITY TARGET
Target Design Quality:
Apple
Linear
Stripe
Arc Browser
Framer
Vercel
Notion
Avoid:
Generic SaaS
Bootstrap Style
Template Feel
Default Tailwind Look
Weak Typography
Repetitive Layouts
TECHNOLOGY STACK
Frontend:
Next.js 15
React 19
TypeScript
Tailwind CSS
Shadcn UI
Framer Motion
TanStack Query
Axios
Zustand
React Hook Form
Zod
Lucide Icons
Three.js
React Three Fiber
Drei
USER ROLES
SUPER_ADMIN
RESTAURANT_ADMIN
CUSTOMER
DEVICE STRATEGY
SUPER_ADMIN
Desktop Only
1440px 1280px 1024px
No mobile UI required.
RESTAURANT_ADMIN
Desktop First
1440px 1280px 1024px
Tablet Responsive
CUSTOMER
Mobile First
390px
430px
768px
Customer experience must feel like a premium mobile application.
APPLICATION STRUCTURE
PUBLIC WEBSITE
/
/features
/pricing
/how-it-works
/book-demo
/contact
/faq
SUPER ADMIN
/admin/login
/admin/dashboard
/admin/restaurants
/admin/restaurants/create
/admin/restaurants/[id]
/admin/plans
/admin/subscriptions
/admin/categories
/admin/menu-management
/admin/3d-assets
/admin/3d-requests
/admin/orders
/admin/payments
/admin/analytics
/admin/support
/admin/settings
RESTAURANT
/restaurant/login
/restaurant/dashboard
/restaurant/menu
/restaurant/menu/[id]
/restaurant/offers
/restaurant/orders
/restaurant/orders/[id]
/restaurant/analytics
/restaurant/subscription
/restaurant/profile
/restaurant/settings
/request-3d-model
CUSTOMER
/r/[restaurantSlug]/[tableId]
/menu
/item/[id]
/cart
/checkout
/otp
/order-success
SUPER ADMIN PORTAL
Purpose:
Complete Platform Management
SUPER ADMIN SIDEBAR
Dashboard
Restaurants
Plans
Subscriptions
Categories
Menu Management
3D Assets
3D Requests
Orders
Payments
Analytics
Support
Settings
Profile
Logout
SUPER ADMIN DASHBOARD
Cards:
Total Restaurants
Active Restaurants
Total Revenue
Total Orders
Active Subscriptions
Pending 3D Requests
Recent Activity Feed
Quick Actions
Visual Style:
Linear + Stripe
Premium Analytics
Minimal but powerful
RESTAURANTS SCREEN
Features:
Search
Filters
Status Badge
Create Restaurant
Edit Restaurant
Restaurant Detail Drawer
Restaurant Detail Page
CREATE RESTAURANT SCREEN
Fields:
Restaurant Name
Owner Name
Owner Email
Phone
Address
Plan
Status
PLANS SCREEN
Features:
Plan Cards
Monthly Pricing
Yearly Pricing
Plan Details
Edit Plan
Create Plan
SUBSCRIPTIONS SCREEN
Features:
Subscription Table
Expiry Tracking
Renewal Actions
Revenue Summary
3D ASSETS SCREEN
Features:
Asset Library
Search
Preview
Model Status
Upload History
3D REQUESTS SCREEN
Features:
Requested Item
Restaurant
Priority
Status
Assign To Team
Approve
Reject
ORDERS SCREEN
Features:
Global Orders Table
Filters
Status
Restaurant Name
Order Details
ANALYTICS SCREEN
Cards
Line Charts
Bar Charts
Revenue
Orders
Restaurants
Subscriptions
RESTAURANT PORTAL
Purpose:
Restaurant Daily Operations
RESTAURANT SIDEBAR
Dashboard
Menu
Offers
Orders
Analytics
Subscription
Profile
Settings
Logout
RESTAURANT DASHBOARD
Cards:
Orders Today
Revenue Today
Popular Items
Menu Health
Subscription Status
Pending 3D Requests
Recent Orders
MENU SCREEN
Features:
Menu Table
Food Image
3D Status
Price
Availability
Actions
CREATE MENU ITEM
Fields:
Name
Description
Price
Category
Image
Availability
MENU DETAIL SCREEN
Food Preview
Image
3D Status
Price
Availability
Activity Timeline
OFFERS SCREEN
Create Offer
Discount
Schedule
Offer Status
ORDERS SCREEN
Order Table
Status Updates
Order Details Drawer
Order Timeline
ANALYTICS SCREEN
Revenue
Orders
Popular Items
Menu Performance
QR Scans
SUBSCRIPTION SCREEN
Current Plan
Expiry
Renew
Usage Metrics
REQUEST 3D MODEL SCREEN
Menu Item
Reference Images
Notes
Submit Request
CUSTOMER EXPERIENCE
Purpose:
Premium AR Food Ordering
Mobile First
CUSTOMER FLOW
Scan QR
↓
Menu
↓
Food Detail
↓
3D Viewer
↓
Add To Cart
↓
Checkout
↓
OTP Verification
↓
Place Order
↓
Order Success
QR LANDING SCREEN
Restaurant Branding
Hero Food
Categories
Featured Items
Sticky Cart
MENU SCREEN
Category Chips
Food Cards
Search
Offers
Modern Mobile UX
FOOD DETAIL SCREEN
Large Image
Description
Price
Quantity Selector
View 3D
Add To Cart
3D VIEWER SCREEN
React Three Fiber
Requirements:
Rotate
Zoom
Lighting
Realistic Shadows
Loading Progress
Smooth Transitions
No gimmicks
Premium feel
CART SCREEN
Cart Items
Quantity Controls
Price Summary
Checkout CTA
Sticky Footer
CHECKOUT SCREEN
Phone Number
Order Summary
Table Number
Terms
Continue
OTP SCREEN
OTP Input
Auto Focus
Resend OTP
Verification Animation
ORDER SUCCESS SCREEN
Success Animation
Order Number
Estimated Time
Track Order CTA
MOTION GUIDELINES
Use Framer Motion
Required:
Page Transitions
Sidebar Animation
Card Hover
Micro Interactions
Loading Skeletons
Staggered Reveals
Smooth State Changes
Avoid:
Over-animation
Bouncy Motion
Distracting Effects
COMPONENT INVENTORY
Buttons
Inputs
Cards
Tables
Charts
Dialogs
Drawers
Dropdowns
Accordions
Badges
Sidebar
Navbar
Pagination
Upload Components
QR Components
Analytics Cards
Order Timeline
Status Tracker
3D Viewer Wrapper
Empty States
Error States
Loading States
Skeletons
UX RULES
Reduce clicks.
Never hide important actions.
Prioritize clarity.
Every screen must answer:
What happened?
What can I do next?
What is most important?
FINAL CHECK
Before generating any screen:
Would this look like a premium funded startup?
Would this impress a senior frontend engineer?
Would this look at home beside Linear and Stripe?
Would a restaurant owner trust this platform?
If not, redesign before implementation.

also provide dark and light mode functionality ok