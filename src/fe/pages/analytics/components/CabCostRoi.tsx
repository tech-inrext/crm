"use client";

import React from "react";
import { AttachMoney, CheckCircleOutline, TrendingUp } from "@mui/icons-material";

interface CabCostRoiProps {
  data: {
    totalSpent: number;
    costPerVisit: number;
    mousGenerated: number;
  } | undefined;
}

const CabCostRoi: React.FC<CabCostRoiProps> = ({ data }) => {
  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <AttachMoney className="text-gray-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Cost & ROI</h6>
      </div>

      <div className="flex flex-col flex-1 justify-center gap-4">
        {/* Total Spent */}
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[1px] mb-1">Total Spent</p>
            <h3 className="text-xl font-extrabold text-orange-600">₹{data?.totalSpent.toLocaleString()}</h3>
          </div>
          <AttachMoney className="text-orange-300 text-3xl" />
        </div>

        {/* Cost per visit */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[1px] mb-1">Cost / Visit</p>
            <h3 className="text-xl font-extrabold text-blue-600">₹{data?.costPerVisit.toLocaleString()}</h3>
          </div>
          <TrendingUp className="text-blue-300 text-3xl" />
        </div>

        {/* MOUs Generated */}
        <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[1px] mb-1">MOUs from Cabs</p>
            <h3 className="text-xl font-extrabold text-green-600">{data?.mousGenerated}</h3>
          </div>
          <CheckCircleOutline className="text-green-300 text-3xl" />
        </div>
      </div>
    </div>
  );
};

export default CabCostRoi;
