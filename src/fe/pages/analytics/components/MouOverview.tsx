"use client";

import React from "react";
import { Description } from "@mui/icons-material";

interface MouOverviewProps {
  data: Record<string, number> | null;
  total: number;
}

const MouOverview: React.FC<MouOverviewProps> = ({ data, total }) => {
  const stages = [
    { label: "Pending", key: "pending", colorClass: "bg-blue-500", textClass: "text-blue-500", bgLightClass: "bg-blue-50" },
    { label: "Approved", key: "approved", colorClass: "bg-green-500", textClass: "text-green-500", bgLightClass: "bg-green-50" },
    { label: "Rejected", key: "rejected", colorClass: "bg-red-500", textClass: "text-red-500", bgLightClass: "bg-red-50" },
  ];

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Description className="text-gray-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">MOU Pipeline</h6>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
        <h2 className="text-4xl font-extrabold text-blue-600 mb-1">{total || 0}</h2>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[1.5px]">Generated Under Me</p>
      </div>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
        {stages.map((stage) => {
          const count = data?.[stage.key] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={stage.key} className="w-full">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">{stage.label}</span>
                <span className={`text-xs font-extrabold ${stage.textClass}`}>
                  {count} ({Math.round(percentage)}%)
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full ${stage.bgLightClass}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stage.colorClass}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MouOverview;
