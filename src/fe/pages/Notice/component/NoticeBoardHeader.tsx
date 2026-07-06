"use client";

import React, { useCallback } from "react";
import AddNoticeModal from "@/fe/pages/Notice/component/AddNoticeModal";
import useNoticeBoardHeader from "@/fe/pages/Notice/hooks/useNoticeBoardHeader";
import { NOTICE_TABS } from "@/fe/pages/Notice/utils/noticeTab";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
} from "@mui/material";

import { InputBase } from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  onFilterChange: (filters: {
    searchText: string;
    category: string;
    priority: string;
    date?: any;
  }) => void;
  onNoticeAdded: () => void;
  categories: string[];
  priorities: string[];
  stats?: {
    totalNotices: number;
    urgent: number;
    pinned: number;
    categories: number;
  };
};

function NoticeBoardHeader({ onFilterChange, onNoticeAdded, categories, priorities, stats }: Props) {
  const auth = useAuth();
  const { user } = auth;

  const roleName = String(user?.currentRole?.name || "").toLowerCase();

  const isSystemAdmin =
    auth?.isSystemAdmin === true ||
    user?.isSystemAdmin === true ||
    user?.currentRole?.isSystemAdmin === true ||
    roleName === "admin";

  const isAVP =
    auth?.isAVP === true || user?.isAVP === true || roleName === "avp";

  const isAdminOrAVP = isSystemAdmin || isAVP;

  // ✅ SAFE direct pass (no wrapper needed)
  const {
    open,
    setOpen,
    searchText,
    category,
    priority,
    handleSearchChange,
    handleCategoryChange,
    handlePriorityChange,
  } = useNoticeBoardHeader(onFilterChange, NOTICE_TABS);

  const handleNoticeAdded = useCallback(() => {
    onNoticeAdded?.();
  }, [onNoticeAdded]);

  return (
    <>
      {/* Add Notice Modal */}
      {isAdminOrAVP && (
        <AddNoticeModal
          open={open}
          onClose={() => setOpen(false)}
          onNoticeAdded={handleNoticeAdded}
        />
      )}

      <Box className="px-6 py-6 max-w-full">
        {/* Header Top: Title and Button */}
        <Box className="flex justify-between items-start mb-6">
          <Box>
            <h1 className="text-3xl font-extrabold text-[#0f172a] mb-2 tracking-tight">
              Notice Board
            </h1>
            <Typography className="text-slate-500 text-[15px]">
              Manage and broadcast organizational announcements.
            </Typography>
          </Box>

          {isAdminOrAVP && (
            <Button
              type="button"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{ 
                borderRadius: 50, 
                whiteSpace: 'nowrap', 
                flexShrink: 0, 
                textTransform: 'none',
                boxShadow: 'none',
                px: { xs: 2, md: 3 }, 
                py: 1 
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Notice
            </Button>
          )}
        </Box>

        {/* 4 Cards Stats */}
        <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1 */}
          <Box className="bg-[#e0e7ff] rounded-2xl p-5 shadow-sm">
            <div className="text-blue-600 font-extrabold text-[36px] leading-none mb-2">
              {stats?.totalNotices || 0}
            </div>
            <Typography className="text-slate-500 font-medium text-[15px]">
              Total Notices
            </Typography>
          </Box>
          {/* Card 2 */}
          <Box className="bg-[#fee2e2] rounded-2xl p-5 shadow-sm">
            <div className="text-red-500 font-extrabold text-[36px] leading-none mb-2">
              {stats?.urgent || 0}
            </div>
            <Typography className="text-slate-500 font-medium text-[15px]">
              Urgent
            </Typography>
          </Box>
          {/* Card 3 */}
          <Box className="bg-[#f3e8ff] rounded-2xl p-5 shadow-sm">
            <div className="text-purple-600 font-extrabold text-[36px] leading-none mb-2">
              {stats?.pinned || 0}
            </div>
            <Typography className="text-slate-500 font-medium text-[15px]">
              Pinned
            </Typography>
          </Box>
          {/* Card 4 */}
          <Box className="bg-[#dcfce7] rounded-2xl p-5 shadow-sm">
            <div className="text-green-600 font-extrabold text-[36px] leading-none mb-2">
              {stats?.categories || 0}
            </div>
            <Typography className="text-slate-500 font-medium text-[15px]">
              Categories
            </Typography>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          flexWrap="wrap"
        >
          {/* Search */}
          <Box className="flex items-center bg-white rounded-full px-4 h-[42px] w-full md:w-[350px] border border-gray-200 shadow-sm">
            <SearchIcon className="text-gray-400 text-[20px] mr-2" />
            <InputBase
              placeholder="Search notices..."
              className="text-[14px] flex-1 text-slate-700"
              value={searchText}
              onChange={handleSearchChange}
            />
          </Box>

          {/* Category */}
          <FormControl
            size="small"
            sx={{ minWidth: { xs: "100%", md: 160 } }}
            className="bg-white rounded-full"
          >
            <Select
              value={category || "All"}
              onChange={handleCategoryChange}
              displayEmpty
              sx={{
                borderRadius: '9999px',
                height: '42px',
                '& fieldset': { borderColor: '#e5e7eb' },
              }}
            >
              <MenuItem value="All">All Category</MenuItem>
              {categories?.map((cat, i) => (
                <MenuItem key={i} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Priority */}
          <FormControl
            size="small"
            sx={{ minWidth: { xs: "100%", md: 160 } }}
            className="bg-white rounded-full"
          >
            <Select
              value={priority || "All"}
              onChange={handlePriorityChange}
              displayEmpty
              sx={{
                borderRadius: '9999px',
                height: '42px',
                '& fieldset': { borderColor: '#e5e7eb' },
              }}
            >
              <MenuItem value="All">All Priority</MenuItem>
              {priorities?.map((p, i) => (
                <MenuItem key={i} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </>
  );
}

export default NoticeBoardHeader;

