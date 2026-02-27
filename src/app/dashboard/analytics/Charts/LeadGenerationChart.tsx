import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const options: any = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: "#eceff1",
        drawBorder: true,
        borderColor: "#222",
        borderWidth: 2,
        lineWidth: 1,
      },
      ticks: { font: { size: 20 }, color: "#222" },
    },
    y: {
      grid: {
        color: "#ddd",
        lineWidth: 2,
        borderDash: [6, 6],
      },
      ticks: { stepSize: 8, font: { size: 20 }, color: "#222" },
      min: 0,
      max: 32,
    },
  },
};

type Props = {
  period?: "week" | "month";
};

export default function LeadGenerationChart({ period = "month" }: Props) {
  const [chartData, setChartData] = useState<any>({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: "#4285f4" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/v0/analytics/lead-generation?period=${period}`,
          { credentials: "same-origin" },
        );
        const json = await res.json();
        if (cancelled) return;
        if (!json || !json.success) {
          setError(json?.error || "Failed to load");
          return;
        }
        setChartData({
          labels: json.labels,
          datasets: [{ data: json.data, backgroundColor: "#4285f4" }],
        });
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    // refresh on focus/visibility
    const onFocus = () => {
      load();
    };
    const onVis = () => {
      if (!document.hidden) load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    const id = setInterval(() => load(), 20000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(id);
    };
  }, [period]);

  // Use MUI Box for the main container
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Box = require("@mui/material/Box").default;
  return (
    <Box className="bg-white rounded-2xl  px-7 pt-8 pb-4 max-w-[850px]">
      <Box className="flex justify-between items-center mb-3">
        <Box className="font-semibold text-[#222]">
          {loading ? "Loading..." : error ? "Error loading data" : ""}
        </Box>
      </Box>
      <Box className="h-[330px]">
        <Bar data={chartData} options={options} />
      </Box>
    </Box>
  );
}
