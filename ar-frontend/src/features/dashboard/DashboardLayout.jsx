import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "../../shared/lib/utils";
import { Button } from "../../shared/components/ui/Button";
import {
  Menu, X, Home, Store, Table2, MenuSquare, ShoppingBag, Users,
  BarChart3, Settings, CreditCard, LogOut, Sparkles, ChevronLeft,
  Shield, MessageSquare, FileText, Activity, LayoutDashboard, Receipt,
} from "lucide-react";
import { useAuthStore } from "../auth/store/authStore";
import { ROLES } from "../../shared/constants/roles";

// ─── Owner / Staff Sidebar Items ────────────────────────────────────────────
const ownerSidebarItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard/home" },
  { name: "Restaurants", icon: Store, path: "/dashboard/restaurants", roles: [ROLES.RESTAURANT_OWNER] },
  { name: "Tables", icon: Table2, path: "/dashboard/tables", roles: [ROLES.RESTAURANT_OWNER, ROLES.MANAGER] },
  { name: "Staff", icon: Users, path: "/dashboard/staff", roles: [ROLES.RESTAURANT_OWNER, ROLES.MANAGER] },
  { name: "Menu", icon: MenuSquare, path: "/dashboard/menus", roles: [ROLES.RESTAURANT_OWNER, ROLES.MANAGER, ROLES.STAFF] },
  { name: "Orders", icon: ShoppingBag, path: "/dashboard/orders", roles: [ROLES.RESTAURANT_OWNER, ROLES.MANAGER, ROLES.STAFF] },
  { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics", roles: [ROLES.RESTAURANT_OWNER, ROLES.MANAGER] },
  { name: "Subscription", icon: CreditCard, path: "/dashboard/subscription", roles: [ROLES.RESTAURANT_OWNER] },
  { name: "Invoices", icon: Receipt, path: "/dashboard/invoices", roles: [ROLES.RESTAURANT_OWNER] },
  { name: "Support", icon: MessageSquare, path: "/dashboard/support", roles: [ROLES.RESTAURANT_OWNER] },
  { name: "Settings", icon: Settings, path: "/dashboard/settings", roles: [ROLES.RESTAURANT_OWNER] },
];

// ─── Super Admin Sidebar Items ──────────────────────────────────────────────
const adminSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Restaurants", icon: Store, path: "/admin/restaurants" },
  { name: "Plans", icon: CreditCard, path: "/admin/plans" },
  { name: "Subscriptions", icon: Shield, path: "/admin/subscriptions" },
  { name: "Support", icon: MessageSquare, path: "/admin/support-tickets" },
  { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { name: "Audit Logs", icon: FileText, path: "/admin/audit-logs" },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Determine which sidebar to show based on current route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const activeSidebar = isAdminRoute && user?.role === ROLES.SUPER_ADMIN ? adminSidebarItems : ownerSidebarItems;
  const filteredItems = activeSidebar.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ─── Desktop Sidebar ───────────────────────────────────────────── */}
      <motion.aside
        className="hidden md:flex flex-col bg-card/80 backdrop-blur-xl border-r border-white/5 relative z-30"
        animate={{ width: sidebarOpen ? 256 : 80 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Logo Area */}
        <div className="flex h-16 items-center px-4 border-b border-white/5 relative overflow-hidden">
          <motion.div
            animate={{ opacity: sidebarOpen ? 1 : 0 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-primary/10">
              <Sparkles size={16} className="text-primary" />
            </div>
            <span className="font-bold text-sm text-foreground tracking-tight">
              AR Smart Menu
            </span>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ChevronLeft size={14} />
            </motion.div>
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path}>
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-sm shadow-primary/5"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                    isActive ? "bg-primary/10" : ""
                  )}>
                    <item.icon size={16} />
                  </div>
                  <motion.span
                    animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? "auto" : 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Area */}
        <div className="p-3 border-t border-white/5">
          <motion.div
            animate={{ justifyContent: sidebarOpen ? "flex-start" : "center" }}
            className="flex items-center gap-3 px-2 py-2"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20"
            >
              {user?.name?.charAt(0) || "U"}
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-full ring-1 ring-primary/20 animate-pulse-glow" />
            </motion.div>
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? "auto" : 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-medium text-foreground truncate max-w-[130px]">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-[130px]">
                {user?.email || ""}
              </p>
            </motion.div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            <motion.span
              animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? "auto" : 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              Sign Out
            </motion.span>
          </motion.button>
        </div>
      </motion.aside>

      {/* ─── Mobile Sidebar ────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              className="relative w-72 h-full bg-card/95 backdrop-blur-xl border-r border-white/5 flex flex-col"
            >
              <div className="flex h-16 items-center px-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/30 to-primary/10">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <span className="font-bold text-sm">AR Smart Menu</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setMobileOpen(false)}>
                  <X size={18} />
                </Button>
              </div>
              <nav className="flex-1 py-4 space-y-1 px-2">
                {filteredItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.name} to={item.path}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      )}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                          <item.icon size={16} />
                        </div>
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-white/5">
                <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-white/5 flex items-center px-4 md:px-6 relative z-20">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </Button>
          <h1 className="text-lg font-semibold text-foreground flex-1">
            {filteredItems.find((i) => i.path === location.pathname)?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary/30 to-transparent opacity-50 blur-sm" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
