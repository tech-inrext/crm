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
    emoji: "🪔",
  },
  {
    name: "Thanksgiving",
    date: "Dec 26, 2026",
    color: "bg-blue-100 text-blue-500",
    emoji: "🧈",
  },
  {
    name: "New Year's",
    date: "Dec 31, 2026",
    color: "bg-green-100 text-green-500",
    emoji: "🥗",
  },
];

export default function UpcomingHolidaysCard() {
  return (
    <Box className="p-4">
      <Box
        className="rounded-2xl p-4 shadow-sm"
        sx={{
          background:
            "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        }}
      >
        {/* Header */}
        <Box className="flex items-center justify-between mb-3">
          <Typography className="!text-gray-700 !font-semibold">
            Upcoming Holidays
          </Typography>

          <IconButton size="small">
            <MoreHorizIcon className="text-gray-400" />
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
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${item.color}`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                  </Box>

                  <Typography className="!font-medium text-gray-700">
                    {item.name}
                  </Typography>
                </Box>

                {/* Right */}
                <Typography className="text-gray-500 text-sm">
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
            className="!bg-gray-200 !text-gray-700 !normal-case !rounded-lg hover:!bg-gray-300"
          >
            View Past Holidays
          </Button>
        </Box>
      </Box>
    </Box>
  );
}