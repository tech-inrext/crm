"use client";

import React from "react";
import AddNoticeModal from "@/fe/pages/Notice/component/AddNoticeModal";
import useNoticeBoardHeader from "@/fe/pages/Notice/hooks/useNoticeBoardHeader";

import { NOTICE_TABS } from "@/fe/pages/Notice/utils/noticeTab";

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
} from "../../../../components/ui/Component";

import { InputBase, Tabs, Tab } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

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
  // 🔥 Hook
  const {
    tab,
    open,
    setOpen,
    searchText,
    category,
    priority,
    date,
    categories,
    priorities,
    handleSearchChange,
    handleCategoryChange,
    handlePriorityChange,
    handleDateChange,
    handleTabChange,
  } = useNoticeBoardHeader(onFilterChange, NOTICE_TABS);

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
            {NOTICE_TABS.map((item, idx) => (
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