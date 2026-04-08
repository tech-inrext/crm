"use client";

import React from "react";
import AddNoticeModal from "@/fe/pages/Notice/component/AddNoticeModal";
import useNoticeBoardHeader from "@/fe/pages/Notice/hooks/useNoticeBoardHeader";
import { NOTICE_TABS } from "@/fe/pages/Notice/utils/noticeTab";
import { useAuth } from "@/contexts/AuthContext";

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
import AddIcon from "@mui/icons-material/Add";

function NoticeBoardHeader({
  onFilterChange,
  onNoticeAdded,
  categories,
  priorities,
}: {
  onFilterChange: (filters: {
    searchText: string;
    category: string;
    priority: string;
    date?: any;
  }) => void;
  onNoticeAdded: () => void;
  categories: string[];
  priorities: string[];
}) {
  const { user } = useAuth();

  /* ---------------- ROLE CHECK ---------------- */

  const currentRoleName =
    typeof user?.currentRole === "object"
      ? user?.currentRole?.name
      : user?.roles?.find((r) => r._id === user?.currentRole)?.name;

  const isAdminOrAVP =
    currentRoleName?.toLowerCase() === "admin" ||
    currentRoleName?.toLowerCase() === "avp";

  /* ---------------- HOOK ---------------- */

  const {
    tab,
    open,
    setOpen,
    searchText,
    category,
    priority,
    date,
    handleSearchChange,
    handleCategoryChange,
    handlePriorityChange,
    handleDateChange,
    handleTabChange,
  } = useNoticeBoardHeader(onFilterChange, NOTICE_TABS);

  return (
    <>
      {/* Add Notice Modal */}

      {isAdminOrAVP && (
        <AddNoticeModal
          open={open}
          onClose={() => setOpen(false)}
          onNoticeAdded={onNoticeAdded} // ✅ important
        />
      )}

      <Box className="px-6 mr-2 py-2 bg-white rounded-xl border mb-5 border-gray-200 max-w-full">
        <Box className="rounded-2xl space-y-4">
          <Box className="p-2 rounded-2xl">
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              flexWrap="wrap"
            >
              {/* Search */}

              <Box className="flex items-center bg-white rounded-lg px-3 h-10 w-full md:w-90 border border-gray-500">
                <SearchIcon className="text-gray-500 text-[18px] mr-2" />
                <InputBase
                  placeholder="Search..."
                  className="text-[13px] flex-1"
                  value={searchText}
                  onChange={handleSearchChange}
                />
              </Box>

              {/* Category */}

              <FormControl
                size="small"
                sx={{ minWidth: { xs: "100%", md: 200 } }}
              >
                <InputLabel id="category-label">Select Category</InputLabel>

                <Select
                  labelId="category-label"
                  value={category || "All"}
                  onChange={handleCategoryChange}
                  label="Select Category"
                >
                  <MenuItem value="All">
                    <>All</>
                  </MenuItem>

                  {categories?.map((cat, index) => (
                    <MenuItem key={index} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Priority */}

              <FormControl
                size="small"
                sx={{ minWidth: { xs: "100%", md: 150 } }}
              >
                {/* ✅ Label */}
                <InputLabel id="priority-label">Select Priority</InputLabel>

                <Select
                  labelId="priority-label" // ✅ MUST match
                  value={priority || "All"} // ✅ fallback
                  onChange={handlePriorityChange}
                  label="Select Priority" // ✅ IMPORTANT
                >
                  <MenuItem value="All">
                    <>All</>
                  </MenuItem>

                  {priorities?.map((pri, index) => (
                    <MenuItem key={index} value={pri}>
                      {pri}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Date */}

              {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Select Date"
                  value={date}
                  onChange={handleDateChange}
                  format="MM/DD/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      className: "bg-white w-full md:w-[150px]",
                    },
                  }}
                />
              </LocalizationProvider> */}

              <IconButton>
                {/* <FilterListIcon /> */}
              </IconButton>

              {/* Add Notice Button */}

              {isAdminOrAVP && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpen(true)}
                  className="h-[38px]"
                >
                  Add Notice
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default NoticeBoardHeader;
