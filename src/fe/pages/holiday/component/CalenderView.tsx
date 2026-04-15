"use client";

import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

// Dummy data
const holidays = [
  {
    name: "Diwali",
    date: "Nov 12, 2026",
    color: "bg-orange-100 text-orange-500",
  },
  {
    name: "Thanksgiving",
    date: "Dec 26, 2026",
    color: "bg-blue-100 text-blue-500",
  },
  {
    name: "New Year's",
    date: "Dec 31, 2026",
    color: "bg-green-100 text-green-500",
  },
];

export default function UpcomingHolidaysCard() {
  return (
    <Box className="p-4">
      <Box
        className="rounded-2xl p-4 border border-gray-500 bg-white"
        
      >
        {/* Header */}
        <Box className="flex items-center justify-between mb-3">
          <Typography className="!text-gray-700 !font-semibold">
            Upcoming Holidays
          </Typography>

          <IconButton size="small">
            <MoreHorizIcon className="text-gray-500" />
          </IconButton>
        </Box>

        {/* List */}
        <Box>
          {holidays.map((item, index) => (
            <React.Fragment key={index}>
              <Box className="flex items-center justify-between py-2">
                {/* Left */}
                <Box className="flex items-center gap-3">
                  <Box
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${item.color}`}
                  >
                    <span className="text-md">{item.name.charAt(0)}</span>
                  </Box>

                  <Typography className="!font-medium !text-sm text-gray-700">
                    {item.name}
                  </Typography>
                </Box>

                {/* Right */}
                <Typography className="text-gray-500 !text-sm">
                  {item.date}
                </Typography>
              </Box>

              {index !== holidays.length - 1 && (
                <Divider className="!border-gray-200" />
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Footer */}
        <Box className="mt-4">
          <Button
            variant="contained"
            className="!bg-blue-500 !text-white !normal-case !rounded-lg hover:!bg-gray-300"
          >
            View Past Holidays
          </Button>
        </Box>
      </Box>
    </Box>
  );
}