"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export default function PendingLeaveCard() {
  const [leaves, setLeaves] = useState([]);

  // ================= FETCH LEAVES =================
  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/v0/leave");
      const data = await res.json();

      if (data.success) {
        setLeaves(data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <Box className="p-4">
      <Box className="rounded-2xl p-4 border border-gray-500 bg-white">

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
          <React.Fragment key={item._id || index}>
            <Box className="grid grid-cols-5 items-center px-2 py-3 text-xs text-gray-700">

              {/* Employee */}
              <Typography className="font-medium !text-sm">
                {item.employeeId.name || "N/A"}
              </Typography>

              {/* Period */}
              <Typography className="text-gray-600 !text-sm">
                {new Date(item.start_date).toLocaleDateString()} -{" "}
                {new Date(item.end_date).toLocaleDateString()}
              </Typography>

              {/* Duration */}
              <Typography className="!text-sm">
                {item.duration}
              </Typography>

              {/* Reason */}
              <Typography className="!text-sm">
                {item.reason}
              </Typography>

              {/* Status */}
              <Box>
                {item.status === "pending" ? (
                  <Box className="inline-block px-3 py-1 rounded-md bg-amber-200 border  text-yellow-700 text-xs font-medium">
                    ● Pending
                  </Box>
                ) : item.status === "approved" ? (
                  <Box className="inline-block px-3 py-1 rounded-md bg-blue-100 text-blue-600 text-xs font-medium">
                    ✓ Approved
                  </Box>
                ) : (
                  <Box className="inline-block px-3 py-1 rounded-md bg-red-100 text-red-600 text-xs font-medium">
                    ✕ Rejected
                  </Box>
                )}
              </Box>
            </Box>

            {index !== leaves.length - 1 && <Divider />}
          </React.Fragment>
        ))}

        {/* Footer Actions (UI only for now) */}
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