import React from 'react';

export function VendorCardsGrid({ displayVendors, appliedFilters, selectedVendor, setSelectedVendor, monthOptions }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
      {displayVendors.map((vendor, idx) => {
        const paymentDueValue = Number(vendor.paymentDue) || 0;
        return (
          <div key={vendor.id || idx} style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
              <h4 style={{ color: '#222', margin: 0, fontSize: '1.1rem' }}>{vendor.name}</h4>
            </div>
            {/* Vendor stats row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 10, justifyContent: 'space-between' }}>
              <div style={{ background: '#e8f5e9', padding: '6px 12px', borderRadius: 4, textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontWeight: 700, color: '#388e3c', fontSize: '1rem' }}>{vendor.completedBookings || 0}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Completed</div>
              </div>
              <div style={{ background: '#fff3e0', padding: '6px 12px', borderRadius: 4, textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontWeight: 700, color: '#f57c00', fontSize: '1rem' }}>{vendor.pendingBookings || 0}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Pending</div>
              </div>
              <div style={{ background: '#ffd7d7', padding: '6px 12px', borderRadius: 4, textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontWeight: 700, color: '#d32f2f', fontSize: '1rem' }}>₹{paymentDueValue.toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: '#d32f2f' }}>Payment Due</div>
              </div>
              <div style={{ background: '#e3f2fd', padding: '6px 12px', borderRadius: 4, textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>₹{(vendor.totalSpendings || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: '#1976d2' }}>Total Spendings</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#666' }}>
              📞 {vendor.phone || vendor.contactNumber || 'N/A'}
              {vendor.avp && (<div style={{ marginTop: 4 }}>👤 AVP: {typeof vendor.avp === 'object' ? vendor.avp.name : vendor.avp}</div>)}
              {vendor.lastBookingDate && (<div style={{ marginTop: 4 }}>📅 Last: {new Date(vendor.lastBookingDate).toLocaleDateString()}</div>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
