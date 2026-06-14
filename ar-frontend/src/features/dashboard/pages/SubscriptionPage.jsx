// ─── src/features/dashboard/pages/SubscriptionPage.jsx ───────────────────────────────
// Premium Subscription & Billing – Full API Integration
// Current plan display + Plan cards/pricing + Payment history
// ──────────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Check,
  X,
  Zap,
  Crown,
  Star,
  Sparkles,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Receipt,
  Shield,
  Infinity,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 25, delay: 0.1 + i * 0.1 },
  }),
};

// ─── Floating Orbs ───────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)" }} />
      <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "TRIAL", name: "Trial", price: 0, period: "forever (limited)",
    icon: Star, description: "Get started with basic features",
    features: ["1 restaurant", "5 tables per restaurant", "20 menu items", "Basic QR codes"],
    disabled: ["AR models", "Advanced analytics", "Priority support", "Multiple users"],
    color: "slate", popular: false,
  },
  {
    id: "STARTER", name: "Starter", price: 29, period: "per month",
    icon: Sparkles, description: "For growing restaurants",
    features: ["3 restaurants", "15 tables per restaurant", "100 menu items", "AR models support", "Basic analytics", "Email support"],
    disabled: ["Priority support", "Advanced analytics"],
    color: "primary", popular: true,
  },
  {
    id: "GROWTH", name: "Growth", price: 79, period: "per month",
    icon: Zap, description: "For established businesses",
    features: ["10 restaurants", "50 tables per restaurant", "500 menu items", "AR models support", "Advanced analytics", "Priority support", "Team access (3 users)"],
    disabled: [],
    color: "violet", popular: false,
  },
  {
    id: "ENTERPRISE", name: "Enterprise", price: 199, period: "per month",
    icon: Crown, description: "For large-scale operations",
    features: ["Unlimited restaurants", "Unlimited tables", "Unlimited menu items", "AR models support", "Advanced analytics + API", "Dedicated support", "Unlimited team members", "Custom integrations"],
    disabled: [],
    color: "amber", popular: false,
  },
];

const colorMap = {
  slate: { border: "border-slate-500/30", bg: "from-slate-500/10 to-slate-500/5", text: "text-slate-300", icon: "text-slate-300", btn: "bg-slate-500/20 text-slate-300 hover:bg-slate-500/30", popular: "bg-slate-500/10 text-slate-300" },
  primary: { border: "border-primary/40", bg: "from-primary/20 to-primary/5", text: "text-primary", icon: "text-primary", btn: "bg-primary text-primary-foreground hover:bg-primary/90", popular: "bg-primary text-primary-foreground" },
  violet: { border: "border-violet-500/30", bg: "from-violet-500/10 to-violet-500/5", text: "text-violet-400", icon: "text-violet-400", btn: "bg-violet-500 text-white hover:bg-violet-600", popular: "bg-violet-500/10 text-violet-400" },
  amber: { border: "border-amber-500/30", bg: "from-amber-500/10 to-amber-500/5", text: "text-amber-400", icon: "text-amber-400", btn: "bg-amber-500 text-white hover:bg-amber-600", popular: "bg-amber-500/10 text-amber-400" },
};

