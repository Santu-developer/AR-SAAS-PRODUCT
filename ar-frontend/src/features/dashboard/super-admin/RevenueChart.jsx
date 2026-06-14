import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../shared/lib/axios";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function RevenueChart() {
  const { data: payments, isLoading, isError } = useQuery({
    queryKey: ["payments-history"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/payments/history").then((res) => res.data.data),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (isError || !payments) return <p className="text-sm text-muted-foreground">No revenue data</p>;

  // Aggregate payments into monthly totals
  const monthly = {};
  (payments || []).forEach((p) => {
    const month = new Date(p.paymentDate).toLocaleString("default", { month: "short" });
    monthly[month] = (monthly[month] || 0) + (p.amount || 0);
  });
  const labels = Object.keys(monthly);
  const values = Object.values(monthly);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: values,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsla(var(--primary), 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "hsl(var(--card))",
        titleColor: "hsl(var(--foreground))",
        bodyColor: "hsl(var(--muted-foreground))",
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "hsl(var(--muted-foreground))" } },
      y: {
        grid: { color: "hsla(var(--border), 0.2)" },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          callback: (v) => `$${v}`,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
        <select className="rounded border border-border bg-card px-2 py-1 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary">
          <option>This Year</option>
        </select>
      </div>
      <div className="h-48">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  );
}