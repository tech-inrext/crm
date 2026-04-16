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

export default function UpcomingHolidaysCard() {
  const [holidays, setHolidays] = useState([]);

  // 🔥 Fetch from backend
  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/v0/holiday");  
      const data = await res.json();

      if (data.success) {
        // ✅ Only upcoming holidays filter
        const today = new Date();

        const upcoming = data.data.filter((h) => {
          return new Date(h.date) >= today;
        });

        setHolidays(upcoming);
      }
    } catch (error) {
      console.error("Fetch Holiday Error:", error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <Box className="p-4">
      <Box className="rounded-2xl p-4 border border-gray-500 bg-white">
        
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
          {holidays.length === 0 ? (
            <Typography className="text-gray-400 text-sm">
              No upcoming holidays
            </Typography>
          ) : (
            holidays.map((item, index) => (
              <React.Fragment key={item._id || index}>
                <Box className="flex items-center justify-between py-2">
                  
                  {/* Left */}
                  <Box className="flex items-center gap-3">
                    <Box className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      {item.name?.charAt(0)}
                    </Box>

                    <Typography className="!font-medium !text-sm text-gray-700">
                      {item.name}
                    </Typography>
                  </Box>

                  {/* Right */}
                  <Typography className="text-gray-500 !text-sm">
                    {new Date(item.date).toLocaleDateString()}
                  </Typography>
                </Box>

                {index !== holidays.length - 1 && (
                  <Divider className="!border-gray-200" />
                )}
              </React.Fragment>
            ))
          )}
        </Box>

        {/* Footer */}
        <Box className="mt-4">
          <Button
            variant="contained"
            className="!bg-blue-500 !text-white !normal-case !rounded-lg hover:!bg-blue-600"
          >
            View Past Holidays
          </Button>
        </Box>
      </Box>
    </Box>
  );
}