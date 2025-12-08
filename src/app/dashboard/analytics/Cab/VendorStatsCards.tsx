import React from 'react';

export function VendorStatsCards({ displayVendors, appliedFilters }) {
  return (
    <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #dee2e6' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
        <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: '#1976d2', fontSize: '1.5rem' }}>{displayVendors.reduce((sum, v) => sum + (v.totalBookings || 0), 0)}</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Bookings</div>
        </div>
        <div style={{ background: '#e8f5e9', padding: 12, borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: '#388e3c', fontSize: '1.5rem' }}>{displayVendors.reduce((sum, v) => sum + (v.completedBookings || 0), 0)}</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>Completed</div>
        </div>
        <div style={{ background: '#fff3e0', padding: 12, borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: '#f57c00', fontSize: '1.5rem' }}>{displayVendors.reduce((sum, v) => sum + (v.pendingBookings || 0), 0)}</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>Pending</div>
        </div>
        <div style={{ background: '#f3e5f5', padding: 12, borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: '#7b1fa2', fontSize: '1.1rem' }}>{appliedFilters.status === 'payment-due' ? `₹${displayVendors.reduce((sum, v) => sum + (v.paymentDue || 0), 0).toLocaleString()}` : `₹${displayVendors.reduce((sum, v) => sum + (v.totalSpendings || 0), 0).toLocaleString()}`}</div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>{appliedFilters.status === 'payment-due' ? 'Total Payment Due' : 'Total Spendings'}</div>
        </div>
      </div>
    </div>
  );
}
