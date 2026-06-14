// ─── src/app/router.jsx ──────────────────────────────────────────────────────────────

import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import PrivateRoute from "../shared/components/layout/PrivateRoute";
import DashboardLayout from "../features/dashboard/DashboardLayout";
import PageLoader from "../shared/components/common/PageLoader";

// Auth pages
const LoginForm = lazy(() => import("../features/auth/components/LoginForm"));
const RegisterForm = lazy(() => import("../features/auth/components/RegisterForm"));
const ForgotPasswordForm = lazy(() => import("../features/auth/components/ForgotPasswordForm"));
const ResetPasswordForm = lazy(() => import("../features/auth/components/ResetPasswordForm"));
const ForbiddenPage = lazy(() => import("../features/auth/components/ForbiddenPage"));

// Dashboard pages (Restaurant Owner / Manager)
const DashboardHome = lazy(() => import("../features/dashboard/DashboardHome"));
const RestaurantsPage = lazy(() => import("../features/dashboard/RestaurantsPage"));
const EditRestaurantPage = lazy(() => import("../features/dashboard/EditRestaurantPage"));
const NewRestaurantPage = lazy(() => import("../features/dashboard/NewRestaurantPage"));
const RestaurantOnboardingPage = lazy(() => import("../features/dashboard/RestaurantOnboardingPage"));
const MenusPage = lazy(() => import("../features/dashboard/pages/MenusPage"));
const TablesPage = lazy(() => import("../features/dashboard/pages/TablesPage"));
const OrdersPage = lazy(() => import("../features/dashboard/pages/OrdersPage"));
const AnalyticsPage = lazy(() => import("../features/dashboard/pages/AnalyticsPage"));
const StaffPage = lazy(() => import("../features/dashboard/pages/StaffPage"));
const SubscriptionPage = lazy(() => import("../features/dashboard/pages/SubscriptionPage"));
const SupportPage = lazy(() => import("../features/dashboard/pages/SupportPage"));
const InvoicesPage = lazy(() => import("../features/dashboard/pages/InvoicesPage"));
const SettingsPage = lazy(() => import("../features/dashboard/pages/SettingsPage"));

// Super Admin pages
const SuperAdminDashboard = lazy(() => import("../features/dashboard/super-admin/SuperAdminDashboard"));
const AdminRestaurantsPage = lazy(() => import("../features/dashboard/super-admin/AdminRestaurantsPage"));
const AdminPlansPage = lazy(() => import("../features/dashboard/super-admin/AdminPlansPage"));
const AdminSubscriptionsPage = lazy(() => import("../features/dashboard/super-admin/AdminSubscriptionsPage"));
const AdminSupportTicketsPage = lazy(() => import("../features/dashboard/super-admin/AdminSupportTicketsPage"));
const AdminAuditLogsPage = lazy(() => import("../features/dashboard/super-admin/AdminAuditLogs"));
const AdminAnalyticsPage = lazy(() => import("../features/dashboard/super-admin/AdminAnalyticsPage"));

// AR Public (Customer-facing)
const ARMenuView = lazy(() => import("../features/ar/ARMenuView"));

export const router = createBrowserRouter([
  // Public auth routes
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginForm />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterForm />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPasswordForm />
      </Suspense>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordForm />
      </Suspense>
    ),
  },
  {
    path: "/403",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForbiddenPage />
      </Suspense>
    ),
  },
  // Public AR Menu (Customer QR scan)
  {
    path: "/ar/:tableId",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ARMenuView />
      </Suspense>
    ),
  },
  // Protected dashboard routes — all under /dashboard/*
  {
    path: "/dashboard",
    element: <PrivateRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="home" replace /> },
          { path: "home", element: <DashboardHome /> },
          { path: "restaurants", element: <RestaurantsPage /> },
          { path: "restaurants/new", element: <NewRestaurantPage /> },
          { path: "restaurants/:restaurantId/edit", element: <EditRestaurantPage /> },
          { path: "onboarding", element: <RestaurantOnboardingPage /> },
          { path: "menus", element: <MenusPage /> },
          { path: "tables", element: <TablesPage /> },
          { path: "tables/:restaurantId", element: <TablesPage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "staff", element: <StaffPage /> },
          { path: "subscription", element: <SubscriptionPage /> },
          { path: "support", element: <SupportPage /> },
          { path: "invoices", element: <InvoicesPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  // Super Admin routes — /admin/*
  {
    path: "/admin",
    element: <PrivateRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <SuperAdminDashboard /> },
          { path: "restaurants", element: <AdminRestaurantsPage /> },
          { path: "plans", element: <AdminPlansPage /> },
          { path: "subscriptions", element: <AdminSubscriptionsPage /> },
          { path: "support-tickets", element: <AdminSupportTicketsPage /> },
          { path: "audit-logs", element: <AdminAuditLogsPage /> },
          { path: "analytics", element: <AdminAnalyticsPage /> },
        ],
      },
    ],
  },
  // Fallback root redirect
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  // Catch-all redirect
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);

export default router;
