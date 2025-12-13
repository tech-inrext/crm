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
    month: 'all',
    year: 'all',
    avp: 'all'
  });
  const [appliedFilters, setAppliedFilters] = React.useState({
    status: 'all',
    month: 'all',
    year: 'all',
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
      if (filters.month !== 'all' || filters.year !== 'all') {
        const monthValue = filters.month !== 'all' ? filters.month : '01';
        const yearValue = filters.year !== 'all' ? filters.year : new Date().getFullYear().toString();
        params.append('month', `${yearValue}-${monthValue}`);
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
        let filteredVendors = data.allVendors;
        if (filters.month !== 'all') {
          filteredVendors = data.allVendors.filter(vendor => (vendor.totalBookings || 0) > 0);
        }
        setVendorData({
          ...data,
          allVendors: filteredVendors,
          totalVendors: filteredVendors.length
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
      const resetFilters = { status: 'all', month: 'all', year: 'all', avp: 'all' };
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
  const monthOptions = (() => {
    const months = [{ value: 'all', label: 'All Months' }];
    for (let i = 1; i <= 12; i++) {
      const date = new Date(2000, i - 1, 1);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long' });
      months.push({ value: String(i).padStart(2, '0'), label: monthLabel });
    }
    return months;
  })();

  const hasUnappliedChanges = React.useMemo(() => {
    return tempFilters.status !== appliedFilters.status ||
      tempFilters.month !== appliedFilters.month ||
      tempFilters.year !== appliedFilters.year ||
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
        monthOptions={monthOptions}
        generateYearOptions={generateYearOptions}
        hasUnappliedChanges={hasUnappliedChanges}
      />
      <VendorDropdown
        vendorData={vendorData}
        allVendors={allVendors}
        appliedFilters={appliedFilters}
        selectedVendor={selectedVendor}
        setSelectedVendor={setSelectedVendor}
        monthOptions={monthOptions}
      />
      {vendorData && allVendors.length === 0 && !loading && (
        <VendorEmpty appliedFilters={appliedFilters} monthOptions={monthOptions} />
      )}
      {vendorData && displayVendors.length > 0 && (
        <Box mt={2}>
          <VendorStatsCards displayVendors={displayVendors} appliedFilters={appliedFilters} />
          <VendorCardsGrid
            displayVendors={displayVendors}
            appliedFilters={appliedFilters}
            selectedVendor={selectedVendor}
            setSelectedVendor={setSelectedVendor}
            monthOptions={monthOptions}
          />
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