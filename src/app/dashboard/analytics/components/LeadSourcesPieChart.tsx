import React, { FC, useMemo } from "react";
import { Paper, Typography, Box } from "@mui/material";

interface Slice {
  label: string;
  value: number;
  color?: string;
}

interface LeadSourcesPieChartProps {
  slices?: Slice[];
}

const LeadSourcesPieChart: FC<LeadSourcesPieChartProps> = ({ slices = [] }) => {
  const cx = 140;
  const cy = 140;
  const r = 120;

  /**
   * Calculate total safely
   */
  const total = useMemo(() => {
    return slices.reduce((acc, slice) => acc + (Number(slice.value) || 0), 0);
  }, [slices]);

  /**
   * Convert polar to cartesian
   */
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  /**
   * Create arc path
   */
  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `
      M ${x} ${y}
      L ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}
      Z
    `;
  };

  /**
   * Generate arcs
   */
  const arcs = useMemo(() => {
    if (!slices.length || total === 0) return [];

    let currentAngle = 0;

    return slices.map((slice) => {
      const portion = (slice.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + portion;

      const path =
        slices.length === 1
          ? `
            M ${cx} ${cy}
            m -${r}, 0
            a ${r},${r} 0 1,0 ${r * 2},0
            a ${r},${r} 0 1,0 -${r * 2},0
          `
          : describeArc(cx, cy, r, startAngle, endAngle);

      currentAngle += portion;

      return {
        path,
        color: slice.color || "#e5e7eb",
      };
    });
  }, [slices, total]);

  /**
   * Empty State
   */
  if (!slices.length || total === 0) {
    return (
      <Paper
        elevation={0}
        className="p-6 rounded-2xl border border-gray-200 text-center"
      >
        <Typography className="text-gray-500">No overview data</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      className="p-6 rounded-2xl border border-gray-200 flex flex-col items-center gap-4 shadow-sm"
    >
      <Box className="relative flex items-center justify-center">
        <svg
          width={280}
          height={280}
          viewBox="0 0 280 280"
          role="img"
          aria-label="Leads by source pie chart"
          className="transition-all duration-300"
        >
          {arcs.map((arc, index) => (
            <path
              key={index}
              d={arc.path}
              fill={arc.color}
              stroke="#fff"
              strokeWidth={1}
              className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            />
          ))}

          {/* Inner white circle */}
          <circle cx={cx} cy={cy} r={70} fill="#ffffff" />

          {/* Total Count */}
          <text
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            className="font-bold text-[22px] fill-gray-900"
          >
            {total}
          </text>

          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            className="text-[14px] fill-gray-500"
          >
            Leads
          </text>
        </svg>
      </Box>
    </Paper>
  );
};

export default LeadSourcesPieChart;
