"use client";

import React from "react";
import { DirectionsCar } from "@mui/icons-material";

interface CabBookingPipelineProps {
  data: {
    totalScheduled: number;
    pending: number;
    completed: number;
    cancelled: number;
  } | undefined;
}

const CabBookingPipeline: React.FC<CabBookingPipelineProps> = ({ data }) => {
  const total = data?.totalScheduled || 0;
  const stages = [
    { label: "Pending", key: "pending", colorClass: "bg-blue-500", textClass: "text-blue-500", bgLightClass: "bg-blue-50" },
    { label: "Completed", key: "completed", colorClass: "bg-green-500", textClass: "text-green-500", bgLightClass: "bg-green-50" },
    { label: "Cancelled", key: "cancelled", colorClass: "bg-orange-500", textClass: "text-orange-500", bgLightClass: "bg-orange-50" },
  ];

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <DirectionsCar className="text-gray-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Booking Pipeline</h6>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
        <h2 className="text-4xl font-extrabold text-blue-600 mb-1">{total}</h2>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[1.5px]">Total Scheduled</p>
      </div>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
        {stages.map((stage) => {
          const count = data?.[stage.key as keyof typeof data] || 0;
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

export default CabBookingPipeline;
