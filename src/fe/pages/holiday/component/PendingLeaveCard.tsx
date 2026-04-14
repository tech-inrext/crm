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

// Dummy Data
const leaves = [
  {
    name: "John Doe",
    period: "Apr 13, 2026 - Apr 15, 2026",
    duration: "3 Days",
    reason: "Vacation",
    status: "Pending",
  },
  {
    name: "Jane Smith",
    period: "Apr 18, 2026",
    duration: "1 Day",
    reason: "Medical",
    status: "Approved",
  },
];

export default function PendingLeaveCard() {
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
            Pending Leave Approvals
          </Typography>

          <IconButton size="small">
            <MoreHorizIcon className="text-gray-400" />
          </IconButton>
        </Box>

        {/* Table Header */}
        <Box className="grid grid-cols-5 text-xs font-semibold text-gray-500 px-2 py-2">
          <Typography>Employee</Typography>
          <Typography>Period</Typography>
          <Typography>Duration</Typography>
          <Typography>Reason</Typography>
          <Typography>Status</Typography>
        </Box>

        <Divider />

        {/* Rows */}
        {leaves.map((item, index) => (
          <React.Fragment key={index}>
            <Box className="grid grid-cols-5 items-center px-2 py-3 text-sm text-gray-700">
              <Typography className="font-medium">
                {item.name}
              </Typography>

              <Typography className="text-gray-600">
                {item.period}
              </Typography>

              <Typography>{item.duration}</Typography>

              <Typography>{item.reason}</Typography>

              <Box>
                {item.status === "Pending" ? (
                  <Box className="inline-block px-3 py-1 rounded-md bg-yellow-100 text-yellow-700 text-xs font-medium">
                    ● Pending
                  </Box>
                ) : (
                  <Box className="inline-block px-3 py-1 rounded-md bg-blue-100 text-blue-600 text-xs font-medium">
                    ✓ Approve
                  </Box>
                )}
              </Box>
            </Box>

            {index !== leaves.length - 1 && <Divider />}
          </React.Fragment>
        ))}

        {/* Footer Actions */}
        <Box className="flex justify-end gap-3 mt-4">
          <Button
            variant="outlined"
            className="!border-gray-300 !text-gray-700 !normal-case !rounded-lg"
          >
            Approve
          </Button>

          <Button
            variant="contained"
            className="!bg-red-500 hover:!bg-red-600 !normal-case !rounded-lg"
          >
            Reject
          </Button>
        </Box>
      </Box>
    </Box>
  );
}