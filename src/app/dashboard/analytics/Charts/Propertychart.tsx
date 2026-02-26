"use client";

import React, { useMemo } from "react";
import { Card, CardContent, Typography } from "@mui/material";

// ======================================================
// Types
// ======================================================

interface PieItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: PieItem[];
  centerLabel: string;
}

// ======================================================
// Helper Functions
// ======================================================

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
) => {
  const startPoint = polarToCartesian(cx, cy, r, end);
  const endPoint = polarToCartesian(cx, cy, r, start);
  const largeArc = end - start <= 180 ? "0" : "1";

  return `
    M ${cx} ${cy}
    L ${startPoint.x} ${startPoint.y}
    A ${r} ${r} 0 ${largeArc} 0 ${endPoint.x} ${endPoint.y}
    Z
  `;
};

// ======================================================
// Reusable Donut Chart Component
// ======================================================

const DonutChart: React.FC<DonutChartProps> = ({ data, centerLabel }) => {
  const total = useMemo(
    () => data.reduce((acc, curr) => acc + curr.value, 0),
    [data],
  );

  const cx = 160;
  const cy = 160;
  const r = 130;

  let angle = 0;

  const arcs = data.map((item) => {
    const portion = (item.value / total) * 360;
    const path = describeArc(cx, cy, r, angle, angle + portion);
    angle += portion;
    return { ...item, path };
  });

  if (!data.length) {
    return (
      <Card className="h-[380px] flex items-center justify-center">
        <Typography color="text.secondary">No data available</Typography>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      className="h-[390px] border border-gray-200 rounded-2xl shadow-sm"
    >
      <CardContent className="h-full flex flex-col md:flex-row items-center justify-between p-6 gap-6">
        {/* ================= LEFT — CHART ================= */}
        <div className="flex-1 flex items-center justify-center">
          <svg
            width="320"
            height="375"
            viewBox="0 0 320 320"
            className="max-w-[280px]"
          >
            {arcs.map((arc, index) => (
              <path
                key={index}
                d={arc.path}
                fill={arc.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}

            {/* Donut Center */}
            <circle cx={cx} cy={cy} r={85} fill="#fff" />

            <text
              x={cx}
              y={cy - 10}
              textAnchor="middle"
              className="fill-gray-900 font-bold text-2xl"
            >
              {total}
            </text>

            <text
              x={cx}
              y={cy + 20}
              textAnchor="middle"
              className="fill-gray-500 text-sm"
            >
              {centerLabel}
            </text>
          </svg>
        </div>

        {/* ================= RIGHT — LEGEND ================= */}
        <div className="flex-1 flex flex-col justify-center gap-3 w-full">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition rounded-lg px-3 py-2"
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color }}
              />

              <Typography className="font-semibold text-gray-700">
                {item.label}
              </Typography>

              <Typography className="ml-auto text-gray-500 text-sm">
                {((item.value / total) * 100).toFixed(1)}%
              </Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ======================================================
// PROPERTY PIE CHART
// ======================================================

export const PropertyPieChart: React.FC<{
  propertyData: { label: string; count: number; color: string }[];
}> = ({ propertyData = [] }) => {
  const formatted = propertyData.map((item) => ({
    label: item.label,
    value: item.count,
    color: item.color,
  }));

  return <DonutChart data={formatted} centerLabel="Leads" />;
};

// ======================================================
// PROJECT PIE CHART
// ======================================================

export const ProjectPieChart: React.FC = () => {
  const PROJECTS: PieItem[] = [
    { label: "Migsun", value: 35, color: "#4285f4" },
    { label: "Dholera", value: 25, color: "#08c4a6" },
    { label: "KW-6", value: 20, color: "#ffca28" },
    { label: "Eco-village", value: 20, color: "#a259e6" },
  ];

  return <DonutChart data={PROJECTS} centerLabel="Projects" />;
};
