"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ScheduleCard from './components/ScheduleCard';
import { FaUsers, FaHome, FaDollarSign, FaBuilding } from "react-icons/fa";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  trend?: {
    today: number;
    yesterday: number;
    beforeYesterday?: number;
  };
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBg, trend }) => {
  let trendDisplay: React.ReactNode = null;
  if (trend && typeof trend.today === 'number' && typeof trend.yesterday === 'number') {
    const diff = trend.today - trend.yesterday;
    const isActiveLeads = title === 'Active Leads';
    const isUpcomingSiteVisits = title === 'Upcoming Site Visits';
    if ((isActiveLeads || isUpcomingSiteVisits) && diff === 1) {
      trendDisplay = (
        <Typography sx={{ color: 'success.main', fontSize: 13, display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <span style={{ fontWeight: 600 }}>1 new</span>
          <span style={{ marginLeft: 4, color: '#888' }}>today</span>
        </Typography>
      );
    } else if ((isActiveLeads || isUpcomingSiteVisits) && diff === -1) {
      trendDisplay = (
        <Typography sx={{ color: 'error.main', fontSize: 13, display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <span style={{ fontWeight: 600 }}>1 less</span>
          <span style={{ marginLeft: 4, color: '#888' }}>today</span>
        </Typography>
      );
    } else if (diff > 0) {
      trendDisplay = (
        <Typography sx={{ color: 'success.main', fontSize: 13, display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <span style={{ fontSize: '1rem', marginRight: 2 }}>↑</span>
          <span style={{ fontWeight: 600 }}>{diff} new</span>
          <span style={{ marginLeft: 4, color: '#888' }}>today</span>
        </Typography>
      );
    } else if (diff < 0) {
      trendDisplay = (
        <Typography sx={{ color: 'error.main', fontSize: 13, display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <span style={{ fontSize: '1rem', marginRight: 2 }}>↓</span>
          <span style={{ fontWeight: 600 }}>{Math.abs(diff)} less</span>
          <span style={{ marginLeft: 4, color: '#888' }}>today</span>
        </Typography>
      );
    } else {
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
    // New trend props
    trend = {},
    trendLeads = {},
  } = props;

  // Only count leads with these statuses for Active Leads
  // leadStatuses = ["new", "follow-up", "call back", "details shared"]
  const activeLeads =
    (newLeads ?? 0) +
    (followUpLeads ?? 0) +
    (callBackLeads ?? 0) +
    (detailsSharedLeads ?? 0);

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
            trend={trend?.totalUsers}
          />
          <StatCard
            title="Active Leads"
            value={loadingNewLeads ? 'Loading...' : activeLeads}
            icon={<FaUsers size={24} style={{ color: '#2196f3' }} />}
            iconBg="#e3f2fd"
            trend={trendLeads?.activeLeads}
          />
          <StatCard
            title="Upcoming Site Visits"
            value={siteVisitLoading ? 'Loading...' : (siteVisitCount ?? 0)}
            icon={<FaDollarSign size={24} style={{ color: '#8e24aa' }} />}
            iconBg="#f3e5f5"
            trend={trend?.siteVisitCount}
          />
          <StatCard
            title="MoUs (Pending / Completed)"
            value={pendingMouLoading || approvedMouLoading ? 'Loading...' : `${pendingMouTotal ?? 0} / ${approvedMouTotal ?? 0}`}
            icon={<FaUsers size={24} style={{ color: '#3949ab' }} />}
            iconBg="#e8eaf6"
            trend={trend?.pendingMouTotal}
          />
          {showVendorBilling && (
            <StatCard
              title="Total Vendors & Billing amount"
              value={`${(typeof vendorCount === 'number' ? vendorCount : 0) || 0} / ${typeof totalBilling === 'number' ? `₹${totalBilling.toLocaleString()}` : (totalBilling ?? '₹0')}`}
              icon={<FaBuilding size={24} style={{ color: '#ffb300' }} />}
              iconBg="#fffde7"
              trend={trend?.totalVendors}
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
 
 