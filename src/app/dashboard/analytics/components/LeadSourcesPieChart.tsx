import { totalmem } from 'os';
import React from 'react';

interface Slice {
  label: string;
  value: number;
  color?: string;
}

const LeadSourcesPieChart: React.FC<{ slices?: Slice[] }> = ({ slices = [] }) => {
  if (!slices || slices.length === 0) {
    return <div style={{ padding: 12, color: '#666' }}>No overview data</div>;
  }

  const total = slices.reduce((acc, s) => acc + (Number(s.value) || 0), 0) || 1;
  const cx = 140;
  const cy = 140;
  const r = 120;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

 
  let angle = 0;
  const arcs = slices.map((s) => {
    const value = Number(s.value) || 0;
    const portion = (value / total) * 360;
    const startAngle = angle;
    const endAngle = angle + portion;
    const path = describeArc(cx, cy, r, startAngle, endAngle);
    angle += portion;
    return { path, color: s.color || '#ddd', label: s.label, value };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <svg width={280} height={280} viewBox="0 0 280 280" role="img" aria-label="Leads by source pie chart">
        <g>
          {arcs.map((a, idx) => (
            <path key={idx} d={a.path} fill={a.color} stroke="#fff" strokeWidth={0.5} />
          ))}
        </g>
        <circle cx={cx} cy={cy} r={70} fill="#fff" />
        <text x={cx} y={cy - 10} textAnchor="middle" style={{ fontSize: 20, fontWeight: 700, fill: '#222' }}>{total}</text>
        <text x={cx} y={cy + 22} textAnchor="middle" style={{ fontSize: 14, fill: '#666' }}>leads</text>
      </svg>
    </div>
  );
};

export default LeadSourcesPieChart;
