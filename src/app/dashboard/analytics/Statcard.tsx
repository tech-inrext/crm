"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ScheduleCard from './components/ScheduleCard';
import { FaUsers, FaHome, FaDollarSign, FaBuilding } from "react-icons/fa";
type TrendItem = {
  date: string; // ISO date string
  value: number;
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  trend?: TrendItem[]; // Array of trend items for last N days (sorted desc)
};


const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBg, trend }) => {
  let trendDisplay: React.ReactNode = null;

  // Helper to get date label (Today, Yesterday, X days ago)
  function getDateLabel(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - dateCopy.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (dateCopy.toDateString() === today.toDateString()) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
    return dateCopy.toLocaleDateString();
  }

  // Show only the most recent non-zero trend value, or 'No change today' if all are zero
  if (trend && Array.isArray(trend) && trend.length > 0) {
    // Sort trend by date descending (latest first)
    const sortedTrend = [...trend].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const isActiveLeads = title === 'Active Leads';
    // Find the most recent non-zero value
    const mostRecent = sortedTrend.slice(0, 3).find(item => item.value > 0);
    if (mostRecent) {
      const label = getDateLabel(new Date(mostRecent.date));
      trendDisplay = (
        <Typography sx={{ color: isActiveLeads ? 'success.main' : '#888', fontSize: 13, display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <span style={{ fontWeight: 600 }}>{mostRecent.value} new</span>
          <span style={{ marginLeft: 4, color: '#888' }}>{label}</span>
        </Typography>
      );
    } else {
      // If all are zero, show no change for today
      trendDisplay = (
        <Typography sx={{ color: '#888', fontSize: 13, display: 'flex', alignItems: 'center', mt: 0.5 }}>
          — No change today
        </Typography>
      );
    }
  }

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2,
        border: '1px solid #f0f0f0',
        background: '#fff',
        minHeight: 130,
        minWidth: 0,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        px: 2,
        py: 2,
        boxShadow: '0 2px 8px 0 rgba(99, 99, 99, 0.04)',
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 }, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: { xs: 11, sm: 13 } }}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, fontSize: { xs: 22, sm: 24 }, color: '#1a1a1a' }}>
              {value}
            </Typography>
            {trendDisplay}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: iconBg || '#fffbe6',
              width: 40,
              height: 40,
              boxShadow: '0 2px 8px 0 rgba(99, 99, 99, 0.04)',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

type StatsCardsRowProps = {
  newLeads?: number | null;
  callBackLeads?: number | null;
  followUpLeads?: number | null;
  detailsSharedLeads?: number | null;
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
  scheduleLoading?: boolean;
  scheduleAnalytics?: any;
  analyticsAccess?: any;
  trend?: any;
  trendLeads?: any;
}



