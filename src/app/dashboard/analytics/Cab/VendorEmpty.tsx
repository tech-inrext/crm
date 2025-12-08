import React from 'react';
export function VendorEmpty({ appliedFilters, monthOptions }) {
  return (
    <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 6, padding: 16, color: '#856404', textAlign: 'center' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>🔍 No vendors found matching your filters</div>
      <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>
        {(appliedFilters.month !== 'all' || appliedFilters.year !== 'all') && (
          <div style={{ marginBottom: 4 }}>
            📅 <strong>No cab booking data found for {[
              appliedFilters.month !== 'all' ? monthOptions.find(m => m.value === appliedFilters.month)?.label : null,
              appliedFilters.year !== 'all' ? appliedFilters.year : null
            ].filter(Boolean).join(' ')}</strong>
          </div>
        )}
        {appliedFilters.status !== 'all' && (<div style={{ marginBottom: 4 }}>📋 No vendors with <strong>{appliedFilters.status}</strong> bookings</div>)}
        {appliedFilters.avp !== 'all' && (<div style={{ marginBottom: 4 }}>👤 No vendors assigned to selected AVP</div>)}
      </div>
      <div style={{ fontSize: '0.9rem' }}>Try selecting a different filter or reset filters to see all vendors.</div>
    </div>
  );
}
