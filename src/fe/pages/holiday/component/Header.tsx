"use client";

import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const tabs = [
  { label: "Upcoming Holidays", key: "upcoming" },
  { label: "Past Holidays", key: "past" },
  { label: "Leave Requests", key: "leave" },
];

export default function Header() {
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <Box className="w-full px-4 pt-3">
      <Box
        className="flex items-center justify-between rounded-xl px-3 py-2"
        sx={{
          background:
            "linear-gradient(90deg, #5B8DEF 0%, #8FA8FF 50%, #A7B7FF 100%)",
        }}
      >
        {/* Tabs */}
        <Box className="flex items-center gap-2">
          {tabs.map((tab) => (
            <Box
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-white/80 hover:bg-white/20"
              }`}
            >
              <Typography
                variant="body2"
                className="font-medium whitespace-nowrap"
              >
                {tab.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Add Button */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          className="!text-white !border-white/50 !bg-white/10 hover:!bg-white/20 !normal-case !font-medium !rounded-lg"
        >
          Add Holiday
        </Button>
      </Box>
    </Box>
  );
}