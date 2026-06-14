import { motion } from "framer-motion";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function QrScanChart() {
  // Fetch scan data
  const { data: scanData, isLoading, isError } = useQuery({
    queryKey: ["qrScans"],
    queryFn: () => apiClient.get("/api/v1/analytics/scans").then((res) => res.data.data),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (isError || !scanData) return <p className="text-sm text-muted-foreground">No scan data</p>;

  // Convert scans data to labels (dates) and values (scan counts)
  const labels = scanData?.map((s) => new Date(s.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })) ?? [];
  const values = scanData?.map((s) => s.scans ?? 0) ?? [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "QR Scans",
        data: values,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsla(var(--primary), 0.1)",
        tension: 0.4,
        fill: true,
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
          callback: (v) => `${v} scans`,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <h3 className="text-lg font-semibold text-primary mb-2">QR Scan Activity</h3>
      <div className="h-48">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  );
}