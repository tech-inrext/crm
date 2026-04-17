"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Chip, Skeleton } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export default function LeaveRequestsCard() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/v0/leave");
      const data = await res.json();

      if (data.success) {
        setLeaves(data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // ================= STATUS UI =================
  const getStatusChip = (status) => {
    if (status === "pending") {
      return (
        <Chip
          label="Pending"
          size="small"
          className="!bg-yellow-100 !text-yellow-700"
        />
      );
    }
    if (status === "approved") {
      return (
        <Chip
          label="Approved"
          size="small"
          className="!bg-green-100 !text-green-700"
        />
      );
    }
    return (
      <Chip
        label="Rejected"
        size="small"
        className="!bg-red-100 !text-red-600"
      />
    );
  };

  // ================= SKELETON CARD =================
  const SkeletonCard = () => (
    <Box className="border border-gray-200 rounded-xl p-4 bg-white">
      <Box className="flex justify-between">
        <Box className="flex gap-3 items-center">
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton width={100} height={20} />
            <Skeleton width={60} height={15} />
          </Box>
        </Box>
        <Skeleton width={70} height={25} />
      </Box>

      <Skeleton width="100%" height={15} sx={{ mt: 2 }} />
      <Skeleton width="60%" height={15} />
      <Skeleton width="80%" height={15} />
      <Skeleton width="70%" height={15} />

      <Box className="flex justify-end gap-2 mt-3">
        <Skeleton width={60} height={30} />
        <Skeleton width={80} height={30} />
        <Skeleton width={80} height={30} />
      </Box>
    </Box>
  );

  return (
    <Box className="p-4">
      <Box className="rounded-2xl p-4 ">
        {/* HEADER */}
        <Box className="flex items-center justify-between mb-4">
          <Typography className="!font-semibold !text-gray-800">
            Leave Requests
          </Typography>

          <Box className="flex gap-2">
            <Button size="small" variant="outlined">
              All Status
            </Button>
            <Button size="small" className="!bg-yellow-100 !text-yellow-700">
              Pending
            </Button>
            <Button size="small" className="!bg-green-100 !text-green-700">
              Approved
            </Button>
            <Button size="small" className="!bg-red-100 !text-red-600">
              Rejected
            </Button>
          </Box>
        </Box>

        {/* GRID */}
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 🔥 LOADING */}
          {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

          {/* ❌ EMPTY */}
          {!loading && leaves.length === 0 && (
            <Typography className="text-gray-400 text-sm">
              No leave requests found
            </Typography>
          )}

          {/* ✅ DATA */}
          {!loading &&
            leaves.map((item, index) => (
              <Box
                key={item._id || index}
                className="border border-gray-200 !rounded-xl !p-4 !bg-white !shadow-sm !hover:shadow-md transition"
              >
                {/* TOP */}
                <Box className="flex justify-between !items-start">
                  <Box className="flex !items-center !gap-3">
                    <Box className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {item.employeeId?.name?.charAt(0) || "U"}
                    </Box>

                    <Box>
                      <Typography className="!font-semibold text-sm">
                        {item.employeeId?.name}
                      </Typography>
                    </Box>
                  </Box>

                  {getStatusChip(item.status)}
                </Box>

                {/* DATE */}
                <Box className="flex items-center justify-between !font-semibold ml-1 mt-3 text-gray-700">
                  <Box className="flex items-center gap-1">
                    <CalendarTodayIcon sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontSize: "11px" }}>
                      {new Date(item.start_date).toDateString()} -{" "}
                      {new Date(item.end_date).toDateString()}
                    </Typography>
                  </Box>
                </Box>
                {/* TYPE */}
                <Box className="!mt-2 !text-sm !ml-1 text-gray-600">
                  {item.leave_type || "Leave"}
                </Box>

                {/* REASON */}
                <Box className="!mt-1 !text-md text-black">
                  {item.reason || "No reason"}
                </Box>

                {/* APPLIED DATE */}
                <Box className="mt-2 text-xs text-gray-400">
                  Applied on {new Date(item.createdAt).toDateString()}
                </Box>

                {/* ACTIONS */}
                <Box className="flex justify-end gap-2 mt-3">
                  <Button size="small" variant="outlined">
                    View
                  </Button>

                  {item.status === "pending" && (
                    <>
                      <Button
                        size="small"
                        className="!bg-green-500 !text-white hover:!bg-green-600"
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        className="!bg-red-500 !text-white hover:!bg-red-600"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            ))}
        </Box>
      </Box>
    </Box>
  );
}
