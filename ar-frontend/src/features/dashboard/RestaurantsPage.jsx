// ─── src/features/dashboard/RestaurantsPage.jsx ───────────────────────────
// Premium Restaurants Page – Full API Integration + Premium UI
// 3D CSS background + glassmorphism stats + tilt-effect cards
// ────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Store,
  MapPin,
  Phone,
  Utensils,
  MoreHorizontal,
  Edit3,
  Trash2,
  Power,
  PowerOff,
  Filter,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  X,
  ChefHat,
  Star,
  ArrowRight,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Table2,
  QrCode,
} from "lucide-react";
import apiClient from "../../shared/lib/axios";
import { Button } from "../../shared/components/ui/Button";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { cn } from "../../shared/lib/utils";

import Dashboard3DScene from "../../shared/components/common/Dashboard3DScene";
import ErrorBoundary from "../../shared/components/common/ErrorBoundary";

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      delay: 0.1 + i * 0.08,
    },
  }),
};

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "" }) {
  const [displayed, setDisplayed] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    prevValue.current = end;
    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayed}{suffix}</>;
}

// ─── Stats Card Component ────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, accent = "purple", index = 0 }) {
  const accentMap = {
    purple: "from-primary/20 via-primary/10 to-transparent border-primary/20",
    emerald: "from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/20",
    blue: "from-blue-500/20 via-blue-500/10 to-transparent border-blue-500/20",
    amber: "from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/20",
  };

  const iconAccent = {
    purple: "bg-primary/15 text-primary shadow-primary/10",
    emerald: "bg-emerald-500/15 text-emerald-400 shadow-emerald-500/10",
    blue: "bg-blue-500/15 text-blue-400 shadow-blue-500/10",
    amber: "bg-amber-500/15 text-amber-400 shadow-amber-500/10",
  };

  const glowColors = {
    purple: "bg-primary/20",
    emerald: "bg-emerald-500/20",
    blue: "bg-blue-500/20",
    amber: "bg-amber-500/20",
  };

  return (
    <motion.div
      custom={index}
      variants={statVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 backdrop-blur-sm transition-all duration-500 hover:shadow-xl",
        accentMap[accent],
        "hover:border-opacity-50"
      )}
    >
      {/* Hover glow effect */}
      <div className={cn(
        "absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40",
        glowColors[accent]
      )} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground/80 tracking-wide uppercase">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            <AnimatedCounter value={value} />
          </p>
          {trend && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                <TrendingUp size={10} className="text-emerald-400" />
              </span>
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-3 backdrop-blur-sm shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            iconAccent[accent]
          )}
        >
          <Icon size={22} />
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.03] blur-3xl transition-all duration-500 group-hover:scale-150" />
      <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/[0.02] blur-2xl" />
    </motion.div>
  );
}

// ─── Restaurant Card Component ───────────────────────────────────────────────
// ─── Grid View Card Component ────────────────────────────────────────────────
function RestaurantGridCard({ restaurant, onEdit, onToggleActive, onDelete }) {
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    setTiltY((mouseX / rect.width) * 8);
    setTiltX((-mouseY / rect.height) * 8);
  };

  const handleMouseLeave = () => {
    setTiltX(0);
    setTiltY(0);
  };

  const cuisineColors = {
    italian: "from-red-500/20 via-orange-500/10 to-transparent",
    indian: "from-orange-500/20 via-amber-500/10 to-transparent",
    chinese: "from-red-600/20 via-rose-500/10 to-transparent",
    mexican: "from-green-500/20 via-emerald-500/10 to-transparent",
    japanese: "from-red-500/20 via-rose-500/10 to-transparent",
    american: "from-blue-500/20 via-indigo-500/10 to-transparent",
    french: "from-blue-500/20 via-cyan-500/10 to-transparent",
    mediterranean: "from-teal-500/20 via-cyan-500/10 to-transparent",
  };

  const getCuisineGradient = (cuisine) => {
    if (!cuisine) return "from-primary/20 via-primary/10 to-transparent";
    const key = Object.keys(cuisineColors).find((k) =>
      cuisine.toLowerCase().includes(k)
    );
    return cuisineColors[key] || "from-primary/20 via-primary/10 to-transparent";
  };

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="group perspective-1000"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: tiltX, rotateY: tiltY }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Cover Area */}
        <div className={cn(
          "relative h-28 bg-gradient-to-br",
          getCuisineGradient(restaurant.cuisineType)
        )}>
          <div className="absolute inset-0 bg-grid-white/5" />
          <div className="absolute inset-0 flex items-center justify-center">
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-14 w-14 rounded-xl object-cover shadow-lg ring-2 ring-white/10"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black/20 backdrop-blur-sm shadow-lg ring-1 ring-white/10">
                <Store size={24} className="text-white/70" />
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm shadow-sm",
              restaurant.isActive
                ? "bg-emerald-500/70 text-white"
                : "bg-muted/70 text-muted-foreground"
            )}>
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                restaurant.isActive ? "bg-white animate-pulse" : "bg-muted-foreground"
              )} />
              {restaurant.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {restaurant.name}
              </h3>
              {restaurant.cuisineType && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  <ChefHat size={10} className="inline mr-1" />
                  {restaurant.cuisineType}
                </p>
              )}
            </div>
          </div>

          {restaurant.address && (
            <p className="mt-2 text-xs text-muted-foreground/60 line-clamp-2">
              <MapPin size={10} className="inline mr-1" />
              {restaurant.address}
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(restaurant.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground/60 hover:bg-primary/10 hover:text-primary transition-all"
                title="Edit"
              >
                <Edit3 size={13} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onToggleActive(restaurant)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  restaurant.isActive
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-muted/30 text-muted-foreground/60 hover:bg-amber-500/10 hover:text-amber-400"
                )}
                title={restaurant.isActive ? "Deactivate" : "Activate"}
              >
                {restaurant.isActive ? <Power size={13} /> : <PowerOff size={13} />}
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(restaurant)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
              title="Delete"
            >
              <Trash2 size={13} />
            </motion.button>
          </div>
        </div>

        {/* Hover glow */}
        <div className={cn(
          "absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-30 pointer-events-none",
          restaurant.isActive ? "bg-emerald-500/15" : "bg-muted-foreground/10"
        )} />
      </motion.div>
    </motion.div>
  );
}

