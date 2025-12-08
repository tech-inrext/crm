import React from 'react';

export function VendorDropdown({ vendorData, allVendors, appliedFilters, selectedVendor, setSelectedVendor, monthOptions }) {
  if (!vendorData || allVendors.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      {(appliedFilters.status !== 'all' || appliedFilters.month !== 'all' || appliedFilters.avp !== 'all') && (
        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 6, fontStyle: 'italic' }}>
          📌 Dropdown shows only vendors matching your applied filters
        </div>
      )}
      <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #ddd', minWidth: 300, fontSize: '1rem', cursor: 'pointer' }}>
        <option value="">{(appliedFilters.status !== 'all' || appliedFilters.month !== 'all' || appliedFilters.avp !== 'all') ? `All Filtered Vendors (${allVendors.length})` : 'All Vendors'}</option>
        {allVendors.map((vendor, idx) => (
          <option key={vendor.id || idx} value={vendor.name}>{vendor.name} - {vendor.totalBookings} bookings</option>
        ))}
      </select>
    </div>
  );
}
