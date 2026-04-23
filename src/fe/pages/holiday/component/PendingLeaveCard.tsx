"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Chip, Skeleton } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export default function LeaveRequestsCard() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [updatingId, setUpdatingId] = useState(null); // ✅ track loading button

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

  // ================= UPDATE STATUS =================
  const updateLeaveStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const res = await fetch(`/api/v0/leave/${id}`, {
        method: "PUT", // or PATCH
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success) {
        // ✅ Update UI instantly
        setLeaves((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, status } : item
          )
        );
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  // ================= FILTER =================
  const filteredLeaves = leaves.filter((item) => {
    if (activeTab === "pending") return item.status === "pending";
    if (activeTab === "approved") return item.status === "approved";
    return true;
  });

  // ================= STATUS CHIP =================
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

  // ================= SKELETON =================
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
    <Box className="p-3">
      <Box className="rounded-2xl">
        {/* HEADER */}
        <Box className="mb-4">
          <Box className="flex gap-6 border-b border-gray-200">
            <Typography
              onClick={() => setActiveTab("pending")}
              className={`cursor-pointer pb-2 text-sm font-medium ${
                activeTab === "pending"
                  ? "text-yellow-700 border-b-2 border-yellow-500"
                  : "text-gray-500"
              }`}
            >
              Pending
            </Typography>

            <Typography
              onClick={() => setActiveTab("approved")}
              className={`cursor-pointer pb-2 text-sm font-medium ${
                activeTab === "approved"
                  ? "text-green-700 border-b-2 border-green-500"
                  : "text-gray-500"
              }`}
            >
              Approved
            </Typography>
          </Box>
        </Box>

        {/* GRID */}
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* LOADING */}
          {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

          {/* EMPTY */}
          {!loading && filteredLeaves.length === 0 && (
            <Typography className="text-gray-400 text-sm">
              No {activeTab} leave requests
            </Typography>
          )}

          {/* DATA */}
          {!loading &&
            filteredLeaves.map((item, index) => (
              <Box
                key={item._id || index}
                className="border border-gray-200 !rounded-xl !p-4 !bg-white !shadow-sm hover:!shadow-md transition"
              >
                {/* TOP */}
                <Box className="flex justify-between items-start">
                  <Box className="flex items-center gap-3">
                    <Box className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {item.employeeId?.name?.charAt(0) || "U"}
                    </Box>

                    <Typography className="!font-semibold !text-lg">
                      {item.employeeId?.name}
                    </Typography>
                  </Box>

                  {getStatusChip(item.status)}
                </Box>

                {/* DATE */}
                <Box className="flex items-center mt-4 text-gray-700">
                  <CalendarTodayIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: "14px", ml: 1 }}>
                    {new Date(item.start_date).toDateString()} -{" "}
                    {new Date(item.end_date).toDateString()}
                  </Typography>
                </Box>

                {/* TYPE */}
                <Box className="mt-2 ml-6 text-sm text-gray-600">
                  {item.leave_type || "Leave"}
                </Box>

                {/* REASON */}
                <Box className="mt-1 ml-6 text-sm text-black">
                  {item.reason || "No reason"}
                </Box>

                {/* ACTIONS */}
                <Box className="border-t border-gray-200 mt-4 pt-3">
                  {item.status === "pending" && (
                    <Box className="flex justify-center gap-3">
                      <Button
                        size="small"
                        disabled={updatingId === item._id}
                        onClick={() =>
                          updateLeaveStatus(item._id, "approved")
                        }
                        className="!bg-green-800 !px-4 !text-white hover:!bg-green-600"
                      >
                        {updatingId === item._id ? "..." : "Approve"}
                      </Button>

                      <Button
                        size="small"
                        disabled={updatingId === item._id}
                        onClick={() =>
                          updateLeaveStatus(item._id, "rejected")
                        }
                        className="!bg-red-50 !px-4 !text-red-600 hover:!bg-red-100"
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
        </Box>
      </Box>
    </Box>
  );
}
 