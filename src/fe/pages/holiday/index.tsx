"use client";

import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";

import Header from "@/fe/pages/holiday/component/Header";
import PendingLeaveCard from "@/fe/pages/holiday/component/PendingLeaveCard";
import UpcomingHolidaysCard from "@/fe/pages/holiday/component/UpcomingHoliday";

export default function HolidayPlanner() {
  const [tab, setTab] = useState(0);

  // ✅ MAIN STATE (single source of truth)
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);

  // ✅ FETCH ALL DATA
  const fetchAllData = async () => {
    try {
      const [holidayRes, leaveRes] = await Promise.all([
        fetch("/api/v0/holiday"),
        fetch("/api/v0/leave"),
      ]);

      const holidayData = await holidayRes.json();
      const leaveData = await leaveRes.json();

      if (holidayData.success) setHolidays(holidayData.data || []);
      if (leaveData.success) setLeaves(leaveData.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // ✅ INITIAL LOAD
  useEffect(() => {
    fetchAllData();
  }, []);

  // ✅ REFRESH HANDLER (used by Header)
  const handleRefresh = () => {
    fetchAllData();
  };

  return (
    <Box className="w-full">
      {/* ✅ PASS REFRESH FUNCTION */}
      <Header onRefresh={handleRefresh} />

      {/* TABS */}
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
          <Box className="flex-1">
            {/* ✅ PASS DATA */}
            <UpcomingHolidaysCard holidays={holidays} />
          </Box>
        </Box>
      )}

      {/* 🟩 LEAVE REQUESTS */}
      {tab === 1 && (
        <Box className="p-4">
          {/* ✅ PASS DATA */}
          <PendingLeaveCard leaves={leaves} />
        </Box>
      )}
    </Box>
  );
}