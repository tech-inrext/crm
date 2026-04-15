"use client";

import React, { useState } from "react";
import { Box, Button, Tabs, Tab, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const tabs = [
  { label: "Upcoming Holidays", key: "upcoming" },
  { label: "Past Holidays", key: "past" },
  { label: "Leave Requests", key: "leave" },
];

export default function Header() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Box className="w-full px-4 pt-3">
      <Box className="flex items-center justify-between rounded-xl border border-gray-400 px-3 py-4">
        {/* Tabs */}
        <Box className="flex items-center gap-2">
          <Box>
            <Tabs
              value={activeTab}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{ style: { display: "none" } }}
            >
              {tabs.map((tab) => (
                <Tab
                  key={tab.key}
                  value={tab.key}
                  label={tab.label}
                  
                />
              ))}
            </Tabs>
          </Box>
        </Box>

        {/* Add Button */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          className="!text-black !border-white/ !bg-white/10 hover:!bg-white/20 !normal-case !font-medium !rounded-lg"
        >
          Add Holiday
        </Button>
      </Box>
    </Box>
  );
}