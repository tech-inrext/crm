"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';
import Paper from '@/components/ui/Component/Paper';
import { VendorFilterControls } from './VendorFilterControls';
import { VendorDropdown } from './VendorDropdown';
import { VendorStatsCards } from './VendorStatsCards';
import { VendorCardsGrid } from './VendorCardsGrid';
import { VendorLoading } from './VendorLoading';
import { VendorEmpty } from './VendorEmpty';
// --- Vendor Breakdown with Filter ---
// Simple in-memory request coalescing for cabbooking endpoint to avoid duplicate network calls
const cabbookingRequests: Map<string, Promise<any>> = new Map();
export function VendorBreakdown() {
  // Filter state
  const [selectedVendor, setSelectedVendor] = React.useState('');
  const [vendorData, setVendorData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Filter states - separate temp states for form and applied states for API
  const [tempFilters, setTempFilters] = React.useState({
    status: 'all',
    fromDate: null,
    toDate: null,
    avp: 'all'
  });
  const [appliedFilters, setAppliedFilters] = React.useState({
    status: 'all',
    fromDate: null,
    toDate: null,
    avp: 'all'
  });

  // AVP users state
  const [avpUsers, setAvpUsers] = React.useState([]);
  const [avpLoading, setAvpLoading] = React.useState(false);
  const [avpError, setAvpError] = React.useState(null);

  // Prevent duplicate initial fetches (React StrictMode in dev can mount twice)
  const mountRef = React.useRef(false);
  const fetchVendors = async (filters = appliedFilters) => {
    setLoading(true);
    try {
      let url = '/api/v0/analytics/cabbooking';
      const params = new URLSearchParams();
      if (filters.fromDate) {
        params.append('fromDate', new Date(filters.fromDate).toISOString());
      }
      if (filters.toDate) {
        params.append('toDate', new Date(filters.toDate).toISOString());
      }
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.avp !== 'all') {
        if (filters.avp.startsWith('manual_avp_')) {
          const selectedAvp = avpUsers.find(avp => avp._id === filters.avp);
          if (selectedAvp) {
            params.append('avpName', selectedAvp.name);
          }
        } else {
          params.append('avpId', filters.avp);
        }
      }
      if (params.toString()) {
        url += '?' + params.toString();
      }
      const key = url;
      let data;
      if (cabbookingRequests.has(key)) {
        data = await cabbookingRequests.get(key);
      } else {
        const p = fetch(url).then(r => r.json()).finally(() => cabbookingRequests.delete(key));
        cabbookingRequests.set(key, p);
        data = await p;
      }
      if (data.success) {
        if (data.avpUsers && Array.isArray(data.avpUsers) && data.avpUsers.length > 0) {
          setAvpUsers(data.avpUsers);
        }
        setVendorData({
          ...data,
          allVendors: data.allVendors,
          totalVendors: data.allVendors.length
        });
      } else {
        setVendorData(null);
      }
    } catch (e) {
      setVendorData(null);
    } finally {
      setLoading(false);
    }
  };
    // Generate year options from 2020 to current year
    const generateYearOptions = () => {
      const years = [{ value: 'all', label: 'All Years' }];
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= 2020; year--) {
        years.push({ value: year.toString(), label: year.toString() });
      }
      return years;
    };

    // Handle filter submission
    const handleSubmitFilters = () => {
      setAppliedFilters({ ...tempFilters });
      fetchVendors(tempFilters);
    };

    // Handle filter reset
    const handleResetFilters = () => {
      const resetFilters = { status: 'all', fromDate: null, toDate: null, avp: 'all' };
      setTempFilters(resetFilters);
      setAppliedFilters(resetFilters);
      setSelectedVendor('');
      fetchVendors(resetFilters);
    };

    // Auto-fetch vendors on component mount only (guarded to avoid double calls in StrictMode)
    React.useEffect(() => {
      if (mountRef.current) return;
      mountRef.current = true;
      fetchVendors();
    }, []);

    const allVendors = vendorData?.allVendors || [];
    // Filter vendors based on applied filters and selection
    let displayVendors = allVendors;
    // Filter by status
    if (appliedFilters.status === 'completed') {
      displayVendors = displayVendors.filter(vendor => (vendor.completedBookings || 0) > 0);
    } else if (appliedFilters.status === 'pending') {
      displayVendors = displayVendors.filter(vendor => (vendor.pendingBookings || 0) > 0);
    } else if (appliedFilters.status === 'payment_due') {
      displayVendors = displayVendors.filter(vendor => Number(vendor.paymentDue) > 0);
    }
    // Filter by selected vendor
    if (selectedVendor) {
      displayVendors = displayVendors.filter(vendor => vendor.name === selectedVendor);
    }
  const hasUnappliedChanges = React.useMemo(() => {
    return tempFilters.status !== appliedFilters.status ||
      tempFilters.fromDate !== appliedFilters.fromDate ||
      tempFilters.toDate !== appliedFilters.toDate ||
      tempFilters.avp !== appliedFilters.avp;
  }, [tempFilters, appliedFilters]);

  return (
    <Box>
      <VendorFilterControls
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        appliedFilters={appliedFilters}
        avpUsers={avpUsers}
        avpLoading={avpLoading}
        avpError={avpError}
        handleSubmitFilters={handleSubmitFilters}
        handleResetFilters={handleResetFilters}
        hasUnappliedChanges={hasUnappliedChanges}
      />
      <VendorDropdown
        vendorData={vendorData}
        allVendors={allVendors}
        appliedFilters={appliedFilters}
        selectedVendor={selectedVendor}
        setSelectedVendor={setSelectedVendor}
      />
      {/* Download Excel Button for selected date range */}
      <div style={{ marginTop: 16, marginBottom: 8 }}>
        <a
          href={(() => {
            // Use appliedFilters for download
            const from = appliedFilters.fromDate ? new Date(appliedFilters.fromDate).toISOString() : '';
            const to = appliedFilters.toDate ? new Date(appliedFilters.toDate).toISOString() : '';
            const params = [];
            if (from) params.push(`fromDate=${encodeURIComponent(from)}`);
            if (to) params.push(`toDate=${encodeURIComponent(to)}`);
            // Always add ts for cache busting
            params.push(`ts=${Date.now()}`);
            return `/api/v0/analytics/cab-booking-excel${params.length ? '?' + params.join('&') : ''}`;
          })()}
          download={`cab-booking-${appliedFilters.fromDate ? new Date(appliedFilters.fromDate).toISOString().split('T')[0] : 'all'}-${appliedFilters.toDate ? new Date(appliedFilters.toDate).toISOString().split('T')[0] : 'all'}.xlsx`}
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            background: '#2196f3',
            color: '#fff',
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: 'none',
            marginTop: 8,
          }}
        >
          Download Excel for {appliedFilters.fromDate ? new Date(appliedFilters.fromDate).toLocaleDateString() : 'All'} - {appliedFilters.toDate ? new Date(appliedFilters.toDate).toLocaleDateString() : 'All'}
        </a>
      </div>
      {vendorData && allVendors.length === 0 && !loading && (
        <VendorEmpty appliedFilters={appliedFilters} />
      )}
      {vendorData && displayVendors.length > 0 && (
        <Box mt={2}>
          <VendorStatsCards displayVendors={displayVendors} appliedFilters={appliedFilters} />
          <VendorCardsGrid displayVendors={displayVendors} />
        </Box>
      )}
      {loading && <VendorLoading />}
      {!vendorData && !loading && (
        <Paper sx={{ background: '#f8f9fa', borderRadius: 2, p: 3, mt: 2, border: '1px solid #dee2e6', textAlign: 'center' }} elevation={0}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: '#495057', mb: 1.5 }}>
            🚗 Cab Driver Analytics
          </Typography>
          <Typography sx={{ color: '#666', mb: 1.5 }}>
            Loading vendor data...
          </Typography>
        </Paper>
      )}
    </Box>
  );
};