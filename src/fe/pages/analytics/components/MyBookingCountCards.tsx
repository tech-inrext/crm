"use client";

import React from "react";
import {
  DirectionsCar,
  HourglassEmpty,
  CheckCircle,
  Cancel,
  AccountBalanceWallet,
  Person,
} from "@mui/icons-material";

export interface MyBookingStats {
  totalBookings: number;
  pending: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
  statusBreakdown?: {
    pending?: number;
    approved?: number;
    active?: number;
    completed?: number;
    cancelled?: number;
    rejected?: number;
  };
}

interface MyBookingCountCardsProps {
  stats?: MyBookingStats;
}

const MyBookingCountCards: React.FC<MyBookingCountCardsProps> = ({ stats }) => {
  const total = stats?.totalBookings || 0;
  const pending = stats?.pending || 0;
  const completed = stats?.completed || 0;
  const cancelled = stats?.cancelled || 0;
  const totalSpent = stats?.totalSpent || 0;

  const cards = [
    {
      title: "My Total Bookings",
      value: total,
      subtext: "Total requests submitted",
      icon: <DirectionsCar className="text-blue-600 text-xl" />,
      colorBg: "bg-blue-50/80 border-blue-100",
      textColor: "text-blue-700",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      title: "Pending / Active",
      value: pending,
      subtext: `${stats?.statusBreakdown?.approved || 0} Approved • ${stats?.statusBreakdown?.active || 0} Active`,
      icon: <HourglassEmpty className="text-amber-500 text-xl" />,
      colorBg: "bg-amber-50/80 border-amber-100",
      textColor: "text-amber-700",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      title: "Completed Trips",
      value: completed,
      subtext: total > 0 ? `${Math.round((completed / total) * 100)}% completion rate` : "No trips completed yet",
      icon: <CheckCircle className="text-emerald-500 text-xl" />,
      colorBg: "bg-emerald-50/80 border-emerald-100",
      textColor: "text-emerald-700",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "Cancelled / Rejected",
      value: cancelled,
      subtext: `${stats?.statusBreakdown?.rejected || 0} Rejected by Manager`,
      icon: <Cancel className="text-rose-500 text-xl" />,
      colorBg: "bg-rose-50/80 border-rose-100",
      textColor: "text-rose-700",
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      title: "My Cab Expenses",
      value: `₹${totalSpent.toLocaleString("en-IN")}`,
      subtext: "Total fare spent on completed visits",
      icon: <AccountBalanceWallet className="text-indigo-600 text-xl" />,
      colorBg: "bg-indigo-50/80 border-indigo-100",
      textColor: "text-indigo-700",
      badgeColor: "bg-indigo-100 text-indigo-800",
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Person className="text-lg" />
          </div>
          <div>
            <h5 className="font-bold text-gray-800 text-base tracking-tight">My Booking Count & Summary</h5>
            <p className="text-xs text-gray-500">Your personal cab booking statistics and status overview</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
          Personal Metrics
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 hover:shadow-md ${card.colorBg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 tracking-wide">{card.title}</span>
              <div className="p-1.5 bg-white rounded-lg shadow-2xs flex items-center justify-center">
                {card.icon}
              </div>
            </div>

            <div>
              <div className={`text-2xl font-extrabold mb-1 ${card.textColor}`}>
                {card.value}
              </div>
              <p className="text-[11px] text-gray-500 font-medium truncate" title={card.subtext}>
                {card.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookingCountCards;
