import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/lib/axios";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

export default function TopItemsGrid() {
  const { data: topItems, isLoading, isError } = useQuery({
    queryKey: ["topItems"],
    queryFn: () => apiClient.get("/api/v1/analytics/top-items").then((res) => res.data.data),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !topItems) {
    return <p className="text-sm text-muted-foreground">No popular items yet</p>;
  }

  // Sort by views descending
  const sortedItems = [...topItems].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));

  return (
    <div>
      <h3 className="text-lg font-semibold text-primary mb-4">Top Performing AR Items</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground truncate">{item.name}</h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye size={14} />
                <span>{item.views ?? 0}</span>
              </div>
            </div>
            {item.modelUrl ? (
              <div className="text-xs text-emerald-500">3D Model Available</div>
            ) : (
              <div className="text-xs text-amber-500">No 3D Model</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}