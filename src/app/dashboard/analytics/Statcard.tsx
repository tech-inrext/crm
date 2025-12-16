"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Typography, Card, CardContent } from '@/components/ui/Component';
import ScheduleCard from './components/ScheduleCard';

import { FaUsers, FaHome, FaDollarSign, FaBuilding } from "react-icons/fa";
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
    className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white shadow-sm"
    style={{
      minHeight: 80,
      padding: '0.5rem', // 8px
      minWidth: '0',
      width: '100%',
      boxSizing: 'border-box',
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[11px] sm:text-xs text-gray-700 font-medium">{title}</div>
        <div className="mt-1 text-lg sm:text-xl font-bold text-gray-900">{value}</div>
      </div>
      <div
        className={`flex items-center justify-center rounded-full ${iconBg}`}
        style={{ width: 28, height: 28 }}
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

export const StatsCardsRow: React.FC<StatsCardsRowProps> = (props) => {
  const {
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
    showTotalUsers = false,
    scheduleLoading = false,
    scheduleAnalytics = null,
    analyticsAccess = null
  } = props;
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Left: Stat Cards - 2 in a row, 50% width */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <StatCard
              title="Total Users"
              value={usersLoading ? 'Loading...' : (totalUsers ?? 0)}
              icon={<FaHome size={20} className="text-green-500" />}
              iconBg="bg-green-50"
            />
            <StatCard
              title="New Leads"
              value={loadingNewLeads ? 'Loading...' : (newLeads ?? 0)}
              icon={<FaUsers size={20} className="text-blue-500" />}
              iconBg="bg-blue-50"
            />
            <StatCard
              title="Upcoming Site Visits"
              value={siteVisitLoading ? 'Loading...' : (siteVisitCount ?? 0)}
              icon={<FaDollarSign size={20} className="text-purple-500" />}
              iconBg="bg-purple-50"
            />
            <StatCard
              title="MoUs (Pending / Completed)"
              value={pendingMouLoading || approvedMouLoading ? 'Loading...' : `${pendingMouTotal ?? 0} / ${approvedMouTotal ?? 0}`}
              icon={<FaUsers size={20} className="text-indigo-600" />}
              iconBg="bg-indigo-50"
            />
            {showVendorBilling && (
              <StatCard
                title="Total Vendors & Billing amount"
                value={`${(typeof vendorCount === 'number' ? vendorCount : 0) || 0} / ${typeof totalBilling === 'number' ? `₹${totalBilling.toLocaleString()}` : (totalBilling ?? '₹0')}`}
                icon={<FaBuilding size={20} className="text-yellow-500" />}
                iconBg="bg-yellow-50"
              />
            )}
          </Box>
        </Box>
        {/* Right: ScheduleCard - 50% width */}
        <Box sx={{  minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafbfc', width: '100%' }}>
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
 
 