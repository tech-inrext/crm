"use client";
import React from "react";
import Box from "@/components/ui/Component/Box";
import Typography from "@/components/ui/Component/Typography";
import Paper from "@/components/ui/Component/Paper";

// ----------------------
// Shared Helpers
// ----------------------
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(x: number, y: number, r: number, start: number, end: number) {
  const startPoint = polarToCartesian(x, y, r, end);
  const endPoint = polarToCartesian(x, y, r, start);
  const largeArc = end - start <= 180 ? "0" : "1";
  return `M ${x} ${y} L ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArc} 0 ${endPoint.x} ${endPoint.y} Z`;
}

// =============================================================
// PROPERTY PIE CHART
// =============================================================
export const PropertyPieChart: React.FC<{
  propertyData: Array<{ label: string; count: number; color: string }>;
}> = ({ propertyData = [] }) => {
  const total = propertyData.reduce((a, b) => a + (b.count || 0), 0) || 1;

  const cx = 160,
    cy = 160,
    r = 140;
  let angle = 0;

  const arcs = propertyData.map((p) => {
    const portion = ((p.count || 0) / total) * 360;
    const arc = describeArc(cx, cy, r, angle, angle + portion);
    angle += portion;

    return { ...p, path: arc };
  });

  if (!propertyData.length) {
    return (
      <Paper sx={{ p: 5, textAlign: "center", color: "#666" }}>
        <Typography>No property data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      {/* Left — Chart */}
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <svg width={320} height={320} viewBox="0 0 320 320">
          <g>
            {arcs.map((a, i) => (
              <path key={i} d={a.path} fill={a.color} stroke="#fff" strokeWidth={1} />
            ))}
          </g>

          {/* Donut center */}
          <circle cx={cx} cy={cy} r={85} fill="#fff" />
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            style={{ fontSize: 28, fontWeight: 700, fill: "#222" }}
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            style={{ fontSize: 16, fill: "#666" }}
          >
            leads
          </text>
        </svg>
      </Box>

      {/* Right — Legend */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap={2}
        sx={{ p: 1 }}
      >
        {propertyData.map((p) => (
          <Box
            key={p.label}
            display="flex"
            alignItems="center"
            gap={1.5}
            sx={{
              background: "#f8f9fa",
              px: 1.5,
              py: 1,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: 1,
                backgroundColor: p.color,
              }}
            />
            <Typography sx={{ fontWeight: 600 }}>{p.label}</Typography>
            <Typography sx={{ ml: "auto", color: "#666" }}>
              {((p.count / total) * 100).toFixed(1)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

// =============================================================
// PROJECT PIE CHART
// =============================================================
export const ProjectPieChart: React.FC = () => {
  const PROJECTS = [
    { name: "Migsun", value: 35, color: "#4285f4" },
    { name: "Dholera", value: 25, color: "#08c4a6" },
    { name: "KW-6", value: 20, color: "#ffca28" },
    { name: "Eco-village", value: 20, color: "#a259e6" },
  ];

  const total = PROJECTS.reduce((a, b) => a + b.value, 0);

  const cx = 160,
    cy = 160,
    r = 140;
  let angle = 0;

  const arcs = PROJECTS.map((p) => {
    const portion = (p.value / total) * 360;
    const path = describeArc(cx, cy, r, angle, angle + portion);
    angle += portion;

    return { ...p, path };
  });

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      {/* Chart */}
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <svg width={120} height={120} viewBox="0 0 320 320">
          <g>
            {arcs.map((a, i) => (
              <path key={i} d={a.path} fill={a.color} stroke="#fff" strokeWidth={1} />
            ))}
          </g>

          <circle cx={cx} cy={cy} r={85} fill="#fff" />
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            style={{ fontSize: 20, fontWeight: 500, fill: "#222" }}
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            style={{ fontSize: 16, fill: "#666" }}
          >
            projects
          </text>
        </svg>
      </Box>

      {/* Legend */}
      <Box flex={1} display="flex" flexDirection="column" justifyContent="center" gap={2} sx={{ p: 1 }}>
        {PROJECTS.map((p) => (
          <Box
            key={p.name}
            display="flex"
            alignItems="center"
            gap={1.5}
            sx={{ px: 1.5, py: 1, borderRadius: 2 }}
          >
            <Box sx={{ width: 20, height: 20, background: p.color, borderRadius: 1 }} />
            <Typography sx={{ fontWeight: 600 }}>{p.name}</Typography>
            <Typography sx={{ ml: "auto", color: "#666" }}>
              {((p.value / total) * 100).toFixed(1)}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
