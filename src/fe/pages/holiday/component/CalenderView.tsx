"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Skeleton,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useRouter } from "next/navigation";

export default function UpcomingHolidaysCard() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ================= FETCH =================
  const fetchHolidays = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/v0/holiday?limit=20");
      const data = await res.json();

      if (data.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = data.data
          .filter((h) => new Date(h.date) >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 6);

        setHolidays(upcoming);
      }
    } catch (err) {
      console.error("Error fetching holidays", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // ================= HELPERS =================
  const getDayLabel = (days) => {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days to go`;
  };

  const getChipStyle = (days) => {
    if (days === 0) {
      return { color: "#16a34a", backgroundColor: "#dcfce7" };
    }
    if (days === 1) {
      return { color: "#f59e0b", backgroundColor: "#fef3c7" };
    }
    return { color: "#2563eb", backgroundColor: "#dbeafe" };
  };

  // ================= SKELETON =================
  const SkeletonCard = () => (
    <Card className="!rounded-2xl min-w-[260px] h-[220px] p-3">
      <Skeleton width="40%" height={20} />
      <Skeleton width="70%" height={25} />
      <Skeleton width="90%" height={15} />
      <Skeleton width="80%" height={15} />
    </Card>
  );

  // ================= UI =================
  return (
    <Box>
      <Box className="rounded-2xl p-5">
        {/* HEADER */}
        <Box className="flex items-center justify-between mb-4">
          <Typography className="!font-semibold !text-xl !text-gray-800">
            Upcoming Holidays
          </Typography>

          <button
            onClick={() => router.push("/holidays")}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            View All
          </button>
        </Box>

        {/* CARDS */}
        <Box className="flex gap-4 overflow-x-auto pb-2">
          {/* LOADING */}
          {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

          {/* EMPTY */}
          {!loading && holidays.length === 0 && (
            <Box className="w-full text-center py-6">
              <Typography className="text-gray-400 text-sm">
                No upcoming holidays
              </Typography>
            </Box>
          )}

          {/* DATA */}
          {!loading &&
            holidays.map((item) => {
              const holidayDate = new Date(item.date);

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const holiday = new Date(item.date);
              holiday.setHours(0, 0, 0, 0);

              const daysLeft = Math.ceil(
                (holiday - today) / (1000 * 60 * 60 * 24),
              );

              return (
                <Card
                  key={item._id}
                  onClick={() => router.push(`/holidays/${item._id}`)}
                  className="!rounded-2xl min-w-[300px] h-[180px] cursor-pointer bg-white flex flex-col justify-between p-3 transition hover:shadow-md border border-gray-100"
                >
                  {/* TOP ROW */}
                  <Box className="flex justify-between items-start">
                    <Chip
                      label={item.type || "Holiday"}
                      size="small"
                      className="!bg-blue-100 !text-blue-600 !font-medium"
                    />

                    <Box className="flex items-center gap-1">
                      {daysLeft >= 0 && (
                        <Chip
                          label={getDayLabel(daysLeft)}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: 11,
                            height: 22,
                            ...getChipStyle(daysLeft),
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* TITLE */}
                  <Box className="flex justify-between items-start mt-2">
                    <Typography className="!font-semibold text-slate-800 !text-[19px] line-clamp-1">
                      {item.name}
                    </Typography>

                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* DATE */}
                  <Box className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <CalendarTodayIcon fontSize="inherit" />
                    <span>
                      {holidayDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </Box>

                  {/* DESCRIPTION */}
                  <Typography className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {item.description || "No description available"}
                  </Typography>
                </Card>
              );
            })}
        </Box>
      </Box>
    </Box>
  );
}
