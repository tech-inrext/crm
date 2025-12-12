"use client";
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Typography, Card, CardContent } from '@/components/ui/Component';

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
      minHeight: 100,
      padding: '0.75rem', // 12px
      minWidth: '0',
      width: '100%',
      boxSizing: 'border-box',
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs sm:text-sm text-gray-700 font-medium">{title}</div>
        <div className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div
        className={`flex items-center justify-center rounded-full ${iconBg}`}
        style={{ width: 32, height: 32 }}
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
  <div
    className="w-full"
    style={{
      marginBottom: 32,
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
    }}
  >
    {/* Responsive grid for tablet and desktop */}
    <style>{`
      @media (min-width: 640px) {
        .overall-cards-row {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }
      @media (min-width: 900px) {
        .overall-cards-row {
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
        }
      }
    `}</style>
    <div className="overall-cards-row" style={{ display: 'grid', gap: '1rem' }}>
      {showTotalUsers && (
        <StatCard
          title="Total Users"
          value={usersLoading ? 'Loading...' : (totalUsers ?? 0)}
          icon={<FaHome size={22} className="text-green-500" />}
          iconBg="bg-green-50"
        />
      )}


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
  </div>
);