import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/lib/axios";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Sparkles, Activity } from "lucide-react";
import { Skeleton } from "../../../shared/components/ui/Skeleton";

export default function DashboardHero() {
  // Fetch current user
  const { data: user, isLoading: userLoading, isError: userError } = useQuery({
    queryKey: ["authMe"],
    queryFn: () => apiClient.get("/api/v1/auth/me").then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  // Simple health check
  const { isLoading: healthLoading, isError: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.get("/api/v1/health").then(() => true),
    retry: false,
  });

  if (userLoading || healthLoading) {
    return (
      <div className="space-y-3 mb-8">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-5 w-96 rounded-lg" />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
        Unable to retrieve admin information.
      </div>
    );
  }

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  let timeGreeting = "Good evening";
  if (hour < 12) timeGreeting = "Good morning";
  else if (hour < 17) timeGreeting = "Good afternoon";

  const greeting = `${timeGreeting}, ${user?.name ?? "Admin"}`;
  const healthStatus = healthError ? "Some services may be degraded" : "All systems operational";
  const healthColor = healthError ? "text-amber-400" : "text-emerald-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your platform today.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex items-center gap-2 mt-2"
      >
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${healthColor} ${healthError ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
          <Activity size={12} />
          <span>{healthStatus}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
