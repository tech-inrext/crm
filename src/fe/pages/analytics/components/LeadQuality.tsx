"use client";

import React from "react";
import { Whatshot, LocalFireDepartment, AcUnit, WorkspacePremium } from "@mui/icons-material";

interface QualityData {
  [key: string]: number;
}

interface LeadQualityProps {
  data: QualityData | null;
}

const LeadQuality: React.FC<LeadQualityProps> = ({ data }) => {
  const qualityItems = [
    { label: "Hot Lead", key: "hot lead", colorClass: "text-red-500 bg-red-50 border-red-100", icon: <Whatshot className="text-red-500" />, desc: "High conversion intent" },
    { label: "Warm Lead", key: "warm lead", colorClass: "text-orange-500 bg-orange-50 border-orange-100", icon: <LocalFireDepartment className="text-orange-500" />, desc: "Steady interest shown" },
    { label: "Cold Lead", key: "cold lead", colorClass: "text-blue-500 bg-blue-50 border-blue-100", icon: <AcUnit className="text-blue-500" />, desc: "Early stage prospect" },
  ];

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <WorkspacePremium className="text-gray-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Portfolio Quality</h6>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {qualityItems.map((item) => (
          <div
            key={item.key}
            className={`p-4 rounded-xl border flex items-center gap-4 transition-all hover:scale-[1.02] ${item.colorClass}`}
          >
            <div className="p-2 rounded-lg bg-white/50 flex items-center justify-center">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-700 text-sm truncate">{item.label}</span>
                <span className={`font-extrabold text-xl`}>{data?.[item.key] || 0}</span>
              </div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadQuality;
