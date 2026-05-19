"use client";

import React from "react";
import { PieChart } from "@mui/icons-material";

interface StatusData {
  [key: string]: number;
}

interface PipelineHealthProps {
  data: StatusData | null;
}

const PipelineHealth: React.FC<PipelineHealthProps> = ({ data }) => {
  const total = Object.values(data || {}).reduce((a, b) => a + b, 0);

  const stages = [
    { label: "New", key: "new", colorClass: "bg-blue-500", textClass: "text-blue-500", bgLightClass: "bg-blue-50" },
    { label: "In Progress", key: "in progress", colorClass: "bg-purple-500", textClass: "text-purple-500", bgLightClass: "bg-purple-50" },
    { label: "Details Shared", key: "details shared", colorClass: "bg-orange-500", textClass: "text-orange-500", bgLightClass: "bg-orange-50" },
    { label: "Closed", key: "closed", colorClass: "bg-green-500", textClass: "text-green-500", bgLightClass: "bg-green-50" },
    { label: "Not Interested", key: "not interested", colorClass: "bg-red-500", textClass: "text-red-500", bgLightClass: "bg-red-50" },
  ];

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="text-gray-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Pipeline Health</h6>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
        <h2 className="text-4xl font-extrabold text-blue-600 mb-1">{total}</h2>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[1.5px]">Total Active Leads</p>
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

export default PipelineHealth;
