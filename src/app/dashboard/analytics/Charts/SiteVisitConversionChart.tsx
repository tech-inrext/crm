import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  month: string;
  siteVisits: number;
  conversions: number;
};

const data: DataPoint[] = [
  { month: "Jan", siteVisits: 32, conversions: 9 },
  { month: "Feb", siteVisits: 38, conversions: 12 },
  { month: "Mar", siteVisits: 42, conversions: 15 },
  { month: "Apr", siteVisits: 36, conversions: 11 },
  { month: "May", siteVisits: 41, conversions: 14 },
  { month: "Jun", siteVisits: 48, conversions: 16 },
];

const totalSiteVisits = data.reduce((sum, d) => sum + d.siteVisits, 0);
const totalConversions = data.reduce((sum, d) => sum + d.conversions, 0);
const averageConversionRate = ((totalConversions / totalSiteVisits) * 100).toFixed(1);

const chartStyles: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  border: "1px solid #ececec",
  padding: "16px 16px 8px 16px",
};

const controlButtonStyle: React.CSSProperties = {
  padding: "5px 12px",
  background: "#fff",
  border: "1px solid #d9d9d9",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: "15px",
  marginLeft: "8px",
  color: "#222",
  transition: "box-shadow .1s",
};

const SiteVisitConversionChart: React.FC = () => (
  <div style={{ ...chartStyles }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <h2 style={{ fontWeight: 600, fontSize: "20px", marginBottom: "0" }}>
        Site Visit to Conversion
      </h2>
      <div>
        <button style={controlButtonStyle}>Filter</button>
        <button style={controlButtonStyle}>Export</button>
      </div>
    </div>
    <div style={{ width: "100%", height: "340px", marginTop: "12px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 24, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 16, fill: "#222", fontWeight: 500 }}
            axisLine={{ stroke: "#d9d9d9" }}
          />
          <YAxis
            domain={[0, 60]}
            tick={{ fontSize: 16, fill: "#222" }}
            axisLine={{ stroke: "#d9d9d9" }}
            ticks={[0, 15, 30, 45, 60]}
          />
          <Tooltip
            labelStyle={{ color: "#222", fontWeight: 600 }}
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          />
          <Line
            type="monotone"
            dataKey="siteVisits"
            stroke="#5b6ee7"
            strokeWidth={2}
            dot={{ r: 4, stroke: "#5b6ee7", fill: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            name="Site Visits"
          />
          <Line
            type="monotone"
            dataKey="conversions"
            stroke="#7fd8b6"
            strokeWidth={2}
            dot={{ r: 4, stroke: "#7fd8b6", fill: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            name="Conversions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "12px",
      fontSize: "14px", // reduced font size
      gap: "32px" // add gap between items
    }}>
      <span style={{ color: "#1a237e" }}>
        Average Conversion Rate: <b>{averageConversionRate}%</b>
      </span>
      <span>
        <span style={{ color: "#1a237e", fontWeight: 400 }}>Total Site Visits: {totalSiteVisits}</span>
      </span>
      <span>
        <span style={{ color: "#1a237e", fontWeight: 400 }}>Total Conversions: {totalConversions}</span>
      </span>
    </div>
  </div>
);

export default SiteVisitConversionChart;