export const StatsCardsRow: React.FC<StatsCardsRowProps> = (props) => {
  const {
    newLeads = 0,
    callBackLeads = 0,
    followUpLeads = 0,
    detailsSharedLeads = 0,
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
    showTotalUsers = false,
    scheduleLoading = false,
    scheduleAnalytics = null,
    analyticsAccess = null,
    trend = {},
    trendLeads = {},
  } = props;

  // Only count leads with these statuses for Active Leads
  const activeLeads =
    (newLeads ?? 0) +
    (followUpLeads ?? 0) +
    (callBackLeads ?? 0) +
    (detailsSharedLeads ?? 0);

  // Helper to convert old trend object to array format
  function trendObjToArray(trendObj: any, dateMap?: Record<string, string>): TrendItem[] | undefined {
    if (!trendObj) return undefined;
    // If already array, return as is
    if (Array.isArray(trendObj)) return trendObj;
    // Otherwise, convert { today, yesterday, beforeYesterday } to array
    const arr: TrendItem[] = [];
    if (trendObj.today !== undefined) {
      arr.push({ date: dateMap?.today || getDateNDaysAgo(0), value: trendObj.today });
    }
    if (trendObj.yesterday !== undefined) {
      arr.push({ date: dateMap?.yesterday || getDateNDaysAgo(1), value: trendObj.yesterday });
    }
    if (trendObj.beforeYesterday !== undefined) {
      arr.push({ date: dateMap?.beforeYesterday || getDateNDaysAgo(2), value: trendObj.beforeYesterday });
    }
    return arr.length > 0 ? arr : undefined;
  }

  // Helper to get ISO date string for N days ago
  function getDateNDaysAgo(n: number) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  // Prepare trend arrays for each stat
  const totalUsersTrend = trendObjToArray(trend?.totalUsers);
  const siteVisitTrend = trendObjToArray(trend?.siteVisitCount);
  const pendingMouTrend = trendObjToArray(trend?.pendingMouTotal);
  const totalVendorsTrend = trendObjToArray(trend?.totalBilling);
  // For activeLeads, sum up trends for each status if available
  let activeLeadsTrend: TrendItem[] | undefined = undefined;
  if (trendLeads?.activeLeads) {
    // If already array, use as is
    if (Array.isArray(trendLeads.activeLeads)) {
      activeLeadsTrend = trendLeads.activeLeads;
    } else {
      // Otherwise, try to sum up trends for each day
      const days = ['today', 'yesterday', 'beforeYesterday'];
      activeLeadsTrend = days.map((day, idx) => {
        const value =
          (trendLeads?.newLeads?.[day] ?? 0) +
          (trendLeads?.callBackLeads?.[day] ?? 0) +
          (trendLeads?.followUpLeads?.[day] ?? 0) +
          (trendLeads?.detailsSharedLeads?.[day] ?? 0);
        return { date: getDateNDaysAgo(idx), value };
      });
    }
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          width: '100%',
        }}
      >
        {/* Stat Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          <StatCard
            title="Total Users"
            value={usersLoading ? 'Loading...' : (totalUsers ?? 0)}
            icon={<FaHome size={24} style={{ color: '#4caf50' }} />}
            iconBg="#e8f5e9"
            trend={totalUsersTrend}
          />
          <StatCard
            title="Active Leads"
            value={loadingNewLeads ? 'Loading...' : activeLeads}
            icon={<FaUsers size={24} style={{ color: '#2196f3' }} />}
            iconBg="#e3f2fd"
            trend={activeLeadsTrend}
          />
          <StatCard
            title="Upcoming Site Visits"
            value={siteVisitLoading ? 'Loading...' : (siteVisitCount ?? 0)}
            icon={<FaDollarSign size={24} style={{ color: '#8e24aa' }} />}
            iconBg="#f3e5f5"
            trend={siteVisitTrend}
          />
          <StatCard
            title="MoUs (Pending / Completed)"
            value={pendingMouLoading || approvedMouLoading ? 'Loading...' : `${pendingMouTotal ?? 0} / ${approvedMouTotal ?? 0}`}
            icon={<FaUsers size={24} style={{ color: '#3949ab' }} />}
            iconBg="#e8eaf6"
            trend={pendingMouTrend}
          />
          {showVendorBilling && (
            <StatCard
              title="Total Vendors & Billing amount"
              value={`${(typeof vendorCount === 'number' ? vendorCount : 0) || 0} / ${typeof totalBilling === 'number' ? `₹${totalBilling.toLocaleString()}` : (totalBilling ?? '₹0')}`}
              icon={<FaBuilding size={24} style={{ color: '#ffb300' }} />}
              iconBg="#fffde7"
              trend={totalVendorsTrend}
            />
          )}
        </Box>
        {/* Schedule Card */}
        <Box sx={{ width: '100%', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafbfc', borderRadius: 2 }}>
          <ScheduleCard
            analyticsAccess={analyticsAccess}
            scheduleLoading={scheduleLoading}
            scheduleAnalytics={scheduleAnalytics}
          />
        </Box>
      </Box>
    </Box>
  );
};
 
 