function PlanCard({ plan, index, currentPlan, onSelect, isSelected }) {
  const colors = colorMap[plan.color];
  const isCurrent = currentPlan === plan.id;
  const Icon = plan.icon;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-sm p-6 transition-all duration-300",
        isCurrent ? `ring-2 ${colors.border} shadow-lg` : "border-border/60 hover:border-primary/30"
      )}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary px-4 py-1 text-[10px] font-bold text-primary-foreground rounded-bl-xl shadow-lg">Most Popular</div>
        </div>
      )}

      {/* Gradient bg */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", plan.popular ? "from-primary/20 to-transparent" : "from-white/[0.02] to-transparent")} />

      <div className="relative z-10">
        {/* Icon + Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg", plan.popular ? "from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/20" : "from-white/10 to-white/5 ring-1 ring-white/10")}>
            <Icon size={20} className={colors.icon} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
            <p className="text-xs text-muted-foreground">{plan.description}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">${plan.price}</span>
            <span className="text-sm text-muted-foreground">/{plan.period}</span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {plan.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-foreground">{f}</span>
            </div>
          ))}
          {plan.disabled.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <X size={14} className="text-muted-foreground/30 shrink-0" />
              <span className="text-xs text-muted-foreground/40">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={() => onSelect(plan.id)}
          disabled={isCurrent}
          className={cn("w-full gap-2 shadow-lg transition-all", isCurrent ? "bg-muted text-muted-foreground cursor-default" : colors.btn)}
        >
          {isCurrent ? (
            <><Check size={16} /> Current Plan</>
          ) : (
            <><ArrowRight size={16} /> {plan.price === 0 ? "Get Started" : "Upgrade"}</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Payment History Row ──────────────────────────────────────────────────────
function PaymentRow({ payment, index }) {
  const statusStyles = {
    COMPLETED: "bg-emerald-500/10 text-emerald-400",
    SUCCESS: "bg-emerald-500/10 text-emerald-400",
    PENDING: "bg-amber-500/10 text-amber-400",
    FAILED: "bg-red-500/10 text-red-400",
    REFUNDED: "bg-blue-500/10 text-blue-400",
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
    >
      <td className="py-3 px-4 text-xs text-foreground">
        {new Date(payment.paymentDate || payment.createdAt || payment.paidAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </td>
      <td className="py-3 px-4 text-xs font-medium text-foreground capitalize">{payment.plan || "Subscription"}</td>
      <td className="py-3 px-4 text-xs text-right tabular-nums text-foreground font-medium">${Number(payment.amount || 0).toFixed(2)}</td>
      <td className="py-3 px-4 text-right">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", statusStyles[payment.status] || "bg-muted text-muted-foreground")}>
          {payment.status || "UNKNOWN"}
        </span>
      </td>
    </motion.tr>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" /></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />)}</div>
    </div>
  );
}

// ─── Main SubscriptionPage ────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── Fetch current subscription ──────────────────────────────────────
  const { data: currentSub, isLoading: loadingSub, error: subError } = useQuery({
    queryKey: ["subscriptionCurrent"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/current").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  // ─── Fetch payment history ───────────────────────────────────────────
  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ["paymentsHistory"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/payments/history").then((r) => r.data.data),
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

  const payments = useMemo(() => {
    const items = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.content || []);
    return items.sort((a, b) => new Date(b.paymentDate || b.createdAt || b.paidAt) - new Date(a.paymentDate || a.createdAt || a.paidAt));
  }, [paymentsData]);

  // ─── Current plan state ──────────────────────────────────────────────
  const currentPlanId = currentSub?.plan || currentSub?.planName || "TRIAL";

  // ─── Plan selection handler ──────────────────────────────────────────
  const handleSelectPlan = async (planId) => {
    if (planId === currentPlanId) return;
    setSelectedPlan(planId);

    if (planId === "TRIAL") {
      toast("You are already on the Trial plan or higher");
      setSelectedPlan(null);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await apiClient.post("/api/v1/subscriptions/create-session", { plan: planId });
      const { orderId, keyId, amount, razorpayKey } = res.data.data || res.data;

      toast.success("Redirecting to checkout...");
      // Here you would integrate Razorpay/Stripe checkout
      // For now, simulate a successful redirect
      if (res.data.data?.url) {
        window.open(res.data.data.url, "_blank");
      } else {
        toast.success(`Checkout session created for ${planId} plan ($${PLANS.find(p => p.id === planId)?.price || 0}/mo)`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create checkout session");
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  // ─── Subscription status ─────────────────────────────────────────────
  const subStatus = currentSub?.status || "ACTIVE";
  const subEndDate = currentSub?.currentPeriodEnd || currentSub?.renewalDate;

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loadingSub) return <><FloatingOrbs /><SubscriptionSkeleton /></>;

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10 space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* ─── Hero ────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-primary/10" />
            <div className="relative z-10 flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05, rotate: 3 }} className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 via-emerald-500/10 to-transparent ring-1 ring-emerald-500/20 shadow-lg">
                <CreditCard size={24} className="text-emerald-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscription & Billing</h1>
                <p className="text-sm text-muted-foreground/80">Manage your plan and payment history</p>
              </div>
            </div>
          </motion.div>

          {/* ─── Current Plan Bar ─────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                  currentPlanId === "TRIAL" ? "from-slate-500/30 to-slate-500/10 ring-1 ring-slate-500/20" :
                  currentPlanId === "STARTER" ? "from-primary/30 to-primary/10 ring-1 ring-primary/20" :
                  currentPlanId === "GROWTH" ? "from-violet-500/30 to-violet-500/10 ring-1 ring-violet-500/20" :
                  "from-amber-500/30 to-amber-500/10 ring-1 ring-amber-500/20"
                )}>
                  {currentPlanId === "TRIAL" ? <Star size={24} className="text-slate-300" /> :
                   currentPlanId === "STARTER" ? <Sparkles size={24} className="text-primary" /> :
                   currentPlanId === "GROWTH" ? <Zap size={24} className="text-violet-400" /> :
                   <Crown size={24} className="text-amber-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{currentPlanId} Plan</h2>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                      subStatus === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    )}>
                      <div className={cn("h-1.5 w-1.5 rounded-full", subStatus === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
                      {subStatus}
                    </span>
                  </div>
                  {subEndDate && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      Current period ends {new Date(subEndDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  ${PLANS.find(p => p.id === currentPlanId)?.price || 0}/{PLANS.find(p => p.id === currentPlanId)?.period || "mo"}
                </span>
                {currentPlanId !== "ENTERPRISE" && (
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <HelpCircle size={14} />Need More?
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ─── Error Banner ─────────────────────────────────────────── */}
          {subError && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">Could not load subscription details. Showing available plans.</p>
              </div>
            </motion.div>
          )}

          {/* ─── Plan Cards ───────────────────────────────────────────── */}
          <div>
            <motion.h2 variants={itemVariants} className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              Choose Your Plan
              <span className="text-xs font-normal text-muted-foreground ml-2">Upgrade anytime to unlock more features</span>
            </motion.h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan, idx) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={idx}
                  currentPlan={currentPlanId}
                  onSelect={handleSelectPlan}
                  isSelected={selectedPlan === plan.id}
                />
              ))}
            </div>
          </div>

          {/* ─── Payment History ───────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Receipt size={14} className="text-primary" />Payment History
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">All your subscription payments</p>
              </div>
            </div>

            {loadingPayments ? (
              <div className="space-y-3">{[0,1,2].map(i => <div key={i} className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt size={32} className="text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No payments yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Payment history will appear after your first subscription</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Plan</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, idx) => (
                      <PaymentRow key={p.id || idx} payment={p} index={idx} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {payments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total payments</span>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  ${payments.reduce((s, p) => s + Number(p.amount || 0), 0).toLocaleString()}
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
