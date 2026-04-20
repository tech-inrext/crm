"use client";

import React, { useCallback } from "react";
import AddNoticeModal from "@/fe/pages/Notice/component/AddNoticeModal";
import useNoticeBoardHeader from "@/fe/pages/Notice/hooks/useNoticeBoardHeader";
import { NOTICE_TABS } from "@/fe/pages/Notice/utils/noticeTab";
import { useAuth } from "@/contexts/AuthContext";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from "../../../../components/ui/Component";

import { InputBase, Typography } from "@mui/material";

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
};

function NoticeBoardHeader({
  onFilterChange,
  onNoticeAdded,
  categories,
  priorities,
}: Props) {
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

  // ✅ MEMOIZE filter function (prevents hook loop)
  const stableFilterChange = useCallback(
    (filters: any) => {
      onFilterChange?.(filters);
    },
    [onFilterChange],
  );

  const {
    open,
    setOpen,
    searchText,
    category,
    priority,
    handleSearchChange,
    handleCategoryChange,
    handlePriorityChange,
  } = useNoticeBoardHeader(stableFilterChange, NOTICE_TABS);

  // ✅ MEMOIZED wrapper (prevents re-render chain)
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
          onNoticeAdded={onNoticeAdded} // ✅ direct pass
        />
      )}

      <Box className="px-6 mr-2 py-2 bg-white rounded-xl border mb-5 border-gray-200 max-w-full">
        <Box className="rounded-2xl">
          <Typography variant="h4" sx={MODULE_STYLES.layout.moduleTitle}>
            Notice Board
          </Typography>

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
              <InputLabel>Select Category</InputLabel>
              <Select
                value={category || "All"}
                onChange={handleCategoryChange}
                label="Select Category"
              >
                <MenuItem value="All">All</MenuItem>
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
              sx={{ minWidth: { xs: "100%", md: 150 } }}
            >
              <InputLabel>Select Priority</InputLabel>
              <Select
                value={priority || "All"}
                onChange={handlePriorityChange}
                label="Select Priority"
              >
                <MenuItem value="All">All</MenuItem>
                {priorities?.map((p, i) => (
                  <MenuItem key={i} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Add Button */}
            {isAdminOrAVP && (
              <Button
                type="button" // ✅ prevent accidental form submit
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
    </>
  );
}

export default NoticeBoardHeader;
