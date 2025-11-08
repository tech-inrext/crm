"use client";

import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import BoxMUI from '@mui/material/Box';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Typography, Card, CardContent } from '@/components/ui/Component';
import { FaUsers, FaHome, FaDollarSign, FaBuilding } from "react-icons/fa";
import LeadGenerationChart from '../analytics/LeadGenerationChart';
import SiteVisitConversionChart from './SiteVisitConversionChart';

// Simple in-memory request coalescing for cabbooking endpoint to avoid duplicate network calls
const cabbookingRequests: Map<string, Promise<any>> = new Map();
// Short-lived response cache to avoid refetching the same URL repeatedly during navigation/dev HMR
const cabbookingCache: Map<string, any> = new Map();
// Cache TTL in ms (30 seconds)
const CABBOOKING_CACHE_TTL = 30 * 1000;
const cabbookingCacheTimestamps: Map<string, number> = new Map();

// --- Pie Chart Component (SVG) ---
// Renders a simple SVG pie with colored wedges. Falls back to a message when no slices.
const LeadSourcesPieChart: React.FC<{ slices?: Array<{ label: string; value: number; color?: string }> }> = ({ slices = [] }) => {
  if (!slices || slices.length === 0) {
    return <div style={{ padding: 12, color: '#666' }}>No overview data</div>;
  }

  const total = slices.reduce((acc, s) => acc + (Number(s.value) || 0), 0) || 1;

  const cx = 140;
  const cy = 140;
  const r = 120;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  // build arcs
  let angle = 0;
  const arcs = slices.map((s) => {
    const value = Number(s.value) || 0;
    const portion = (value / total) * 360;
    const startAngle = angle;
    const endAngle = angle + portion;
    const path = describeArc(cx, cy, r, startAngle, endAngle);
    angle += portion;
    return { path, color: s.color || '#ddd', label: s.label, value };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <svg width={280} height={280} viewBox="0 0 280 280" role="img" aria-label="Leads by source pie chart">
        <g>
          {arcs.map((a, idx) => (
            <path key={idx} d={a.path} fill={a.color} stroke="#fff" strokeWidth={0.5} />
          ))}
        </g>
        {/* center circle to create donut feel */}
        <circle cx={cx} cy={cy} r={70} fill="#fff" />
        <text x={cx} y={cy - 10} textAnchor="middle" style={{ fontSize: 20, fontWeight: 700, fill: '#222' }}>{total}</text>
        <text x={cx} y={cy + 22} textAnchor="middle" style={{ fontSize: 14, fill: '#666' }}>leads</text>
      </svg>
    </div>
  );
};

// --- StatCard & StatsCardsRow ---
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBg,
}) => (
  <div
    className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white px-6 py-6 min-w-[290px] shadow-sm"
    style={{ minHeight: 140 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-700 font-medium">{title}</div>
        <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div
        className={`flex items-center justify-center rounded-full ${iconBg}`}
        style={{ width: 40, height: 40 }}
      >
        {icon}
      </div>
    </div>
  </div>
);

type StatsCardsRowProps = {
  newLeads?: number | null;
  loadingNewLeads?: boolean;
  siteVisitCount?: number | null;
  siteVisitLoading?: boolean;
  totalUsers?: number | null;
  usersLoading?: boolean;
  totalTeams?: number | null;
  teamsLoading?: boolean;
  vendorCount?: number | null;
  totalBilling?: string | number | null;
  pendingMouTotal?: number | null;
  pendingMouLoading?: boolean;
  approvedMouTotal?: number | null;
  approvedMouLoading?: boolean;
  showVendorBilling?: boolean;
  showTotalUsers?: boolean;
}

export const StatsCardsRow: React.FC<StatsCardsRowProps> = ({ 
  newLeads = 0, 
  loadingNewLeads = false, 
  siteVisitCount = 0, 
  siteVisitLoading = false, 
  totalUsers = 0, 
  usersLoading = false, 
  totalTeams = 0,
  teamsLoading = false,
  vendorCount = 0, 
  totalBilling = '₹0', 
  pendingMouTotal = 0, 
  pendingMouLoading = false, 
  approvedMouTotal = 0, 
  approvedMouLoading = false,
  showVendorBilling = false,
  showTotalUsers = false
}) => (
  <div className="flex gap-4 w-full flex-wrap" style={{ marginBottom: 32 }}>
    {showTotalUsers && (
      <StatCard
        title="Total Users"
        value={usersLoading ? 'Loading...' : (totalUsers ?? 0)}
        icon={<FaHome size={22} className="text-green-500" />}
        iconBg="bg-green-50"
      />
    )}

    <StatCard
      title="My Team Members"
      value={teamsLoading ? 'Loading...' : (totalTeams ?? 0)}
      icon={<FaUsers size={22} className="text-indigo-500" />}
      iconBg="bg-indigo-50"
    />

    <StatCard
      title="New Leads"
      value={loadingNewLeads ? 'Loading...' : (newLeads ?? 0)}
      icon={<FaUsers size={22} className="text-blue-500" />}
      iconBg="bg-blue-50"
    />

    <StatCard
      title="Upcoming Site Visits"
      value={siteVisitLoading ? 'Loading...' : (siteVisitCount ?? 0)}
      icon={<FaDollarSign size={22} className="text-purple-500" />}
      iconBg="bg-purple-50"
    />
    <StatCard
      title="MoUs (Pending / Completed)"
      value={pendingMouLoading || approvedMouLoading ? 'Loading...' : `${pendingMouTotal ?? 0} / ${approvedMouTotal ?? 0}`}
      icon={<FaUsers size={22} className="text-indigo-600" />}
      iconBg="bg-indigo-50"
    />
    {showVendorBilling && (
      <StatCard
        title="Total Vendors & Billing amount"
        value={`${(typeof vendorCount === 'number' ? vendorCount : 0) || 0} / ${typeof totalBilling === 'number' ? `₹${totalBilling.toLocaleString()}` : (totalBilling ?? '₹0')}`}
        icon={<FaBuilding size={22} className="text-yellow-500" />}
        iconBg="bg-yellow-50"
      />
    )}
  </div>
);


// --- Vendor Breakdown with Filter ---
function VendorBreakdown() {
  // Filter state
  const [selectedVendor, setSelectedVendor] = React.useState('');
  const [vendorData, setVendorData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  
  // Filter states - separate temp states for form and applied states for API
  const [tempFilters, setTempFilters] = React.useState({
    status: 'all',
    month: 'all',
    avp: 'all'
  });
  const [appliedFilters, setAppliedFilters] = React.useState({
    status: 'all',
    month: 'all',
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
      // Build API URL with filters (use combined cab analytics endpoint)
      let url = '/api/v0/analytics/cabbooking';
      const params = new URLSearchParams();
      
      // Add month filter
      if (filters.month !== 'all') {
        params.append('month', filters.month);
      }
      
      // Add status filter
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      // Add AVP filter
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
      
      // Coalesce identical requests: use cache first, then in-flight promise map
      const key = url;
      let data;

      // Return cached response if available and fresh
      const ts = cabbookingCacheTimestamps.get(key);
      if (cabbookingCache.has(key) && ts && (Date.now() - ts) < CABBOOKING_CACHE_TTL) {
        // console.debug('[cabbooking] returning cached data for', key);
        data = cabbookingCache.get(key);
      } else if (cabbookingRequests.has(key)) {
        // console.debug('[cabbooking] awaiting in-flight request for', key);
        data = await cabbookingRequests.get(key);
      } else {
        // console.debug('[cabbooking] issuing network request for', key);
        const controller = new AbortController();
        const p = fetch(url, { signal: controller.signal })
          .then(r => r.json())
          .then((resp) => {
            try {
              cabbookingCache.set(key, resp);
              cabbookingCacheTimestamps.set(key, Date.now());
            } catch (e) {
              // ignore cache set errors
            }
            return resp;
          })
          .finally(() => cabbookingRequests.delete(key));
        cabbookingRequests.set(key, p);
        data = await p;
      }
      
      if (data.success) {
        // If server returned AVP users, set them (so we don't call employee/role endpoints separately)
        if (data.avpUsers && Array.isArray(data.avpUsers) && data.avpUsers.length > 0) {
          setAvpUsers(data.avpUsers);
        }
        // Filter out vendors with no bookings if month filter is applied
        let filteredVendors = data.allVendors;
        
        if (filters.month !== 'all') {
          // Only show vendors that have bookings in the selected month
          filteredVendors = data.allVendors.filter(vendor => 
            (vendor.totalBookings || 0) > 0
          );
         }
        
        setVendorData({
          ...data,
          allVendors: filteredVendors,
          totalVendors: filteredVendors.length
        });
      } else {
        console.error('API returned error:', data.message || 'Unknown error');
        setVendorData(null);
      }
    } catch (e) {
      console.error('Error fetching vendors:', e);
      setVendorData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter submission
  const handleSubmitFilters = () => {
    setAppliedFilters({ ...tempFilters });
    fetchVendors(tempFilters);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    const resetFilters = { status: 'all', month: 'all', avp: 'all' };
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
  
  // If specific vendor is selected, show only that vendor
  if (selectedVendor) {
    displayVendors = allVendors.filter(vendor => vendor.name === selectedVendor);
  }
  // Generate month options for the last 12 months
  const generateMonthOptions = () => {
    const months = [{ value: 'all', label: 'All Months' }];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ value: monthValue, label: monthLabel });
    }
    
    return months;
  };

  // Check if there are pending filter changes
  const hasUnappliedChanges = React.useMemo(() => {
    return tempFilters.status !== appliedFilters.status ||
           tempFilters.month !== appliedFilters.month ||
           tempFilters.avp !== appliedFilters.avp;
  }, [tempFilters, appliedFilters]);

  const monthOptions = generateMonthOptions();

  return (
    <div>
      {/* Filter Controls */}
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
          <label style={{ 
            display: 'block', 
            marginBottom: 6, 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem'
          }}>
            Status Filter:
          </label>
          <select
            value={tempFilters.status}
            onChange={e => setTempFilters({...tempFilters, status: e.target.value})}
            style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              width: '100%',
              fontSize: '0.9rem',
              background: '#fff'
            }}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: 6, 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem'
          }}>
            Month Filter:
          </label>
          <select
            value={tempFilters.month}
            onChange={e => setTempFilters({...tempFilters, month: e.target.value})}
            style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              width: '100%',
              fontSize: '0.9rem',
              background: '#fff'
            }}
          >
            {monthOptions.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* AVP Filter */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: 6, 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem'
          }}>
            Filter by AVP:
            {avpLoading && (
              <span style={{ 
                marginLeft: 8, 
                fontSize: '0.8rem', 
                color: '#666',
                fontWeight: 400
              }}>
                Loading...
              </span>
            )}
           
          </label>
          <select
            value={tempFilters.avp}
            onChange={e => setTempFilters({...tempFilters, avp: e.target.value})}
            style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              width: '100%',
              fontSize: '0.9rem',
              background: '#fff'
            }}
            disabled={avpLoading}
          >
            <option value="all">
              {avpLoading ? 'Loading AVP Members...' : 
               avpError ? 'Error loading AVP Members' :
               avpUsers.length > 0 ? `All AVP Members (${avpUsers.length} available)` : 'No AVP Members Found'}
            </option>
            {!avpLoading && !avpError && avpUsers.length > 0 && avpUsers.map((avp) => (
              <option key={avp._id || avp.id} value={avp._id || avp.id}>
                {avp.name} (Role: {avp.designation || avp.role || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'end', justifyContent: 'flex-start' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 6, 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem',
            opacity: 0
          }}>
            Actions:
          </label>
          <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: -10 }}>
            <button
              onClick={handleSubmitFilters}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: 6,
                border: 'none',
                background: loading ? '#6c757d' : '#007bff',
                color: '#fff',
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
            <button
              onClick={handleResetFilters}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: 6,
                border: '1px solid #dc3545',
                background: '#fff',
                color: '#dc3545',
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Vendor Dropdown */}
      {vendorData && allVendors.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {(appliedFilters.status !== 'all' || appliedFilters.month !== 'all' || appliedFilters.avp !== 'all') && (
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#666', 
              marginBottom: 6,
              fontStyle: 'italic'
            }}>
              📌 Dropdown shows only vendors matching your applied filters
            </div>
          )}
          <select
            value={selectedVendor}
            onChange={e => {
              setSelectedVendor(e.target.value);
            }}
            style={{ 
              padding: '10px 14px', 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              minWidth: 300,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            <option value="">
              {(appliedFilters.status !== 'all' || appliedFilters.month !== 'all' || appliedFilters.avp !== 'all') 
                ? `All Filtered Vendors (${allVendors.length})` 
                : 'All Vendors'
              }
            </option>
            {allVendors.map((vendor, idx) => (
              <option key={vendor.id || idx} value={vendor.name}>
                {vendor.name} - {vendor.totalBookings} bookings
              </option>
            ))}
          </select>
        </div>
      )}

      {/* No results message */}
      {vendorData && allVendors.length === 0 && !loading && (
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          borderRadius: 6,
          padding: 16,
          color: '#856404',
          textAlign: 'center'
        }}>
          {(appliedFilters.status !== 'all' || appliedFilters.month !== 'all' || appliedFilters.avp !== 'all') ? (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                🔍 No vendors found matching your filters
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>
                {appliedFilters.month !== 'all' && (
                  <div style={{ marginBottom: 4 }}>
                    📅 <strong>No cab booking data found for {monthOptions.find(m => m.value === appliedFilters.month)?.label}</strong>
                  </div>
                )}
                {appliedFilters.status !== 'all' && (
                  <div style={{ marginBottom: 4 }}>
                    📋 No vendors with <strong>{appliedFilters.status}</strong> bookings
                  </div>
                )}
                {appliedFilters.avp !== 'all' && (
                  <div style={{ marginBottom: 4 }}>
                    👤 No vendors assigned to selected AVP
                  </div>
                )}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                Try selecting a different {appliedFilters.month !== 'all' ? 'month' : 'filter'} or reset filters to see all vendors.
              </div>
            </div>
          ) : (
            'No drivers found. Try a different filter option.'
          )}
        </div>
      )}

      {/* Vendors display - shows all vendors or specific selected vendor */}
      {vendorData && displayVendors.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ 
            background: '#f8f9fa', 
            borderRadius: 8, 
            padding: 16, 
            marginBottom: 16,
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#333', margin: '0 0 8px 0', fontSize: '1.2rem' }}>
              📊 {selectedVendor ? `${selectedVendor} Details` : `Vendor Overview (${displayVendors.length} ${(appliedFilters.status !== 'all' || appliedFilters.month !== 'all' || appliedFilters.avp !== 'all') ? 'filtered' : 'total'} results)`}
              {(appliedFilters.status !== 'all' || appliedFilters.month !== 'all' || appliedFilters.avp !== 'all') && !selectedVendor && (
                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 400 }}>
                  {appliedFilters.month !== 'all' 
                    ? ` - Showing ${monthOptions.find(m => m.value === appliedFilters.month)?.label} data only`
                    : ' - Showing filtered data only'
                  }
                </span>
              )}
            </h3>
            {/* Selection Status */}
            {selectedVendor && (
              <div style={{ 
                background: '#e8f5e9', 
                padding: 8, 
                borderRadius: 4, 
                marginBottom: 12,
                fontSize: '0.85rem',
                color: '#2e7d32',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                ✅ <strong>Selected Vendor:</strong> {selectedVendor} 
                <button 
                  onClick={() => {
                    setSelectedVendor('');
                  }}
                  style={{ 
                    marginLeft: 10, 
                    padding: '2px 8px', 
                    background: '#fff', 
                    border: '1px solid #2e7d32', 
                    borderRadius: 4, 
                    color: '#2e7d32',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Clear Selection
                </button>
              </div>
            )}
            {/* Month-specific notice */}
            {appliedFilters.month !== 'all' && (
              <div style={{ 
                background: '#e3f2fd', 
                padding: 8, 
                borderRadius: 4, 
                marginBottom: 12,
                fontSize: '0.85rem',
                color: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                📅 <strong>Month Filter Active:</strong> Only showing cab booking data from {monthOptions.find(m => m.value === appliedFilters.month)?.label}. 
                Vendors without bookings in this month are hidden.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
              <div style={{ background: '#e3f2fd', padding: 12, borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#1976d2', fontSize: '1.5rem' }}>
                  {displayVendors.reduce((sum, v) => sum + (v.totalBookings || 0), 0)}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Bookings</div>
              </div>
              <div style={{ background: '#e8f5e9', padding: 12, borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#388e3c', fontSize: '1.5rem' }}>
                  {displayVendors.reduce((sum, v) => sum + (v.completedBookings || 0), 0)}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Completed</div>
              </div>
              <div style={{ background: '#fff3e0', padding: 12, borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#f57c00', fontSize: '1.5rem' }}>
                  {displayVendors.reduce((sum, v) => sum + (v.pendingBookings || 0), 0)}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Pending</div>
              </div>
              <div style={{ background: '#f3e5f5', padding: 12, borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: '#7b1fa2', fontSize: '1.1rem' }}>
                  ₹{displayVendors.reduce((sum, v) => sum + (v.totalEarnings || 0), 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Earnings</div>
              </div>
            </div>
          </div>
          
          {/* Individual vendor cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {displayVendors
              .filter((vendor) => {
                // Filter out vendors with 0 bookings for the selected status
                if (appliedFilters.status === 'completed') {
                  return (vendor.completedBookings || 0) > 0;
                } else if (appliedFilters.status === 'pending') {
                  return (vendor.pendingBookings || 0) > 0;
                } else if (appliedFilters.status === 'cancelled') {
                  return (vendor.cancelledBookings || 0) > 0;
                } else if (appliedFilters.status === 'in-progress') {
                  return (vendor.inProgressBookings || 0) > 0;
                } else {
                  // For 'all' status, show all vendors
                  return true;
                }
              })
              .map((vendor, idx) => {
              // Create filtered vendor data based on applied status filter
              const filteredVendor = (() => {
                if (appliedFilters.status === 'completed') {
                  return {
                    ...vendor,
                    totalBookings: vendor.completedBookings || 0,
                    pendingBookings: 0,
                    cancelledBookings: 0,
                    inProgressBookings: 0,
                    displayNote: '(completed only)'
                  };
                } else if (appliedFilters.status === 'pending') {
                  return {
                    ...vendor,
                    totalBookings: vendor.pendingBookings || 0,
                    completedBookings: 0,
                    cancelledBookings: 0,
                    inProgressBookings: 0,
                    displayNote: '(pending only)'
                  };
                } else if (appliedFilters.status === 'cancelled') {
                  return {
                    ...vendor,
                    totalBookings: vendor.cancelledBookings || 0,
                    completedBookings: 0,
                    pendingBookings: 0,
                    inProgressBookings: 0,
                    displayNote: '(cancelled only)'
                  };
                } else if (appliedFilters.status === 'in-progress') {
                  return {
                    ...vendor,
                    totalBookings: vendor.inProgressBookings || 0,
                    completedBookings: 0,
                    pendingBookings: 0,
                    cancelledBookings: 0,
                    displayNote: '(in-progress only)'
                  };
                } else {
                  return vendor;
                }
              })();

              return (
                <div key={vendor.id || idx} style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: 16,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: 12,
                    borderBottom: '1px solid #f0f0f0',
                    paddingBottom: 8
                  }}>
                    <h4 style={{ color: '#222', margin: 0, fontSize: '1.1rem' }}>
                      {vendor.name}
                      {filteredVendor.displayNote && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#666', 
                          fontWeight: 400,
                          marginLeft: 6
                        }}>
                          {filteredVendor.displayNote}
                        </span>
                      )}
                    </h4>
                  </div>
                  
                  {/* Dynamic booking display based on filter */}
                  {appliedFilters.status === 'completed' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 8 }}>
                      <div style={{ 
                        background: '#e8f5e9', 
                        padding: 6, 
                        borderRadius: 4, 
                        textAlign: 'center' 
                      }}>
                        <div style={{ fontWeight: 700, color: '#388e3c', fontSize: '1rem' }}>
                          {filteredVendor.totalBookings}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>Completed Bookings</div>
                      </div>
                    </div>
                  ) : appliedFilters.status === 'pending' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 8 }}>
                      <div style={{ 
                        background: '#fff3e0', 
                        padding: 6, 
                        borderRadius: 4, 
                        textAlign: 'center' 
                      }}>
                        <div style={{ fontWeight: 700, color: '#f57c00', fontSize: '1rem' }}>
                          {filteredVendor.totalBookings}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>Pending Bookings</div>
                      </div>
                    </div>
                  ) : appliedFilters.status === 'cancelled' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 8 }}>
                      <div style={{ 
                        background: '#ffebee', 
                        padding: 6, 
                        borderRadius: 4, 
                        textAlign: 'center' 
                      }}>
                        <div style={{ fontWeight: 700, color: '#d32f2f', fontSize: '1rem' }}>
                          {filteredVendor.totalBookings}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>Cancelled Bookings</div>
                      </div>
                    </div>
                  ) : appliedFilters.status === 'in-progress' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 8 }}>
                      <div style={{ 
                        background: '#f3e5f5', 
                        padding: 6, 
                        borderRadius: 4, 
                        textAlign: 'center' 
                      }}>
                        <div style={{ fontWeight: 700, color: '#7b1fa2', fontSize: '1rem' }}>
                          {filteredVendor.totalBookings}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>In-Progress Bookings</div>
                      </div>
                    </div>
                  ) : (
                    // Default view showing all booking types
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <div style={{ 
                        background: '#e3f2fd', 
                        padding: 6, 
                        borderRadius: 4, 
                        textAlign: 'center' 
                      }}>
                        <div style={{ fontWeight: 700, color: '#1976d2', fontSize: '1rem' }}>
                          {vendor.totalBookings || 0}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>Total</div>
                      </div>
                      <div style={{ 
                        background: '#e8f5e9', 
                        padding: 6, 
                        borderRadius: 4, 
                        textAlign: 'center' 
                      }}>
                        <div style={{ fontWeight: 700, color: '#388e3c', fontSize: '1rem' }}>
                          {vendor.completedBookings || 0}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>Completed</div>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ textAlign: 'center', padding: '6px', background: '#f8f9fa', borderRadius: 4 }}>
                    <div style={{ fontSize: '0.9rem', color: '#333' }}>
                      <strong>₹{vendor.totalEarnings?.toLocaleString() || 0}</strong>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>Total Earnings</div>
                  </div>
                  
                  <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#666' }}>
                    📞 {vendor.phone || vendor.contactNumber || 'N/A'}
                    {vendor.avp && (
                      <div style={{ marginTop: 4 }}>
                        👤 AVP: {typeof vendor.avp === 'object' ? vendor.avp.name : vendor.avp}
                      </div>
                    )}
                    {vendor.assignedAvp && (
                      <div style={{ marginTop: 4 }}>
                        👤 Assigned AVP: {typeof vendor.assignedAvp === 'object' ? vendor.assignedAvp.name : vendor.assignedAvp}
                      </div>
                    )}
                    {vendor.lastBookingDate && (
                      <div style={{ marginTop: 4 }}>
                        📅 Last: {new Date(vendor.lastBookingDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
          background: '#f8f9fa',
          borderRadius: 8,
          border: '1px solid #dee2e6'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              border: '3px solid #e3f2fd', 
              borderTop: '3px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px'
            }} />
            <div style={{ color: '#666', fontSize: '1rem' }}>
              Loading vendor data...
            </div>
          </div>
        </div>
      )}

      {/* Initial state message */}
      {!vendorData && !loading && (
        <div style={{ 
          background: '#f8f9fa', 
          borderRadius: 8, 
          padding: 24, 
          marginTop: 16,
          border: '1px solid #dee2e6',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#495057', marginBottom: 12 }}>
            🚗 Cab Driver Analytics
          </div>
          <div style={{ color: '#666', marginBottom: 12 }}>
            Loading vendor data...
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Dashboard Page ---
export default function NewDashboardPage() {

  // Tabs state
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  
  // Get analytics access from AuthContext
  const { getAnalyticsAccess } = useAuth();
  const analyticsAccess = getAnalyticsAccess();

  // Calculate available tabs based on permissions
  const availableTabs = React.useMemo(() => {
    const tabs = ['Overall'];
    if (analyticsAccess.showCabBookingAnalytics) {
      tabs.push('Cab Booking Analytics');
    }
    tabs.push('Leads, Schedule & Projects');
    return tabs;
  }, [analyticsAccess.showCabBookingAnalytics]);

  // Reset tab if current tab is no longer available
  React.useEffect(() => {
    if (tab >= availableTabs.length) {
      setTab(0);
    }
  }, [tab, availableTabs.length]);

  // --- Analytics API Integration ---
  // Overall analytics state
  const [overall, setOverall] = React.useState<any>(null);
  const [overallLoading, setOverallLoading] = React.useState(true);
  // Leads analytics state
  const [leadsAnalytics, setLeadsAnalytics] = React.useState<any>(null);
  const [leadsLoading, setLeadsLoading] = React.useState(true);
  // Schedule analytics state
  const [scheduleAnalytics, setScheduleAnalytics] = React.useState<any>(null);
  const [scheduleLoading, setScheduleLoading] = React.useState(true);

  // --- Leads by Source Metrics (API-based) ---
  const leadsBySourceMetrics = React.useMemo(() => {
    if (!leadsAnalytics) return { map: {}, sourcesOrder: [], slices: [] };
    const palette = ['#08c4a6', '#4285f4', '#ffca28', '#ff7f4e', '#a259e6', '#f06292', '#7cb342'];
    const slices = (leadsAnalytics.slices || []).map((s, idx) => ({ ...s, color: palette[idx % palette.length] }));
    return { ...leadsAnalytics, slices };
  }, [leadsAnalytics]);

  // Prevent duplicate API calls by using a ref
  const fetchedRef = React.useRef(false);
  React.useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setOverallLoading(true);
    setLeadsLoading(true);
    setScheduleLoading(true);
    Promise.all([
      fetch('/api/v0/analytics/overall').then(r => r.json()),
      fetch('/api/v0/analytics/leads').then(r => r.json()),
      fetch('/api/v0/analytics/schedule').then(r => r.json())
    ]).then(([overallData, leadsData, scheduleData]) => {
      setOverall({
        ...overallData,
        // Fallbacks for MoU stats if missing or null
        pendingMouTotal: typeof overallData?.pendingMouTotal === 'number' ? overallData.pendingMouTotal : (overallData?.mouList?.filter(m => m.status === 'Pending').length || 0),
        approvedMouTotal: typeof overallData?.approvedMouTotal === 'number' ? overallData.approvedMouTotal : (overallData?.mouList?.filter(m => m.status === 'Approved').length || 0),
        totalVendors: typeof overallData?.totalVendors === 'number' ? overallData.totalVendors : (overallData?.vendorDetails?.length || 0),
      });
      setLeadsAnalytics(leadsData);
      setScheduleAnalytics(scheduleData);
    }).finally(() => {
      setOverallLoading(false);
      setLeadsLoading(false);
      setScheduleLoading(false);
    });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
        Dashboard
      </Typography>
      <BoxMUI sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="Analytics Tabs">
          <Tab label="Overall" />
          {analyticsAccess.showCabBookingAnalytics && (
            <Tab label="Cab Booking Analytics" />
          )}
          <Tab label="Leads, Schedule & Projects" />
        </Tabs>
      </BoxMUI>
      {/* Tab Panels */}
      {tab === 0 && (
        <div>
          {/* Overall Section: Stat Cards Row */}
          <StatsCardsRow
            newLeads={overall?.newLeads}
            loadingNewLeads={overallLoading}
            siteVisitCount={overall?.siteVisitCount}
            siteVisitLoading={overallLoading}
            totalUsers={overall?.totalUsers}
            usersLoading={overallLoading}
            totalTeams={overall?.totalTeams}
            teamsLoading={overallLoading}
            vendorCount={overall?.totalVendors || overall?.totalCabVendors}
            totalBilling={overall?.totalBilling}
            pendingMouTotal={
              (overall?.pendingMouTotal && overall?.pendingMouTotal > 0)
                ? overall.pendingMouTotal
                : (overall?.mouList ? overall.mouList.filter(m => m.status === 'Pending').length : 0)
            }
            pendingMouLoading={overallLoading}
            approvedMouTotal={
              (overall?.approvedMouTotal && overall?.approvedMouTotal > 0)
                ? overall.approvedMouTotal
                : (overall?.mouList ? overall.mouList.filter(m => m.status === 'Approved').length : 0)
            }
            approvedMouLoading={overallLoading}
            showVendorBilling={analyticsAccess.showTotalVendorsBilling}
            showTotalUsers={analyticsAccess.showTotalUsers}
          />
        </div>
      )}
      {analyticsAccess.showCabBookingAnalytics && tab === 1 && (
        <div>
          {/* Vendor filter and list on top */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginBottom: 10 }}>
              Vendor Filter & List
            </div>
            <VendorBreakdown />
          </div>
          
          
        </div>
      )}
      {((analyticsAccess.showCabBookingAnalytics && tab === 2) || (!analyticsAccess.showCabBookingAnalytics && tab === 1)) && (
        <div>
          {/* Leads Details, Schedule This Week, and Projects Section */}
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              alignItems: 'start',
              width: '80%',
            }}
          >
            {/* Bar Chart */}
            <Card
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                minHeight: 400,
                height: '95%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              <CardContent sx={{ p: 0 }}>
                {/* --- Lead Generation Chart Header with Week/Month Dropdown --- */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 18px 0 0'
                }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: '#222', ml: 2 }}
                  >
                    Lead Conversion
                  </Typography>
                  <select
                    value={"month"}
                    onChange={() => {}}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid #ccc',
                      fontWeight: 500,
                      fontSize: '1rem',
                      color: '#222',
                      background: '#f7f9fa'
                    }}
                  >
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
                <LeadGenerationChart />
              </CardContent>
            </Card>
            {/* Schedule Card (moved here in place of Action Center) */}
            {analyticsAccess.showScheduleThisWeek && (
              <Card
                sx={{
                  minHeight: 320,
                  height: '95%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  width: '175%',
                  mr: 1
                }}
              >
                <CardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: 600, color: '#222' }}>Schedule In this Week</span>
                    <a href="/dashboard/leads" style={{ color: '#0792fa', fontWeight: 500, fontSize: '1rem', textDecoration: 'none' }}>View All</a>
                  </div>
                  <div>
                    {scheduleLoading && (
                      <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Loading schedule...</div>
                    )}
                    {!scheduleLoading && scheduleAnalytics && scheduleAnalytics.success && (
                      <div>
                        {/* Schedule Summary */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          <div style={{ 
                            background: '#e3f2fd', 
                            padding: '8px 12px', 
                            borderRadius: '6px', 
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#1976d2'
                          }}>
                            {scheduleAnalytics.totalScheduled} scheduled this week
                          </div>
                          {scheduleAnalytics.overdueCount > 0 && (
                            <div style={{ 
                              background: '#ffebee', 
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#d32f2f'
                            }}>
                              {scheduleAnalytics.overdueCount} overdue
                            </div>
                          )}
                        </div>
                        
                        {/* Schedule Items */}
                        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                          {scheduleAnalytics.leads && scheduleAnalytics.leads.length > 0 ? (
                            scheduleAnalytics.leads.slice(0, 8).map((lead: any, index: number) => {
                              const followUpDate = new Date(lead.nextFollowUp);
                              const isToday = followUpDate.toDateString() === new Date().toDateString();
                              const isTomorrow = followUpDate.toDateString() === new Date(Date.now() + 24*60*60*1000).toDateString();
                              
                              let dateLabel = followUpDate.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              });
                              if (isToday) dateLabel = 'Today';
                              else if (isTomorrow) dateLabel = 'Tomorrow';
                              
                              return (
                                <div key={lead.id} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '12px',
                                  marginBottom: '8px',
                                  background: isToday ? '#fff3e0' : '#f8f9fa',
                                  borderRadius: '8px',
                                  border: isToday ? '1px solid #ffcc02' : '1px solid #e9ecef',
                                  cursor: 'pointer'
                                }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ 
                                      fontWeight: 600, 
                                      color: '#222', 
                                      fontSize: '0.95rem',
                                      marginBottom: '2px'
                                    }}>
                                      {lead.fullName || 'Unknown'}
                                    </div>
                                    <div style={{ 
                                      fontSize: '0.8rem', 
                                      color: '#666',
                                      marginBottom: '4px'
                                    }}>
                                      {lead.phone} • {lead.source || 'No source'}
                                    </div>
                                    <div style={{ 
                                      fontSize: '0.75rem', 
                                      color: '#888'
                                    }}>
                                      {lead.assignedTo ? `Assigned to: ${lead.assignedTo.name}` : 'Unassigned'}
                                    </div>
                                  </div>
                                  <div style={{ 
                                    textAlign: 'right',
                                    minWidth: '80px'
                                  }}>
                                    <div style={{ 
                                      fontSize: '0.8rem', 
                                      fontWeight: 600,
                                      color: isToday ? '#f57c00' : '#666',
                                      marginBottom: '2px'
                                    }}>
                                      {dateLabel}
                                    </div>
                                    <div style={{ 
                                      fontSize: '0.75rem', 
                                      color: '#888'
                                    }}>
                                      {followUpDate.toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: true 
                                      })}
                                    </div>
                                    <div style={{
                                      fontSize: '0.7rem',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: lead.status === 'New' ? '#e3f2fd' : 
                                                lead.status === 'Contacted' ? '#e8f5e9' :
                                                lead.status === 'Site Visit' ? '#fff3e0' : '#f3e5f5',
                                      color: lead.status === 'New' ? '#1976d2' : 
                                            lead.status === 'Contacted' ? '#388e3c' :
                                            lead.status === 'Site Visit' ? '#f57c00' : '#7b1fa2',
                                      marginTop: '4px'
                                    }}>
                                      {lead.status}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ 
                              color: '#666', 
                              textAlign: 'center', 
                              padding: '40px 20px',
                              background: '#f8f9fa',
                              borderRadius: '8px',
                              border: '1px solid #e9ecef'
                            }}>
                              📅 No follow-ups scheduled for this week
                            </div>
                          )}
                          
                          {/* Show more indicator */}
                          {scheduleAnalytics.leads && scheduleAnalytics.leads.length > 8 && (
                            <div style={{ 
                              textAlign: 'center', 
                              padding: '8px',
                              color: '#666',
                              fontSize: '0.85rem'
                            }}>
                              +{scheduleAnalytics.leads.length - 8} more follow-ups this week
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {!scheduleLoading && (!scheduleAnalytics || !scheduleAnalytics.success) && (
                      <div style={{ 
                        color: '#d32f2f', 
                        textAlign: 'center', 
                        padding: '20px',
                        background: '#ffebee',
                        borderRadius: '8px',
                        border: '1px solid #ffcdd2'
                      }}>
                        Failed to load schedule data
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!analyticsAccess.showScheduleThisWeek && (
              <Card
                sx={{
                  minHeight: 320,
                  height: '95%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '175%',
                  mr: 1,
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6'
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#6c757d', marginBottom: 8 }}>
                    🔒 Access Restricted
                  </div>
                  <div style={{ color: '#6c757d', marginBottom: 16 }}>
                    You don't have permission to view Schedule This Week.
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#868e96' }}>
                    Contact your administrator to enable this access.
                  </div>
                </CardContent>
              </Card>
            )}
          </Box>
          <div style={{ display: 'flex', gap: '24px', margin: '32px 0', flexWrap: 'wrap', width: '100%', alignItems: 'stretch' }}>
            {/* Leads by Source Pie */}
            <div style={{ flex: '1 1 0', minWidth: 380, display: 'flex' }}>
              <Card sx={{ minHeight: 320, height: '100%', borderRadius: 0, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #eceff1', width: '100%' }}>
                <CardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#333' }}>Leads by Source</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>{leadsAnalytics?.totalLeads || 0} leads</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
                    <div style={{ width: 350, height: 350, margin: '0 auto' }}>
                      <LeadSourcesPieChart slices={leadsBySourceMetrics.slices} />
                    </div>
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
                                <div style={{ width: 12, height: 12, background: (leadsBySourceMetrics.slices.find(s=>s.label===src)?.color) || '#ddd', borderRadius: 3 }} />
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
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* SiteVisitConversionChart (kept on the right) */}
            <div style={{ flex: '1 1 0', minWidth: 380, display: 'flex' }}>
              <Card sx={{ minHeight: 320, height: '100%', borderRadius: 0, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #eceff1' }}>
                <CardContent>
                  <SiteVisitConversionChart />
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Project On Demand (top-most/project request section) */}
          <div style={{ width: '100%', margin: '32px 0', display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ width: '100%', maxWidth: '100%', borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #eceff1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#333', marginBottom: 16, width: '100%', textAlign: 'center' }}>Project On Demand</div>
                <ProjectPieChart />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Box>
  );
}

// --- ProjectPieChart: Pie chart for projects ---
const PROJECTS = [
  { name: 'Migsun', value: 35, color: '#4285f4' },
  { name: 'Dholera', value: 25, color: '#08c4a6' },
  { name: 'KW-6', value: 20, color: '#ffca28' },
  { name: 'Eco-village', value: 20, color: '#a259e6' },
];

const ProjectPieChart: React.FC = () => {
  const total = PROJECTS.reduce((acc, p) => acc + p.value, 0);
  // Make chart larger
  const cx = 160, cy = 160, r = 140;
  let angle = 0;
  const arcs = PROJECTS.map((p) => {
    const portion = (p.value / total) * 360;
    const startAngle = angle;
    const endAngle = angle + portion;
    const path = describeArc(cx, cy, r, startAngle, endAngle);
    angle += portion;
    return { path, color: p.color, name: p.name, value: p.value };
  });

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div style={{ flex: '0 0 auto' }}>
        <svg width={320} height={320} viewBox="0 0 320 320" role="img" aria-label="Project demand pie chart">
          <g>
            {arcs.map((a, idx) => (
              <path
                key={idx}
                d={a.path}
                fill={a.color}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </g>
          {/* donut center */}
          <circle cx={cx} cy={cy} r={85} fill="#fff" />
          <text x={cx} y={cy - 12} textAnchor="middle" style={{ fontSize: 28, fontWeight: 700, fill: '#222' }}>{total}</text>
          <text x={cx} y={cy + 24} textAnchor="middle" style={{ fontSize: 18, fill: '#666' }}>projects</text>
        </svg>
      </div>
      <div style={{ flex: '1 1 0', marginLeft: 36, display: 'flex', flexDirection: 'column', gap: 18, minWidth: 180 }}>
        {PROJECTS.map((p, idx) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, fontWeight: 500, color: '#333', borderRadius: 6, padding: '6px 10px' }}>
            <span style={{ width: 22, height: 22, background: p.color, display: 'inline-block', borderRadius: 4 }} />
            <span>{p.name}</span>
            <span style={{ marginLeft: 'auto', color: '#666', fontWeight: 400 }}>{((p.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};