import React from 'react';

export function VendorFilterControls({ tempFilters, setTempFilters, appliedFilters, avpUsers, avpLoading, avpError, handleSubmitFilters, handleResetFilters, monthOptions, generateYearOptions, hasUnappliedChanges }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 20,
      padding: 16,
      background: '#f8f9fa',
      borderRadius: 8,
      border: '1px solid #dee2e6'
    }}>
      {/* Status Filter */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>Status Filter:</label>
        <select value={tempFilters.status} onChange={e => setTempFilters({...tempFilters, status: e.target.value})} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: '100%', fontSize: '0.9rem', background: '#fff' }}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="payment_due">Payment Due</option>
        </select>
      </div>
      {/* Month Filter */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>Month:</label>
        <select value={tempFilters.month} onChange={e => setTempFilters({...tempFilters, month: e.target.value})} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: '100%', fontSize: '0.9rem', background: '#fff' }}>
          {monthOptions.map(month => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>
      </div>
      {/* Year Filter */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>Year:</label>
        <select value={tempFilters.year} onChange={e => setTempFilters({...tempFilters, year: e.target.value})} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: '100%', fontSize: '0.9rem', background: '#fff' }}>
          {generateYearOptions().map(year => (
            <option key={year.value} value={year.value}>{year.label}</option>
          ))}
        </select>
      </div>
      {/* AVP Filter */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>Filter by AVP:{avpLoading && (<span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#666', fontWeight: 400 }}>Loading...</span>)}</label>
        <select value={tempFilters.avp} onChange={e => setTempFilters({...tempFilters, avp: e.target.value})} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', width: '100%', fontSize: '0.9rem', background: '#fff' }} disabled={avpLoading}>
          <option value="all">{avpLoading ? 'Loading AVP Members...' : avpError ? 'Error loading AVP Members' : avpUsers.length > 0 ? `All AVP Members (${avpUsers.length} available)` : 'No AVP Members Found'}</option>
          {!avpLoading && !avpError && avpUsers.length > 0 && avpUsers.map((avp) => (
            <option key={avp._id || avp.id} value={avp._id || avp.id}>{avp.name}</option>
          ))}
        </select>
      </div>
      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={handleSubmitFilters} disabled={!hasUnappliedChanges} style={{ padding: '8px 16px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, cursor: hasUnappliedChanges ? 'pointer' : 'not-allowed' }}>Apply</button>
        <button onClick={handleResetFilters} style={{ padding: '8px 16px', borderRadius: 6, background: '#eee', color: '#333', border: '1px solid #ccc', fontWeight: 600, cursor: 'pointer' }}>Reset</button>
      </div>
    </div>
  );
}
