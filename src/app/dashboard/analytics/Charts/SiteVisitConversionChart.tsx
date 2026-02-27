"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Typography,
  CircularProgress,
  Divider,
  Box,
} from "@mui/material";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// ================= TYPES =================
type DataPoint = {
  label: string;
  siteVisitDone: number;
};

// ================= CONSTANTS =================
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ================= API =================
const fetchSiteVisitData = async (
  period: "week" | "month",
): Promise<DataPoint[]> => {
  try {
    const res = await fetch(`/api/v0/analytics/leads?period=${period}`, {
      credentials: "same-origin",
    });

    if (!res.ok) throw new Error("Failed to fetch");

    const json = await res.json();
    return json.siteVisitDoneData || [];
  } catch {
    return [];
  }
};

// ================= COMPONENT =================
export default function SiteVisitConversionChart() {
  const [period, setPeriod] = useState<"week" | "month">("month");
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Data
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchSiteVisitData(period).then((res) => {
      if (mounted) {
        setData(res);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [period]);

  // Fill Missing Data
  const fullData = useMemo(() => {
    if (period === "month") {
      return months.map((month) => {
        const found = data.find((d) => d.label === month);
        return found || { label: month, siteVisitDone: 0 };
      });
    }

    return weekdays.map((day) => {
      const found = data.find((d) => d.label === day);
      return found || { label: day, siteVisitDone: 0 };
    });
  }, [data, period]);

  const totalSiteVisitDone = useMemo(
    () => fullData.reduce((sum, d) => sum + d.siteVisitDone, 0),
    [fullData],
  );

  const maxValue = Math.max(...fullData.map((d) => d.siteVisitDone), 10);

  return (
    <Card
      elevation={0}
      className="rounded-2xl border border-gray-200 shadow-sm p-6 bg-white"
    >
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h6" className="font-semibold text-gray-800">
          Site Visit to Conversion
        </Typography>

        <ToggleButtonGroup
          value={period}
          exclusive
          size="small"
          onChange={(_, val) => val && setPeriod(val)}
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
        </ToggleButtonGroup>
      </div>

      {/* ================= CHART ================= */}
      <div className="w-full h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress size={28} />
          </div>
        ) : fullData.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fullData} margin={{ top: 10, right: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 13, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 13, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                domain={[0, maxValue + 20]}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ fontWeight: 600 }}
              />

              <Line
                type="monotone"
                dataKey="siteVisitDone"
                stroke="#ff9800"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <Divider className="my-6" />

      {/* ================= FOOTER ================= */}
      <div className="flex justify-center">
        <Typography className="text-sm text-gray-600">
          Total Site Visit Done:{" "}
          <span className="font-semibold text-orange-500">
            {totalSiteVisitDone}
          </span>
        </Typography>
      </div>
    </Card>
  );
}
