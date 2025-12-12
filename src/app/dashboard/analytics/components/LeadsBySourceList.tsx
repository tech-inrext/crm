import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

interface LeadsBySourceMetrics {
  map: Record<string, any>;
  sourcesOrder: string[];
  slices: Array<{ label: string; value: number; color?: string }>;
}

const LeadsBySourceList: React.FC<{ leadsBySourceMetrics: LeadsBySourceMetrics }> = ({ leadsBySourceMetrics }) => {
  return (
    <Box width="100%" maxWidth={400}>
      <Typography sx={{ fontSize: '0.95rem', color: '#666', mb: 1, textAlign: 'left' }}>
        Cost per lead & conversion by source
      </Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        {leadsBySourceMetrics.sourcesOrder.length === 0 && (
          <Typography sx={{ color: '#666' }}>No leads available</Typography>
        )}
        {leadsBySourceMetrics.sourcesOrder.map((src) => {
          const m = leadsBySourceMetrics.map[src];
          const count = m?.count || 0;
          const converted = m?.converted || 0;
          const conversion = count > 0 ? Math.round((converted / count) * 100) : 0;
          const avgCost = count > 0 ? Math.round((m.totalCost || 0) / Math.max(1, count)) : 0;
          return (
            <Paper key={src} sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.5, alignItems: 'center', p: '8px 10px', borderRadius: 1.5, background: '#fff', border: '1px solid #f3f3f3', boxShadow: 'none' }}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Box sx={{ width: 12, height: 12, background: (leadsBySourceMetrics.slices.find(s => s.label === src)?.color) || '#ddd', borderRadius: 1 }} />
                <Typography sx={{ fontWeight: 600 }}>{src}</Typography>
              </Box>
              <Box display="flex" gap={1.25} minWidth={160} justifyContent="flex-end" alignItems="center">
                <Typography sx={{ fontSize: '0.95rem', color: '#222' }}>{count}</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>{avgCost > 0 ? `₹${avgCost}` : '—'}</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#08c4a6' }}>{conversion}%</Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default LeadsBySourceList;
