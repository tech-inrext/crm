"use client";

import React from "react";
import { StarRate } from "@mui/icons-material";

interface CabVendorPerformanceProps {
  data: {
    name: string;
    onTimeRate: number;
    trips: number;
  }[] | undefined;
}

const CabVendorPerformance: React.FC<CabVendorPerformanceProps> = ({ data = [] }) => {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <StarRate className="text-gray-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Vendor Performance</h6>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
        {data.map((vendor, index) => (
          <div key={index} className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-800 text-sm">{vendor.name}</span>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {vendor.trips} Trips
              </span>
            </div>
            
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">On-Time Rate</span>
                <span className={`text-[11px] font-extrabold ${vendor.onTimeRate > 90 ? 'text-green-500' : 'text-orange-500'}`}>
                  {vendor.onTimeRate}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${vendor.onTimeRate > 90 ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${vendor.onTimeRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CabVendorPerformance;
