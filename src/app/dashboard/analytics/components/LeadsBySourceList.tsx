import React from 'react';

interface LeadsBySourceMetrics {
  map: Record<string, any>;
  sourcesOrder: string[];
  slices: Array<{ label: string; value: number; color?: string }>;
}

const LeadsBySourceList: React.FC<{ leadsBySourceMetrics: LeadsBySourceMetrics }> = ({ leadsBySourceMetrics }) => {
  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div style={{ fontSize: '0.95rem', color: '#666', marginBottom: 8, textAlign: 'left' }}>Cost per lead & conversion by source</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {leadsBySourceMetrics.sourcesOrder.length === 0 && (
          <div style={{ color: '#666' }}>No leads available</div>
        )}
        {leadsBySourceMetrics.sourcesOrder.map((src) => {
          const m = leadsBySourceMetrics.map[src];
          const count = m?.count || 0;
          const converted = m?.converted || 0;
          const conversion = count > 0 ? Math.round((converted / count) * 100) : 0;
          const avgCost = count > 0 ? Math.round((m.totalCost || 0) / Math.max(1, count)) : 0;
          return (
            <div key={src} style={{ display: 'flex', justifyContent: 'space-between', gap: 4, alignItems: 'center', padding: '8px 10px', borderRadius: 6, background: '#fff', border: '1px solid #f3f3f3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, background: (leadsBySourceMetrics.slices.find(s => s.label === src)?.color) || '#ddd', borderRadius: 3 }} />
                <div style={{ fontWeight: 600 }}>{src}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, minWidth: 160, justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ fontSize: '0.95rem', color: '#222' }}>{count}</div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>{avgCost > 0 ? `₹${avgCost}` : '—'}</div>
                <div style={{ fontSize: '0.9rem', color: '#08c4a6' }}>{conversion}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadsBySourceList;
