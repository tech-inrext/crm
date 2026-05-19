"use client";

import React from "react";
import { PhoneCallback, EventAvailable, TrendingUp, Today } from "@mui/icons-material";

interface ActivityStats {
  callBackCount: number;
  siteVisitCount: number;
  overdueCount: number;
  total: number;
}

interface ActivityCardsProps {
  stats: ActivityStats | null;
}

const ActivityCards: React.FC<ActivityCardsProps> = ({ stats }) => {
  const items = [
    {
      title: "Call Backs",
      value: stats?.callBackCount || 0,
      icon: <PhoneCallback className="text-blue-500" />,
      colorClass: "bg-blue-50 border-blue-100",
      textClass: "text-blue-600",
      label: "Scheduled Today",
    },
    {
      title: "Site Visits",
      value: stats?.siteVisitCount || 0,
      icon: <EventAvailable className="text-green-500" />,
      colorClass: "bg-green-50 border-green-100",
      textClass: "text-green-600",
      label: "Scheduled Today",
    },
    {
      title: "Overdue",
      value: stats?.overdueCount || 0,
      icon: <TrendingUp className="text-red-500 rotate-90" />,
      colorClass: "bg-red-50 border-red-100",
      textClass: "text-red-600",
      label: "Missed Follow-ups",
    },
  ];

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Today className="text-gray-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Today&apos;s Focus</h6>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {items.map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border flex items-center gap-4 transition-all hover:scale-[1.02] ${item.colorClass}`}
          >
            <div className={`p-2 rounded-lg bg-white/50 flex items-center justify-center`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-700 text-sm truncate">{item.title}</span>
                <span className={`font-extrabold text-xl ${item.textClass}`}>{item.value}</span>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityCards;
