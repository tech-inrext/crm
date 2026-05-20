"use client";

import React from "react";
import { FilterAlt } from "@mui/icons-material";

interface ConversionEfficiencyProps {
  data: {
    totalLeads: number;
    approvedMOUs: number;
    rate: string | number;
  } | null;
}

const ConversionEfficiency: React.FC<ConversionEfficiencyProps> = ({ data }) => {
  const totalLeads = data?.totalLeads || 0;
  const approvedMOUs = data?.approvedMOUs || 0;
  const rate = data?.rate || 0;

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <FilterAlt className="text-purple-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Conversion Efficiency</h6>
      </div>

      <div className="flex flex-col flex-1">
        {/* Big Stat */}
        <div className="flex flex-col items-center justify-center py-6 mb-4 bg-purple-50 rounded-xl border border-purple-100 flex-1">
          <span className="text-5xl font-extrabold text-purple-600 mb-2">{rate}%</span>
          <span className="text-xs font-bold text-purple-800 uppercase tracking-widest">Win Rate</span>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
              <span className="font-bold text-gray-600 text-sm">Total Leads</span>
            </div>
            <span className="font-extrabold text-gray-800 text-lg">{totalLeads}</span>
          </div>
          
          <div className="flex justify-center -my-2 relative z-10">
            <div className="h-4 border-l-2 border-dashed border-gray-300"></div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">2</div>
              <span className="font-bold text-gray-600 text-sm">Approved MOUs</span>
            </div>
            <span className="font-extrabold text-green-600 text-lg">{approvedMOUs}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionEfficiency;
