"use client";

import React from "react";
import { Speed, CheckCircle, Moving, Assignment } from "@mui/icons-material";

interface ProductivityStatsProps {
  data: any;
  totalMOUs: number;
}

const ProductivityStats: React.FC<ProductivityStatsProps> = ({ data, totalMOUs }) => {
  const stats = [
    {
      title: "Total Actions Logged",
      value: (data?.totalLeads || 0) + (totalMOUs || 0),
      icon: <Assignment className="text-blue-500" />,
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-600",
    },
    {
      title: "Lead Engagement",
      value: data?.totalLeads || 0,
      icon: <Moving className="text-orange-500" />,
      bg: "bg-orange-50",
      border: "border-orange-100",
      text: "text-orange-600",
    },
    {
      title: "Closures Processed",
      value: totalMOUs || 0,
      icon: <CheckCircle className="text-green-500" />,
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-600",
    },
  ];

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Speed className="text-blue-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Recent Productivity</h6>
      </div>

      <div className="flex flex-col gap-4 flex-1 justify-center">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all hover:scale-[1.02] ${stat.bg} ${stat.border}`}
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/60 flex items-center justify-center">
                {stat.icon}
              </div>
              <span className="font-bold text-gray-700 text-sm">{stat.title}</span>
            </div>
            <span className={`font-extrabold text-2xl ${stat.text}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductivityStats;
