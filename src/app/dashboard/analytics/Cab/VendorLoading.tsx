import React from 'react';
export function VendorLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40, background: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e3f2fd', borderTop: '3px solid #1976d2', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ color: '#666', fontSize: '1rem' }}>Loading vendor data...</div>
      </div>
    </div>
  );
}
