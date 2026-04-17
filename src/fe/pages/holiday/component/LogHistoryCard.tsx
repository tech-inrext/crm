"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Chip,
  Skeleton,
} from "@mui/material";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function LogHistoryCard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);

        const [leaveRes, holidayRes] = await Promise.all([
          axios.get("/api/v0/leave"),
          axios.get("/api/v0/holiday"),
        ]);

        const leaves = leaveRes.data?.data || [];
        const holidays = holidayRes.data?.data || [];

        const leaveLogs = leaves.map((leave) => ({
          name: leave.employeeId?.name || "Employee",
          time: new Date(leave.createdAt),
          action: `Applied ${leave.leave_type} leave\nfor ${new Date(
            leave.start_date
          ).toLocaleDateString()} - ${new Date(
            leave.end_date
          ).toLocaleDateString()}`,
          tag:
            leave.status === "approved"
              ? "Leave Approved"
              : leave.status === "pending"
              ? "Leave Pending"
              : "Leave Rejected",
          tagColor:
            leave.status === "approved"
              ? "bg-green-100 text-green-600"
              : leave.status === "pending"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600",
        }));

        const holidayLogs = holidays.map((holiday) => ({
          name: holiday.createdBy?.name || "Admin",
          time: new Date(holiday.createdAt),
          action: `Added Holiday: ${holiday.name}\n${new Date(
            holiday.date
          ).toDateString()}`,
          tag: "Holiday",
          tagColor: "bg-blue-100 text-blue-600",
        }));

        const combinedLogs = [...leaveLogs, ...holidayLogs].sort(
          (a, b) => b.time - a.time
        );

        setLogs(combinedLogs);
      } catch (err) {
        console.error("API ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // 🔥 Skeleton Row
  const SkeletonRow = () => (
    <Box className="flex items-start justify-between py-3">
      <Box className="flex items-start gap-3">
        <Skeleton variant="circular" width={36} height={36} />

        <Box>
          <Skeleton width={120} height={15} />
          <Skeleton width={180} height={15} />
        </Box>
      </Box>

      <Skeleton width={70} height={25} />
    </Box>
  );

  return (
    <Box className="p-4">
      <Box className="rounded-2xl p-4 shadow-sm bg-white border border-gray-200">
        
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
          {/* 🔥 LOADING */}
          {loading &&
            [1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <SkeletonRow />
                {i !== 4 && <Divider />}
              </React.Fragment>
            ))}

          {/* ❌ EMPTY */}
          {!loading && logs.length === 0 && (
            <Typography className="text-gray-500 text-sm text-center py-4">
              No logs available
            </Typography>
          )}

          {/* ✅ DATA */}
          {!loading &&
            logs.map((log, index) => (
              <React.Fragment key={index}>
                <Box className="flex items-start justify-between py-3">
                  
                  {/* LEFT */}
                  <Box className="flex items-start gap-3">
                    <Avatar className="!w-9 !h-9 !bg-blue-500">
                      {log.name?.charAt(0)}
                    </Avatar>

                    <Box>
                      <Typography className="!text-sm text-gray-700">
                        <span className="font-semibold">{log.name}</span>{" "}
                        <span className="text-gray-400 !text-xs">
                          {new Date(log.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </Typography>

                      <Typography className="!text-sm text-gray-600 whitespace-pre-line">
                        {log.action}
                      </Typography>
                    </Box>
                  </Box>

                  {/* TAG */}
                  <Chip
                    label={log.tag}
                    size="small"
                    className={`!font-medium !rounded-md ${log.tagColor}`}
                  />
                </Box>

                {index !== logs.length - 1 && <Divider />}
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