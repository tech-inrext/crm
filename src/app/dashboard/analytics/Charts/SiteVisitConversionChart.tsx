import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Button,
  Divider,
} from "@/components/ui/Component";
 import {
  ToggleButton,
  ToggleButtonGroup
 }
 from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type DataPoint = {
  label: string;
  siteVisitDone: number;
};

const fetchSiteVisitData = async (period: "week" | "month") => {
  try {
    const res = await fetch(
      `/api/v0/analytics/leads?period=${period}`,
      { credentials: "same-origin" }
    );
    if (!res.ok) throw new Error("Failed to fetch data");
    const json = await res.json();
    // Use the new array format from backend
    return json.siteVisitDoneData || [];
  } catch (err) {
    return [];
  }
};
// Month and Weekday arrays
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const weekdays = [
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
];

export default function SiteVisitConversionChart() {
  const [period, setPeriod] = useState<"week" | "month">("month");
  const [data, setData] = useState<DataPoint[]>([]);

  // Fill data for all months or weekdays, even if missing
  const getFullData = () => {
    if (period === "month") {
      return months.map((month) => {
        const found = data.find((d) => d.label === month);
        return found || { label: month, siteVisitDone: 0 };
      });
    } else {
      // Only keep the latest 7 days (assuming data is ordered oldest to newest)
      const last7 = data.slice(-7);
      // Map to weekdays, filling missing days with 0
      return weekdays.map((day) => {
        const found = last7.find((d) => d.label === day);
        return found || { label: day, siteVisitDone: 0 };
      });
    }
  };
  const [loading, setLoading] = useState(false);

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


  const totalSiteVisitDone = data.reduce((sum, d) => sum + d.siteVisitDone, 0);

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        border: "1px solid #ececec",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight={600}>
          Site Visit to Conversion
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={(e, val) => val && setPeriod(val)}
            size="small"
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ width: "100%", height: 340 }}>
        {loading ? (
          <Box textAlign="center" pt={10}>
            <CircularProgress size={32} />
          </Box>
        ) : data.length === 0 ? (
          <Box textAlign="center" pt={10} color="text.secondary">
            No data available
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getFullData()} margin={{ top: 12, right: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 14, fill: "#333" }}
                axisLine={{ stroke: "#ccc" }}
                type="category"
                interval={0}
                ticks={period === "month" ? months : weekdays}
              />
              <YAxis
                tick={{ fontSize: 14, fill: "#333" }}
                axisLine={{ stroke: "#ccc" }}
                domain={[0, "dataMax + 50"]}
              />
              <Tooltip
                labelStyle={{ fontWeight: 600 }}
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="siteVisitDone"
                stroke="#ff9800"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Site Visit Done"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Divider sx={{ mt: 2, mb: 2 }} />

      {/* Stats Footer */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        fontSize={14}
      >
        <Typography color="primary">
          Total Site Visit Done: <b>{totalSiteVisitDone}</b>
        </Typography>
      </Box>
    </Card>
  );
}














