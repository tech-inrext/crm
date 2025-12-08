"use client";
import React from "react";

// --- PropertyPieChart: Pie chart for properties ---
export const PropertyPieChart: React.FC<{ propertyData: Array<{ label: string; count: number; color: string }> }> = ({ propertyData = [] }) => {
  const total = propertyData.reduce((acc, p) => acc + (Number(p.count) || 0), 0) || 1;
  // Make chart larger
  const cx = 160, cy = 160, r = 140;
  let angle = 0;
  const arcs = propertyData.map((p) => {
    const portion = ((Number(p.count) || 0) / total) * 360;
    const startAngle = angle;
    const endAngle = angle + portion;
    const path = describeArc(cx, cy, r, startAngle, endAngle);
    angle += portion;
    return { path, color: p.color, label: p.label, value: Number(p.count) || 0 };
  });

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  }

  if (propertyData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
        No property data available
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        width: '100%',
        gap: 0,
        flexWrap: 'wrap',
        minHeight: 320,
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
        <svg width={320} height={320} viewBox="0 0 320 320" role="img" aria-label="Property demand pie chart">
          <g>
            {arcs.map((a, idx) => (
              <path
                key={idx}
                d={a.path}
                fill={a.color}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </g>
          {/* donut center */}
          <circle cx={cx} cy={cy} r={85} fill="#fff" />
          <text x={cx} y={cy - 12} textAnchor="middle" style={{ fontSize: 28, fontWeight: 700, fill: '#222' }}>{total}</text>
          <text x={cx} y={cy + 24} textAnchor="middle" style={{ fontSize: 18, fill: '#666' }}>leads</text>
        </svg>
      </div>
      <div
        style={{
          flex: 1,
          marginLeft: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          minWidth: 0,
          justifyContent: 'center',
        }}
      >
        {propertyData.length > 0 ? (
          propertyData.map((p) => (
            <div
              key={p.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 18,
                fontWeight: 500,
                color: '#333',
                borderRadius: 6,
                padding: '6px 10px',
                background: '#f8f9fa',
              }}
            >
              <span style={{ width: 22, height: 22, background: p.color, display: 'inline-block', borderRadius: 4 }} />
              <span>{p.label}</span>
              <span style={{ marginLeft: 'auto', color: '#666', fontWeight: 400 }}>{((p.count / total) * 100).toFixed(1)}%</span>
            </div>
          ))
        ) : (
          <div style={{ color: '#666', fontSize: '0.95rem' }}>No properties available</div>
        )}
      </div>
    </div>
  );
};

// --- ProjectPieChart: Pie chart for projects (legacy) ---
export const ProjectPieChart: React.FC = () => {
  const PROJECTS = [
    { name: 'Migsun', value: 35, color: '#4285f4' },
    { name: 'Dholera', value: 25, color: '#08c4a6' },
    { name: 'KW-6', value: 20, color: '#ffca28' },
    { name: 'Eco-village', value: 20, color: '#a259e6' },
  ];

  const total = PROJECTS.reduce((acc, p) => acc + p.value, 0);
  // Make chart larger
  const cx = 160, cy = 160, r = 140;
  let angle = 0;
  const arcs = PROJECTS.map((p) => {
    const portion = (p.value / total) * 360;
    const startAngle = angle;
    const endAngle = angle + portion;
    const path = describeArc(cx, cy, r, startAngle, endAngle);
    angle += portion;
    return { path, color: p.color, name: p.name, value: p.value };
  });

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div style={{ flex: '0 0 auto' }}>
        <svg width={320} height={320} viewBox="0 0 320 320" role="img" aria-label="Project demand pie chart">
          <g>
            {arcs.map((a, idx) => (
              <path
                key={idx}
                d={a.path}
                fill={a.color}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </g>
          {/* donut center */}
          <circle cx={cx} cy={cy} r={85} fill="#fff" />
          <text x={cx} y={cy - 12} textAnchor="middle" style={{ fontSize: 28, fontWeight: 700, fill: '#222' }}>{total}</text>
          <text x={cx} y={cy + 24} textAnchor="middle" style={{ fontSize: 18, fill: '#666' }}>projects</text>
        </svg>
      </div>
      <div style={{ flex: '1 1 0', marginLeft: 36, display: 'flex', flexDirection: 'column', gap: 18, minWidth: 180 }}>
        {PROJECTS.map((p, idx) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 500, color: '#333', borderRadius: 6, padding: '6px 10px' }}>
            <span style={{ width: 22, height: 22, background: p.color, display: 'inline-block', borderRadius: 4 }} />
            <span>{p.name}</span>
            <span style={{ marginLeft: 'auto', color: '#666', fontWeight: 400 }}>{((p.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};