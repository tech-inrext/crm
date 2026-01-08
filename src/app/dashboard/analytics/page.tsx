"use client";
import React from 'react';
// Removed MUI Tabs and Tab
import BoxMUI from '@/components/ui/Component/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Typography, Card, CardContent } from '@/components/ui/Component';
import PermissionGuard from "@/components/PermissionGuard";
import LeadGenerationChart from '../analytics/Charts/LeadGenerationChart';
import {StatsCardsRow} from '../analytics/Statcard';
import {VendorBreakdown} from '../analytics/Cab/Cabvendor'
// NOTE: The cabBookingAnalyticsWorker runs on the backend and should NOT be imported here.
// It is started in the backend (e.g., in src/workers/worker.js or a server process).
import SiteVisitConversionChart from './Charts/SiteVisitConversionChart';
import {PropertyPieChart} from './Charts/Propertychart'
import LeadSourcesPieChart from './components/LeadSourcesPieChart';
import ScheduleCard from './components/ScheduleCard';
import LeadsBySourceList from './components/LeadsBySourceList';
export default function NewDashboardPage() {
   const [section, setSection] = React.useState(0);
   const { getAnalyticsAccess } = useAuth();
  const analyticsAccess = getAnalyticsAccess();
   const availableSections = React.useMemo(() => {
    const sections = ['Overview'];
    if (analyticsAccess.showCabBookingAnalytics) {
      sections.push('Cab Booking Analytics');
    }
    sections.push('Leads & Projects');
    return sections;
  }, [analyticsAccess.showCabBookingAnalytics]);
      React.useEffect(() => {
    if (section >= availableSections.length) {
      setSection(0);
    }
  }, [section, availableSections.length]);
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
      fetch('/api/v0/analytics/vendor').then(r => r.json()),
      fetch('/api/v0/employee/teams').then(r => r.json()),
    ]).then(([overallData, leadsData, scheduleData, managerMouStats, vendorStats, teamsData]) => {
      setOverall({
        ...overallData,
        // Use manager MoU stats for stat card
        managerMouStats,
        myTeamsCount: teamsData?.myTeamsCount ?? 0,
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
      <Box className="p-3 sm:p-6 md:p-8 overflow-hidden">
        <Typography variant="h4" className="font-bold text-[#1a1a1a] mb-4 text-2xl sm:text-3xl md:text-4xl">
          Dashboard
        </Typography>
        {/* <div className="h-3" /> */}
        <BoxMUI className="border-b border-gray-200 mb-4">
          <Tabs
            value={section}
            onChange={(_, newValue) => setSection(newValue)}
            aria-label="Analytics Tabs"
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {availableSections.map((label, idx) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </BoxMUI>
        {/* Section Panels */}
        {section === 0 && (
          <div>
            <StatsCardsRow
              newLeads={leadsAnalytics?.newLeads}
              callBackLeads={leadsAnalytics?.callBackLeads}
              followUpLeads={leadsAnalytics?.followUpLeads}
              detailsSharedLeads={leadsAnalytics?.detailsSharedLeads}
              loadingNewLeads={leadsLoading}
              siteVisitCount={overall?.siteVisitCount}
              siteVisitLoading={overallLoading}
              totalUsers={overall?.totalUsers}
              usersLoading={overallLoading}
              totalTeams={overall?.totalTeams}
              teamsLoading={overallLoading}
              vendorCount={overall?.totalVendors || overall?.totalCabVendors}
              totalBilling={overall?.totalBilling}
              pendingMouTotal={overall?.mouStats?.pending ?? 0}
              pendingMouLoading={overallLoading}
              approvedMouTotal={overall?.mouStats?.approved ?? 0}
              approvedMouLoading={overallLoading}
              showVendorBilling={analyticsAccess.showTotalVendorsBilling}
              showTotalUsers={analyticsAccess.showTotalUsers}
              scheduleLoading={scheduleLoading}
              scheduleAnalytics={scheduleAnalytics}
              analyticsAccess={analyticsAccess}
              trend={overall?.trend}
              trendLeads={{
                callBackLeads: leadsAnalytics?.trend?.callBackLeads,
                followUpLeads: leadsAnalytics?.trend?.followUpLeads,
                detailsSharedLeads: leadsAnalytics?.trend?.detailsSharedLeads,
                siteVisitCount: overall?.trend?.siteVisitCount,
                activeLeads: (leadsAnalytics?.trend && overall?.trend)
                  ? {
                      today:
                        (leadsAnalytics?.trend?.callBackLeads?.today ?? 0) +
                        (leadsAnalytics?.trend?.followUpLeads?.today ?? 0) +
                        (leadsAnalytics?.trend?.detailsSharedLeads?.today ?? 0) +
                        (overall?.trend?.siteVisitCount?.today ?? 0),
                      yesterday:
                        (leadsAnalytics?.trend?.callBackLeads?.yesterday ?? 0) +
                        (leadsAnalytics?.trend?.followUpLeads?.yesterday ?? 0) +
                        (leadsAnalytics?.trend?.detailsSharedLeads?.yesterday ?? 0) +
                        (overall?.trend?.siteVisitCount?.yesterday ?? 0),
                      beforeYesterday:
                        (leadsAnalytics?.trend?.callBackLeads?.beforeYesterday ?? 0) +
                        (leadsAnalytics?.trend?.followUpLeads?.beforeYesterday ?? 0) +
                        (leadsAnalytics?.trend?.detailsSharedLeads?.beforeYesterday ?? 0) +
                        (overall?.trend?.siteVisitCount?.beforeYesterday ?? 0),
                    }
                  : undefined,
              }}
            />
          </div>
        )}
        {analyticsAccess.showCabBookingAnalytics && section === 1 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#222', marginBottom: 10 }}>
                Vendor Filter & List
              </div>
              <VendorBreakdown />
              <div style={{ marginTop: 24 }}>
                <a
                  href={(() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    return `/api/v0/analytics/cab-booking-excel?year=${year}&month=${month}&ts=${Date.now()}`;
                  })()}
                  download
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
                  Download This Month's Cab Booking Excel
                </a>
              </div>
            </div>
          </div>
        )}
        {((analyticsAccess.showCabBookingAnalytics && section === 2) || (!analyticsAccess.showCabBookingAnalytics && section === 1)) && (
          <div>
            <div className="flex flex-wrap gap-6 my-8 w-full items-stretch">
              {/* Lead Conversion Card */}
              <div className="flex flex-col min-w-[380px] flex-1">
                <Card className="min-h-[400px] h-full rounded-none shadow-sm border border-gray-200 w-full flex flex-col flex-1">
                  <CardContent className="p-0 h-full flex flex-col justify-start">
                    <div className="flex justify-between items-center px-0 pt-4 pb-0">
                      <Typography variant="h5" className="font-semibold text-[#222] ml-2">Lead Conversion</Typography>
                      <select
                        value={leadConversionPeriod}
                        onChange={(e) => setLeadConversionPeriod(e.target.value as 'week' | 'month')}
                        className="px-3 py-1 rounded border border-gray-300 font-medium text-base text-[#222] bg-[#f7f9fa]"
                      >
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                      </select>
                    </div>
                    <LeadGenerationChart period={leadConversionPeriod} />
                  </CardContent>
                </Card>
              </div>
              {/* Property On Demand Card */}
              <div className="flex flex-col min-w-[380px] flex-1">
                <Card className="min-h-[400px] h-full rounded-none shadow-sm border border-gray-200 w-full flex justify-center items-center flex-1">
                  <CardContent className="w-full flex flex-col items-center justify-center">
                    <div className="text-[1.3rem] font-bold text-[#333] mb-4 w-full text-center">Property On Demand</div>
                    <PropertyPieChart propertyData={propertyMetrics} />
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 my-8 w-full items-stretch">
              <div className="flex flex-col min-w-[380px] flex-1">
                <Card className="min-h-[400px] h-full rounded-none shadow-sm border border-gray-200 w-full flex flex-col flex-1">
                  <CardContent className="h-full flex flex-col justify-start">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-[1.3rem] font-bold text-[#333] text-center">Leads by Source</div>
                      <div className="text-sm text-[#666]">{leadsAnalytics?.totalLeads || 0} leads</div>
                    </div>
                    <div className="flex flex-col items-center gap-4 w-full flex-1">
                      <div className="w-[350px] h-[350px] mx-auto">
                        <LeadSourcesPieChart slices={leadsBySourceMetrics.slices} />
                      </div>
                      <LeadsBySourceList leadsBySourceMetrics={leadsBySourceMetrics} />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex flex-col min-w-[380px] flex-1">
                <Card className="min-h-[400px] h-full rounded-none shadow-sm border border-gray-200 w-full flex flex-col flex-1">
                  <CardContent className="h-full flex flex-col justify-start">
                    <SiteVisitConversionChart />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </Box>
    </PermissionGuard>
  );
}