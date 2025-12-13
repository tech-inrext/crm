"use client";
import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import BoxMUI from '@mui/material/Box';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Typography, Card, CardContent } from '@/components/ui/Component';
import PermissionGuard from "@/components/PermissionGuard";
import LeadGenerationChart from '../analytics/Charts/LeadGenerationChart';
import {StatsCardsRow} from '../analytics/Statcard';
import {VendorBreakdown} from '../analytics/Cab/Cabvendor'
import SiteVisitConversionChart from './Charts/SiteVisitConversionChart';
import {PropertyPieChart} from './Charts/Propertychart'
import LeadSourcesPieChart from './components/LeadSourcesPieChart';
import ScheduleCard from './components/ScheduleCard';
import LeadsBySourceList from './components/LeadsBySourceList';

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
  // Lead Conversion chart period (week or month)
  const [leadConversionPeriod, setLeadConversionPeriod] = React.useState<'week' | 'month'>('month');
  // --- Leads by Source Metrics (API-based) ---
  const leadsBySourceMetrics = React.useMemo(() => {
    if (!leadsAnalytics) return { map: {}, sourcesOrder: [], slices: [] };
    const palette = ['#08c4a6', '#4285f4', '#ffca28', '#ff7f4e', '#a259e6', '#f06292', '#7cb342'];
    const slices = (leadsAnalytics.slices || []).map((s, idx) => ({ ...s, color: palette[idx % palette.length] }));
    return { ...leadsAnalytics, slices };
  }, [leadsAnalytics]);
  // --- Property Data Metrics (API-based) ---
  const propertyMetrics = React.useMemo(() => {
    if (!leadsAnalytics || !leadsAnalytics.propertyData) return [];
    const palette = ['#4285f4', '#08c4a6', '#a259e6', '#ff7f4e', '#ffca28'];
    return (leadsAnalytics.propertyData || []).map((p, idx) => ({
      ...p,
      color: palette[idx % palette.length]
    }));
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
      fetch('/api/v0/analytics/schedule').then(r => r.json()),
      fetch('/api/v0/employee/managerMouStats').then(r => r.json()),
      fetch('/api/v0/analytics/vendor').then(r => r.json())
    ]).then(([overallData, leadsData, scheduleData, managerMouStats, vendorStats]) => {
      setOverall({
        ...overallData,
        // Use manager MoU stats for stat card
        pendingMouTotal: typeof managerMouStats?.pending === 'number' ? managerMouStats.pending : (overallData?.pendingMouTotal ?? (overallData?.mouList?.filter(m => m.status === 'Pending').length || 0)),
        approvedMouTotal: typeof managerMouStats?.approved === 'number' ? managerMouStats.approved : (overallData?.approvedMouTotal ?? (overallData?.mouList?.filter(m => m.status === 'Approved').length || 0)),
        // Use vendor stats from backend
        totalVendors: typeof vendorStats?.totalVendors === 'number' ? vendorStats.totalVendors : (overallData?.totalVendors ?? 0),
        totalBilling: Array.isArray(vendorStats?.allVendors)
          ? vendorStats.allVendors.reduce((sum, v) => sum + (v.totalEarnings || 0), 0)
          : (overallData?.totalBilling ?? 0),
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
    <PermissionGuard module="analytics" action="read">
      <Box sx={{
        p: { xs: 1, sm: 2, md: 3 },
        overflow: 'hidden'
      }}>
        <Typography variant="h4" sx={{
          fontWeight: 700,
          color: '#1a1a1a',
          mb: 2,
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
        }}>
          Dashboard
        </Typography>
        <div style={{ height: 12 }} />
        <BoxMUI sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
          '.MuiTabs-root': {
            minHeight: { xs: '40px', sm: '48px' }
          },
          '.MuiTab-root': {
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            padding: { xs: '6px 12px', sm: '12px 16px' },
            minHeight: { xs: '40px', sm: '48px' }
          }
        }}>
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
            <Box
              sx={{
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                alignItems: 'start',
                width: { xs: '100%', md: '80%' }
              }}
            >
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
                      value={leadConversionPeriod}
                      onChange={(e) => setLeadConversionPeriod(e.target.value as 'week' | 'month')}
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
                  <LeadGenerationChart period={leadConversionPeriod} />
                </CardContent>
              </Card>
              <ScheduleCard
                analyticsAccess={analyticsAccess}
                scheduleLoading={scheduleLoading}
                scheduleAnalytics={scheduleAnalytics}
              />
            </Box>
            <div
              style={{
                display: 'flex',
                gap: '24px',
                margin: '32px 0',
                flexWrap: 'wrap',
                width: '100%',
                alignItems: 'stretch',
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: '380px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Card
                  sx={{
                    minHeight: 400,
                    height: '100%',
                    borderRadius: 0,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    border: '1px solid #eceff1',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#333' }}>Leads by Source</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>{leadsAnalytics?.totalLeads || 0} leads</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', flex: 1 }}>
                      <div style={{ width: 350, height: 350, margin: '0 auto' }}>
                        <LeadSourcesPieChart slices={leadsBySourceMetrics.slices} />
                      </div>
                      <LeadsBySourceList leadsBySourceMetrics={leadsBySourceMetrics} />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: '380px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Card
                  sx={{
                    minHeight: 400,
                    height: '100%',
                    borderRadius: 0,
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    border: '1px solid #eceff1',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <SiteVisitConversionChart />
                  </CardContent>
                </Card>
              </div>
            </div>
            <div style={{ width: '100%', margin: '32px 0', display: 'flex', justifyContent: 'center' }}>
              <Card sx={{ width: '100%', maxWidth: '100%', borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #eceff1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CardContent sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#333', marginBottom: 16, width: '100%', textAlign: 'center' }}>Property On Demand</div>
                  <PropertyPieChart propertyData={propertyMetrics} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </Box>
    </PermissionGuard>
  );
}