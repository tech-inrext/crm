"use client";

import React, { useState } from "react";
import AddNoticeModal from "./AddNoticeModal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  Box,
  Button,
  InputBase,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import WifiIcon from "@mui/icons-material/Wifi";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LockIcon from "@mui/icons-material/Lock";

const tabData = [
  { label: "All Notices", icon: <NotificationsNoneIcon />, value: "" },
  { label: "General", icon: <FolderOpenIcon />, value: "general" },
  { label: "Project Updates", icon: <WifiIcon />, value: "project" },
  { label: "Pricing / Offers", icon: <LocalOfferIcon />, value: "pricing" },
  { label: "Sales Targets", icon: <TrendingUpIcon />, value: "sales" },
  {
    label: "Urgent Alerts",
    icon: <WarningAmberIcon color="error" />,
    value: "urgent",
  },
  { label: "HR / Internal", icon: <LockIcon />, value: "hr" },
];

function NoticeBoardHeader({
  onFilterChange,
}: {
  onFilterChange: (filters: {
    searchText: string;
    category: string;
    priority: string;
    date?: any;
  }) => void;
}) {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState<any>(null);

  // Search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onFilterChange({ searchText: value, category, priority, date });
  };

  // Category
  const handleCategoryChange = (e: any) => {
    const value = e.target.value;
    setCategory(value);
    onFilterChange({ searchText, category: value, priority, date });
  };

  // Priority
  const handlePriorityChange = (e: any) => {
    const value = e.target.value;
    setPriority(value);
    onFilterChange({ searchText, category, priority: value, date });
  };

  // Date
  const handleDateChange = (newValue: any) => {
    setDate(newValue);
    onFilterChange({ searchText, category, priority, date: newValue });
  };

  // Tabs
  const handleTabChange = (_: any, value: number) => {
    setTab(value);
    const tabValue = tabData[value].value;
    setCategory(tabValue);
    onFilterChange({
      searchText,
      category: tabValue,
      priority,
      date,
    });
  };

  return (
    <>
      <AddNoticeModal open={open} onClose={() => setOpen(false)} />

      <Box className="px-4 ml-4 py-2 bg-white rounded-xl border border-gray-200 max-w-fit">
        <Box className="rounded-2xl space-y-4">
          {/* Top Filters */}
          <Box className="p-2 rounded-2xl">
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              {/* Search */}
              <Box className="flex items-center bg-white rounded-lg px-3 h-10 w-90 border border-gray-500">
                <SearchIcon className="text-gray-500 text-[18px] mr-2" />
                <InputBase
                  placeholder="Search..."
                  className="text-[13px] flex-1"
                  value={searchText}
                  onChange={handleSearchChange}
                />
              </Box>

              {/* Category */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select category</InputLabel>
                <Select
                  label="Select category"
                  value={category}
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="project">Project Updates</MenuItem>
                  <MenuItem value="pricing">Pricing / Offers</MenuItem>
                  <MenuItem value="sales">Sales Targets</MenuItem>
                  <MenuItem value="urgent">Urgent Alerts</MenuItem>
                  <MenuItem value="hr">HR / Internal</MenuItem>
                </Select>
              </FormControl>

              {/* Priority */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Select priority</InputLabel>
                <Select
                  label="Select priority"
                  value={priority}
                  onChange={handlePriorityChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="high">Urgent</MenuItem>
                  <MenuItem value="medium">Important</MenuItem>
                  <MenuItem value="low">Info</MenuItem>
                </Select>
              </FormControl>

              {/* Date Picker */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Select Date"
                  value={date}
                  onChange={handleDateChange}
                  format="MM/DD/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        width: 180,
                        backgroundColor: "white",
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              {/* Filter Icon */}
              <IconButton
                sx={{
                  bgcolor: "#fff",
                  height: 38,
                  width: 38,
                }}
              >
                <FilterListIcon />
              </IconButton>

              {/* Add Button */}
              <Button
                variant="contained"
                className="h-10! px-5! rounded-xl! text-md! normal-case! bg-blue-500! hover:bg-blue-600!"
                onClick={() => setOpen(true)}
              >
                + Add Notice
              </Button>
            </Stack>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
           >
            {tabData.map((item, idx) => (
              <Tab
                key={idx}
                icon={item.icon}
                iconPosition="start"
                label={item.label}
                className={`normal-case! !mt-1 text-md! font-medium! min-h-[40px]! px-6! border-gray-300
                ${
                  tab === idx
                    ? "bg-[#e6f0ff]! text-blue-600!"
                    : "text-gray-600 hover:bg-white!"
                }`}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
    </>
  );
}

export default NoticeBoardHeader;