// ─── List View Card Component ────────────────────────────────────────────────
function RestaurantCard({ restaurant, onEdit, onToggleActive, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const cardRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    setTiltY((mouseX / rect.width) * 6);
    setTiltX((-mouseY / rect.height) * 6);
  };

  const handleMouseLeave = () => {
    setTiltX(0);
    setTiltY(0);
  };

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="group perspective-1000"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: tiltX, rotateY: tiltY }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glass shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        {/* Active status indicator */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-1 transition-all duration-300",
            restaurant.isActive
              ? "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/30"
              : "bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10"
          )}
        />

        {/* Hover glow */}
        <div className={cn(
          "absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-30",
          restaurant.isActive ? "bg-emerald-500/20" : "bg-muted-foreground/10"
        )} />

        <div className="relative z-10 flex items-center gap-4 p-5 pl-6">
          {/* Restaurant Logo/Avatar with 3D effect */}
          <motion.div
            whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-lg transition-all duration-300",
              restaurant.logoUrl
                ? "overflow-hidden"
                : "bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary ring-1 ring-primary/10"
            )}
          >
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Store size={24} />
            )}
            {/* Online indicator dot */}
            <motion.div
              animate={restaurant.isActive ? {
                scale: [1, 1.3, 1],
                opacity: [1, 0.8, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card shadow-sm",
                restaurant.isActive ? "bg-emerald-400" : "bg-muted-foreground/30"
              )}
            />
          </motion.div>

          {/* Restaurant Info */}
          <div className="min-w-0 flex-1" style={{ transform: "translateZ(20px)" }}>
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">
                {restaurant.name}
              </h3>
              {!restaurant.isActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                  <PowerOff size={10} />
                  Inactive
                </span>
              )}
              {restaurant.isActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {restaurant.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="flex-shrink-0 text-muted-foreground/50" />
                  <span className="truncate max-w-[180px]">{restaurant.address}</span>
                </span>
              )}
              {restaurant.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={12} className="flex-shrink-0 text-muted-foreground/50" />
                  {restaurant.phone}
                </span>
              )}
              {restaurant.cuisineType && (
                <span className="flex items-center gap-1.5">
                  <ChefHat size={12} className="flex-shrink-0 text-muted-foreground/50" />
                  {restaurant.cuisineType}
                </span>
              )}
            </div>
          </div>            {/* Action Buttons */}
          <div className="flex items-center gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2" style={{ transform: "translateZ(30px)" }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(restaurant.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground/70 transition-all hover:bg-primary/10 hover:text-primary hover:shadow-sm"
              title="Edit Restaurant"
            >
              <Edit3 size={15} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleActive(restaurant)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                restaurant.isActive
                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-sm hover:shadow-emerald-500/10"
                  : "bg-muted/50 text-muted-foreground/70 hover:bg-amber-500/10 hover:text-amber-400 hover:shadow-sm"
              )}
              title={restaurant.isActive ? "Deactivate" : "Activate"}
            >
              {restaurant.isActive ? <Power size={15} /> : <PowerOff size={15} />}
            </motion.button>

            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground/70 transition-all hover:bg-muted/80 hover:text-foreground"
                aria-label="More options"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal size={15} />
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-card/95 shadow-xl shadow-black/20 backdrop-blur-xl"
                  >
                    <button
                      onClick={() => {
                        onEdit(restaurant.id);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-primary/5"
                    >
                      <Edit3 size={14} className="text-muted-foreground" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-primary/5"
                    >
                      <Table2 size={14} className="text-muted-foreground" />
                      Manage Tables
                    </button>
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-primary/5"
                    >
                      <QrCode size={14} className="text-muted-foreground" />
                      View QR Codes
                    </button>
                    <div className="mx-3 my-1 h-px bg-border/50" />
                    <button
                      onClick={() => {
                        onDelete(restaurant);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                      Delete Restaurant
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Empty State Component ───────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-24 px-8 backdrop-blur-sm"
    >
      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-64 w-64 rounded-full border border-primary/5" />
        <div className="h-48 w-48 rounded-full border border-primary/10 absolute" />
        <div className="h-32 w-32 rounded-full border border-primary/15 absolute" />
      </div>

      {/* Animated Icon */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 3, -3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative mb-8"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg shadow-primary/5">
          <Store size={42} className="text-primary" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl"
        />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-3 text-2xl font-bold text-foreground"
      >
        No restaurants yet
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 max-w-md text-center text-muted-foreground/80 leading-relaxed"
      >
        Get started by creating your first restaurant. Add menus, tables,
        and enable immersive AR experiences for your customers.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button
          onClick={onAdd}
          className="gap-2.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
        >
          <Plus size={18} />
          Create Your First Restaurant
          <ArrowRight size={14} />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Skeleton Loading ────────────────────────────────────────────────────────
function RestaurantsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="space-y-3">
              <div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" />
              <div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-72 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-11 w-24 rounded-xl bg-white/5 animate-pulse" />
        <div className="ml-auto flex gap-2">
          <div className="h-11 w-20 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-11 w-36 rounded-xl bg-white/5 animate-pulse" />
        </div>
      </div>

      {/* List skeleton */}
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-4 w-72 rounded-lg bg-white/5 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ─── Delete Confirmation ──────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─── Fetch restaurants ────────────────────────────────────────────────
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () =>
      apiClient.get("/api/v1/restaurants").then((res) => res.data.data),
    retry: 1,
  });

  // ─── Delete mutation ──────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      apiClient.delete(`/api/v1/restaurants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant deleted successfully");
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete restaurant");
    },
  });

  // ─── Toggle active status mutation ────────────────────────────────────
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      apiClient.post(
        `/api/v1/restaurants/${id}/${isActive ? "deactivate" : "activate"}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  // ─── Filter and search restaurants ────────────────────────────────────
  const filteredRestaurants = useMemo(() => {
    const restaurants = Array.isArray(data) ? data : (data?.content || []);
    return restaurants.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisineType?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && r.isActive) ||
        (filterStatus === "inactive" && !r.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, filterStatus]);

  // ─── Calculate stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const restaurants = Array.isArray(data) ? data : (data?.content || []);
    return {
      total: Array.isArray(data) ? data.length : (data?.totalElements || restaurants.length),
      active: restaurants.filter((r) => r.isActive).length,
      inactive: restaurants.filter((r) => !r.isActive).length,
      totalPages: data?.totalPages || 1,
    };
  }, [data]);

  const handleEdit = (id) => {
    navigate(`/dashboard/restaurants/${id}/edit`);
  };

  const handleToggleActive = (restaurant) => {
    toggleActiveMutation.mutate({
      id: restaurant.id,
      isActive: restaurant.isActive,
    });
  };

  const handleDelete = (restaurant) => {
    setDeleteTarget(restaurant);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  if (isLoading) {
    return <RestaurantsSkeleton />;
  }

  return (
    <div className="relative min-h-full">
      {/* ─── 3D Particle Background ──────────────────────────────────── */}
      <ErrorBoundary>
        <Dashboard3DScene />
      </ErrorBoundary>

      {/* ─── Floating Orbs ───────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/8 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 40, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-500/8 blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, 40, -10, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-10 h-48 w-48 rounded-full bg-emerald-500/6 blur-[100px]"
        />
      </div>

      {/* ─── Content (z-index above background) ──────────────────────── */}
      <div className="relative z-10 space-y-6">
        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Failed to load restaurants</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {error?.response?.data?.message || "Backend server is not responding. Showing empty state."}
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ─── Hero Section ─────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 backdrop-blur-sm"
          >
            {/* Animated gradient overlay */}
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10"
            />

            <div className="relative z-10 flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg"
              >
                <Store size={24} className="text-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Restaurants
                </h1>
                <p className="text-sm text-muted-foreground/80">
                  Manage your restaurant locations, menus, and settings
                </p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {stats.active} active
                </motion.div>
                <motion.div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <Store size={12} />
                  {stats.total} total
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ─── Stats Grid ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Store}
              label="Total Restaurants"
              value={stats.total}
              trend={`${stats.active} currently active`}
              accent="purple"
              index={0}
            />
            <StatCard
              icon={Power}
              label="Active"
              value={stats.active}
              trend={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`}
              accent="emerald"
              index={1}
            />
            <StatCard
              icon={PowerOff}
              label="Inactive"
              value={stats.inactive}
              accent="amber"
              index={2}
            />
            <StatCard
              icon={Star}
              label="Recently Added"
              value={Math.min(stats.total, 3)}
              trend="This month"
              accent="blue"
              index={3}
            />
          </div>

          {/* ─── Toolbar ──────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors duration-300 peer-focus:text-primary"
                />
                <input
                  type="text"
                  placeholder="Search by name, address, cuisine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-card/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm transition-all duration-300 focus:border-primary/40 focus:bg-primary/[0.03] focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-all duration-300",
                  showFilters || filterStatus !== "all"
                    ? "border-primary/30 bg-primary/10 text-primary shadow-sm shadow-primary/5"
                    : "border-white/10 bg-card/50 text-muted-foreground hover:bg-card/80 backdrop-blur-sm"
                )}
              >
                <Filter size={14} />
                Filters
                {filterStatus !== "all" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    1
                  </span>
                )}
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-white/10 bg-card/50 p-1 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutList size={14} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid size={14} />
                </button>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => navigate("/dashboard/restaurants/new")}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                >
                  <Plus size={16} />
                  Add Restaurant
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* ─── Filter Panel ──────────────────────────────────────────── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-card/50 p-4 backdrop-blur-sm"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    Status:
                  </span>
                  {["all", "active", "inactive"].map((status) => (
                    <motion.button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "rounded-lg px-3.5 py-1.5 text-sm font-medium capitalize transition-all duration-200",
                        filterStatus === status
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                      )}
                    >
                      {status}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Restaurant List / Grid ────────────────────────────────── */}
          {filteredRestaurants.length === 0 && !isLoading ? (
            <EmptyState onAdd={() => navigate("/dashboard/restaurants/new")} />
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    : "space-y-3"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {filteredRestaurants.map((restaurant) => (
                    viewMode === "grid" ? (
                      <RestaurantGridCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onEdit={handleEdit}
                        onToggleActive={handleToggleActive}
                        onDelete={handleDelete}
                      />
                    ) : (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onEdit={handleEdit}
                        onToggleActive={handleToggleActive}
                        onDelete={handleDelete}
                      />
                    )
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* ─── Results Count ──────────────────────────────────── */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center pt-4"
              >
                <p className="text-sm text-muted-foreground/60">
                  Showing {filteredRestaurants.length} of {stats.total} restaurant
                  {stats.total !== 1 ? "s" : ""}
                  {isFetching && (
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-2 text-xs text-primary/60"
                    >
                      <RefreshCw size={12} className="inline animate-spin" />
                      {" "}syncing...
                    </motion.span>
                  )}
                </p>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>



      {/* ─── Delete Confirmation Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-4 z-50 flex items-center justify-center p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-confirm-title"
            >
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/10"
                    >
                      <AlertTriangle size={28} className="text-red-400" />
                    </motion.div>
                    <div>
                      <h3 id="delete-confirm-title" className="text-lg font-semibold text-foreground">
                        Delete Restaurant
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                        <Store size={18} className="text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {deleteTarget.name}
                        </p>
                        {deleteTarget.address && (
                          <p className="text-xs text-muted-foreground">
                            {deleteTarget.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    This will permanently delete the restaurant, its menu items,
                    tables, QR codes, and all associated data. This action
                    cannot be reversed.
                  </p>

                  <div className="flex items-center justify-end gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeleteTarget(null)}
                        disabled={deleteMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={confirmDelete}
                        disabled={deleteMutation.isPending}
                        className="gap-2 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                      >
                        {deleteMutation.isPending ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Delete Restaurant
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
