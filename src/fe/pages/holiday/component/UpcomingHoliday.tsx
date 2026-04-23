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
    if (days === 0) return "!bg-green-100 !text-green-600";
    if (days === 1) return "!bg-yellow-100 !text-yellow-600";
    return "!bg-blue-100 !text-blue-600";
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
      <Box className="rounded-2xl !p-2">
        {/* HEADER */}
        <Box className="flex items-center justify-between mb-4">
          <Typography className="!font-semibold !text-xl !text-gray-800">
            Upcoming Holidays
          </Typography>
        </Box>

        {/* CARDS */}
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* LOADING */}
          {loading && [1, 2, 6].map((i) => <SkeletonCard key={i} />)}

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
                  className="!rounded-2xl w-[300px] h-[200px] flex-shrink-0 cursor-pointer bg-[#f9fafb] flex flex-col p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {/* TOP ROW */}
                  <Box className="flex justify-between items-center">
                    <Chip
                      icon={
                        <CalendarTodayIcon className="!text-[13px] !text-blue-600" />
                      }
                      label={item.type || "Public"}
                      size="small"
                      className="!bg-blue-100 !border !text-blue-500 !font-medium !text-xs !rounded-full px-3"
                    />

                    {daysLeft >= 0 && (
                      <Chip
                        label={getDayLabel(daysLeft)}
                        size="small"
                        className={`!text-xs !font-medium !border !rounded-full px-2 ${getChipStyle(daysLeft)}`}
                      />
                    )}
                  </Box>

                  {/* TITLE + MENU */}
                  <Box className="flex justify-between items-start mt-3 min-h-[49px] max-h-[49px]">
                    <Typography className="!font-semibold text-gray-900 !text-[18px] leading-snug line-clamp-1">
                      {item.name}
                    </Typography>

                    <IconButton size="small" className="!p-1 !text-gray-500">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* DESCRIPTION */}
                  <Box
                    dangerouslySetInnerHTML={{
                      __html: item.description || "",
                    }}
                    sx={{
                      fontSize: "15px",
                      color: "#555",
                      lineHeight: 1.5,
                    }}
                  />
                </Card>
              );
            })}
        </Box>
      </Box>
    </Box>
  );
}
