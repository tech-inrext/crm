"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import DescriptionIcon from "@mui/icons-material/Description";
import CampaignIcon from "@mui/icons-material/Campaign";

const stats = [
  {
    icon: <CalendarMonthIcon className="text-blue-500" />,
    value: 4,
    label: "Upcoming Holidays",
    bg: "bg-blue-50",
  },
  {
    icon: <BeachAccessIcon className="text-green-500" />,
    value: 2,
    label: "Pending Leave Requests",
    bg: "bg-green-50",
  },
  {
    icon: <DescriptionIcon className="text-indigo-500" />,
    value: 10,
    label: "Holidays Logged (Past)",
    bg: "bg-indigo-50",
  },
  {
    icon: <CampaignIcon className="text-red-500" />,
    value: 8,
    label: "Campaigns Pending Approval",
    bg: "bg-red-50",
  },
];

export default function StatsCards() {
  return (
    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 !p-6">
      {stats.map((item, index) => (
        <Box
          key={index}
          className={`!flex items-center !gap-4 !p-6 !border border-gray-600 !rounded-xl !bg-white ${item.bg}`} 
        >
          {/* Icon */}
          <Box className="!text-6xl mt-1  ">{item.icon}</Box>

          {/* Text */}
          <Box>
            <Typography className="!text-xl !font-semibold  !text-gray-700">
              {item.value}
            </Typography>
            <Typography className="!text-sm !text-gray-600">
              {item.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}