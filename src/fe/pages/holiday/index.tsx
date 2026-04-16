"use client";

import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";

import Header from "@/fe/pages/holiday/component/Header";
import Filters from "@/fe/pages/holiday/component/Filter";
import CalendarView from "@/fe/pages/holiday/component/CalenderView";
import ListView from "@/fe/pages/holiday/hooks/ListView";
import CampaignView from "@/fe/pages/holiday/hooks/CampaignView";
import HolidayDrawer from "@/fe/pages/holiday/hooks/HolidayDrawer";

import LogHistoryCard from "@/fe/pages/holiday/component/LogHistoryCard";
import StatsCards from "@/fe/pages/holiday/component/StatCard";
import PendingLeaveCard from "@/fe/pages/holiday/component/PendingLeaveCard";

export default function HolidayPlanner() {
  const [tab, setTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box>
      <Header />
      <Filters />
      {/* Tabs */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2 }}>
        <Tab label="holiday" />
        <Tab label="Log History" />
        <Tab label="Leave Requests" />
      </Tabs>

      {/* Calendar + Right Sidebar */}
      {tab === 0 && (
        <Box className="flex gap-1 p-1">
          {/* Left */}
          <Box className="flex-1">
            <CalendarView onOpen={() => setDrawerOpen(true)} />
             <PendingLeaveCard />
          </Box>

          {/* Right */}
          <Box className="w-[420px] hidden lg:block">
            <Box className="sticky top-4">
              <LogHistoryCard />
            </Box>
          </Box>
        </Box>
      )}
       <StatsCards />
      {/* Log Tab */}
      {tab === 1 && (
        <Box className="p-4 max-w-xl">
          <LogHistoryCard />
        </Box>
      )}

      {tab === 2 && <ListView />}
      {tab === 3 && <CampaignView />}

      <HolidayDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
}