"use client";

import React from "react";
import { LocationOn } from "@mui/icons-material";

interface CabPickupHotspotsProps {
  data: {
    area: string;
    count: number;
  }[] | undefined;
}

const CabPickupHotspots: React.FC<CabPickupHotspotsProps> = ({ data = [] }) => {
  // Sort by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const maxCount = sortedData.length > 0 ? sortedData[0].count : 1;

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <LocationOn className="text-gray-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Pickup Hotspots</h6>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
        {sortedData.map((hotspot, index) => {
          const widthPercent = (hotspot.count / maxCount) * 100;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-gray-700">{hotspot.area}</span>
                  <span className="text-[11px] font-extrabold text-blue-600">{hotspot.count}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-50">
                  <div
                    className="h-full rounded-full bg-blue-400"
                    style={{ width: `${widthPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CabPickupHotspots;
