import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 mb-6"
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 -z-10 h-40 w-80 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-3xl" />

      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome to your Restaurant Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your restaurants, menus, and orders all in one place.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex items-center gap-4"
      >
        <Link
          to="/dashboard/restaurants"
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          View Restaurants
          <ChevronRight size={16} />
        </Link>
      </motion.div>
    </motion.div>
  );
}