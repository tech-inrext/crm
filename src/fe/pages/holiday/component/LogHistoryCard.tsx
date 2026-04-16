"use client";

import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Chip,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Dummy Data
const logs = [
  {
    name: "Rahul Raj",
    time: "12:36 PM",
    action: "Added a Holiday",
    tag: "Added",
    tagColor: "bg-green-100 text-green-600",
  },
  {
    name: "Rahul Raj",
    time: "12:37 PM",
    action: "Approved John’s request.\nfor Apr 13-15",
    tag: "Leave Approved",
    tagColor: "bg-green-100 text-green-600",
  },
  {
    name: "Rahul Raj",
    time: "12:38 PM",
    action: "Created Diwali Offer 2026",
    tag: "Campaign Created",
    tagColor: "bg-purple-100 text-purple-600",
  },
  {
    name: "Rahul Raj",
    time: "12:38 PM",
    action: "Added ThanksgNnov 26, 2026",
    tag: "Logged",
    tagColor: "bg-blue-100 text-blue-600",
  },
];

export default function LogHistoryCard() {
  return (
    <Box className="p-4" >
      <Box
        className="rounded-2xl p-4 shadow-sm bg-white border border-gray-500"
      >
        {/* Header */}
        <Box className="flex items-center justify-between mb-3">
          <Typography className="!text-gray-700 !font-semibold">
            Log History
          </Typography>

          <IconButton size="small">
            <MoreHorizIcon className="text-gray-400" />
          </IconButton>
        </Box>

        {/* Logs */}
        <Box>
          {logs.map((log, index) => (
            <React.Fragment key={index}>
              <Box className="flex items-start justify-between py-3">
                {/* Left */}
                <Box className="flex items-start gap-3">
                  <Avatar className="!w-9 !h-9 !bg-blue-500 " />

                  <Box>
                    <Typography className="!text-sm text-gray-700">
                      <span className="font-semibold">{log.name}</span>{" "}
                      <span className="text-gray-400 !text-xs">
                        {log.time}
                      </span>
                    </Typography>

                    <Typography className="!text-sm text-gray-600 whitespace-pre-line">
                      {log.action}
                    </Typography>
                  </Box>
                </Box>

                {/* Tag */}
                <Chip
                  label={log.tag}
                  size="small"
                  className={`!font-medium !bg-blue-500 !text-white !rounded-md ${log.tagColor}`}
                />
              </Box>

              {index !== logs.length - 1 && (
                <Divider className="!border-gray-200" />
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Footer */}
        <Box className="mt-3 flex items-center gap-1 text-blue-600 cursor-pointer">
          <Typography className="text-sm font-medium">
            View All Logs
          </Typography>
          <KeyboardArrowDownIcon fontSize="small" />
        </Box>
      </Box>
    </Box>
  );
}