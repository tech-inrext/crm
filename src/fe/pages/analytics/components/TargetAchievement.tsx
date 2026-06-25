"use client";

import React from "react";
import { EmojiEvents } from "@mui/icons-material";

interface TargetAchievementProps {
  data: {
    achieved: number;
    target: number;
    percentage: number;
  } | null;
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const TargetAchievement: React.FC<TargetAchievementProps> = ({ data }) => {
  const achieved = data?.achieved || 0;
  const target = data?.target || 0;
  const percentage = data?.percentage || 0;

  return (
    <div className="p-6 rounded-2xl border border-gray-200 bg-white w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <EmojiEvents className="text-yellow-500 text-sm" />
        <h6 className="font-bold text-gray-800 text-lg tracking-tight">Target Achievement</h6>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        {/* Circular Progress Implementation with SVG */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#eab308" // yellow-500
              strokeWidth="8"
              strokeDasharray={251.2} // 2 * pi * r
              strokeDashoffset={251.2 - (251.2 * percentage) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-gray-800">{Math.round(percentage)}%</span>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
            <span className="text-xs font-bold text-gray-600 uppercase">Achieved</span>
            <span className="font-extrabold text-green-600">{formatCurrency(achieved)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase">Monthly Target</span>
            <span className="font-bold text-gray-600">{formatCurrency(target)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetAchievement;
