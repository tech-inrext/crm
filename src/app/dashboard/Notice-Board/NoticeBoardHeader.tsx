"use client";

import React, { useState, useEffect } from "react";
import AddNoticeModal from "../../../components/notice/AddNoticeModal";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  Box,
  Button,
  Select, 
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
} from "../../../components/ui/Component";

import { InputBase, Tabs, Tab } from "@mui/material";
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

  const [categories, setCategories] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);

  // =========================
  // Fetch Meta
  // =========================
  const fetchMeta = async () => {
    try {
      const res = await fetch("/api/v0/notice/meta");
      const data = await res.json();

      if (data.success) {
        setCategories(data.data.categories || []);
        setPriorities(data.data.priorities || []);
      }
    } catch (error) {
      console.log("Meta fetch error", error);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  // =========================
  // Filter trigger
  // =========================
  const triggerFilter = (
    newSearch = searchText,
    newCategory = category,
    newPriority = priority,
    newDate = date,
  ) => {
    onFilterChange({
      searchText: newSearch,
      category: newCategory,
      priority: newPriority,
      date: newDate ? newDate.format("YYYY-MM-DD") : "",
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    triggerFilter(value, category, priority, date);
  };

  const handleCategoryChange = (e: any) => {
    const value = e.target.value;
    setCategory(value);

    // reverse mapping to sync tab
    const reverseMap: any = {
      "General Announcements": 1,
      "Project Updates": 2,
      "Pricing / Offers": 3,
      "Sales Targets": 4,
      "Urgent Alerts": 5,
      "HR / Internal": 6,
    };

    setTab(reverseMap[value] || 0);

    triggerFilter(searchText, value, priority, date);
  };

  const handlePriorityChange = (e: any) => {
    const value = e.target.value;
    setPriority(value);
    triggerFilter(searchText, category, value, date);
  };

  const handleDateChange = (newValue: any) => {
    setDate(newValue);
    triggerFilter(searchText, category, priority, newValue);
  };

  // =========================
  // Tabs
  // =========================
  const handleTabChange = (_: any, value: number) => {
    setTab(value);

    const tabValue = tabData[value].value;

    const categoryMap: any = {
      general: "General Announcements",
      project: "Project Updates",
      pricing: "Pricing / Offers",
      sales: "Sales Targets",
      urgent: "Urgent Alerts",
      hr: "HR / Internal",
    };

    const mappedCategory = categoryMap[tabValue] || "";

    setCategory(mappedCategory);

    triggerFilter(searchText, mappedCategory, priority, date);
  };

  return (
    <>
      <AddNoticeModal open={open} onClose={() => setOpen(false)} />

      <Box className="px-6 mr-2 py-2 bg-white rounded-xl border mb-5 border-gray-200 max-w-full">
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

                  {categories.map((cat, index) => (
                    <MenuItem key={index} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Priority */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Select priority</InputLabel>
                <Select
                  label="Select priority"
                  value={priority}
                  onChange={handlePriorityChange}
                >
                  <MenuItem value="">All</MenuItem>

                  {priorities.map((pri, index) => (
                    <MenuItem key={index} value={pri}>
                      {pri}
                    </MenuItem>
                  ))}
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
                      className: "bg-white w-[150px]",
                    },
                  }}
                />
              </LocalizationProvider>

              {/* Filter Icon */}
              <IconButton className="!bg-white !h-[38px] !w-[36px]">
                <FilterListIcon />
              </IconButton>

              {/* Add Button */}
              <Button
                variant="contained"
                className="h-10! px-2! rounded-sm! text-md! normal-case! bg-blue-500! hover:bg-blue-600!"
                onClick={() => setOpen(true)}
              >
                + Add Notice
              </Button>
            </Stack>
          </Box>

          {/* Tabs */}
          <Tabs value={tab} onChange={handleTabChange}>
            {tabData.map((item, idx) => (
              <Tab
                key={idx}
                icon={item.icon}
                iconPosition="start"
                label={item.label}
                className={`normal-case! !mt-1 text-md! mr-2 font-medium! min-h-[40px]! px-6! border-gray-300
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
