// ─── src/features/dashboard/components/SubscriptionCard.jsx ───────────────────────

import { Card, CardHeader, CardTitle, CardContent } from '../../shared/components/ui/Card';
import { CreditCard, ArrowUpRight } from 'lucide-react';
import { cn } from '../../shared/lib/utils';
import { motion } from 'framer-motion';

/**
 * Displays current plan information with a call‑to‑action to upgrade.
 * Expects the dashboard API to return a `plan` object:
 *   { name, limits: { restaurants, tables, menuItems }, usage: { restaurants, tables, menuItems } }
 */
export default function SubscriptionCard({ plan }) {
  if (!plan) return null;

  const { name, usage, limits } = plan;
  const progress = (used, max) => Math.min((used / max) * 100, 100);

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Plan – {name}
        </CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(limits).map(([key, max]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-xs">
                <span className="capitalize text-muted-foreground">{key}</span>
                <span className="font-medium text-foreground">
                  {usage[key]} / {max}
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress(usage[key], max)}%` }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors",
            "hover:bg-primary/90"
          )}
        >
          Upgrade Plan <ArrowUpRight size={16} />
        </motion.button>
      </CardContent>
    </Card>
  );
}
