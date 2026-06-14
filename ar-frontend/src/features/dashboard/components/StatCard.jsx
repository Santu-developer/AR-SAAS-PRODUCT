import { motion } from "framer-motion";
import { cn } from "../../../shared/lib/utils";

export default function StatCard({ title, value, icon: Icon, trend, accent = "primary", delay = 0 }) {
  const accentClasses = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-500",
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
    rose: "bg-rose-500/10 text-rose-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30",
        accentClasses[accent]
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</h3>
        </div>
        <div className={cn("rounded-full p-3", accentClasses[accent])}>
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{trend}</p>
    </motion.div>
  );
}