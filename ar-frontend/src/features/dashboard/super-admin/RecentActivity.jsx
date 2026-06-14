import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/lib/axios";
import { motion } from "framer-motion";

export default function RecentActivity() {
  // Fetch auth user data
  const { data: authUser, isLoading: loadingAuth, isError: errorAuth } = useQuery({
    queryKey: ["authMe"],
    queryFn: () => apiClient.get("/api/v1/auth/me").then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch current subscription data
  const { data: currentSub } = useQuery({
    queryKey: ["currentSub"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/current").then((res) => res.data.data),
  });

  // Fetch analytics summary
  const { data: analyticsSummary } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => apiClient.get("/api/v1/analytics/summary").then((res) => res.data.data),
  });

  // Build synthetic activity items
  const items = [];

  // 1. Admin login event (using current timestamp)
  if (!loadingAuth && !errorAuth && authUser?.name) {
    items.push({
      title: "Admin logged in",
      subtitle: `Welcome, ${authUser.name}`,
    });
  }

  // 2. Subscription renewal reminder
  if (currentSub?.renewalDate) {
    const renewDate = new Date(currentSub.renewalDate);
    items.push({
      title: "Subscription renewal scheduled",
      subtitle: renewDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    });
  }

  // 3. QR scan activity
  if (analyticsSummary?.totalScans) {
    items.push({
      title: "QR scans recorded",
      subtitle: `${analyticsSummary.totalScans} total scans`,
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-primary mb-4">Recent Activity</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No recent activity.</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col py-2 first:pt-0 last:pb-0"
            >
              <span className="text-sm text-muted-foreground">{new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}</span>
              <p className="font-medium text-primary">{item.title}</p>
              <span className="text-sm text-muted-foreground mt-1">{item.subtitle}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}