"use client";

import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";

import Header from "@/fe/pages/holiday/component/Header"; 
 import PendingLeaveCard from "@/fe/pages/holiday/component/PendingLeaveCard";
import UpcomingHolidaysCard from "@/fe/pages/holiday/component/UpcomingHoliday";

export default function HolidayPlanner() {
  const [tab, setTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box className="w-full">
      <Header />

      {/* ✅ TABS */}
      <Box className="px-4 pt-2">
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Upcoming Holidays" />
          <Tab label="Leave Requests" />
        </Tabs>
      </Box>

      {/* ================= TAB CONTENT ================= */}

      {/* 🟦 UPCOMING HOLIDAYS */}
      {tab === 0 && (
        <Box className="flex gap-4 p-4">
          {/* LEFT */}
          <Box className="flex-1">
            <UpcomingHolidaysCard onOpen={() => setDrawerOpen(true)} />
          </Box>

          {/* RIGHT */}
          {/* <Box className="w-[420px] hidden lg:block">
            <Box className="sticky top-4 space-y-4">
              <LogHistoryCard />
            </Box>
          </Box> */}
        </Box>
      )}

      {/* 🟩 LEAVE REQUESTS */}
      {tab === 1 && (
        <Box className="p-4">
          {/* Replace this later with full Leave Page */}
          <PendingLeaveCard />
        </Box>
      )}

    </Box>
  );
}