"use client";

import React from "react";
import NoticeBoardHeader from "./NoticeBoardHeader";

import {
  Box,
  Typography,
  Stack,
  Container,
} from "@mui/material";

import PushPinIcon from "@mui/icons-material/PushPin";
import ViewListIcon from "@mui/icons-material/ViewList";

import NoticeCard from "@/components/notice/NoticeCard";
import NoticeShimmer from "@/components/notice/NoticeShimmer";

import useNotices from "../../../hooks/useNoticeDashboard";
import { gridStyles } from "@/utils/noticeUtils";

export default function NoticesDashboard() {
  const {
    meta,
    loading,
    fetchNotices,
    pinnedNotices,
    regularNotices,
  } = useNotices();

  const handleFilterChange = (filters: any) => {
    fetchNotices(filters);
  };

  return (
    <Container maxWidth={false} sx={{ bgcolor: "#fafaf9", p: 1, ml: 2 }}>
      
      <NoticeBoardHeader
        onFilterChange={handleFilterChange}
        categories={meta.categories}
        priorities={meta.priorities}
      />

      {loading ? (
        <Box sx={gridStyles} mt={4}>
          {[...Array(6)].map((_, i) => (
            <NoticeShimmer key={i} />
          ))}
        </Box>
      ) : (
        <>
          {/* Pinned Notices */}
          {pinnedNotices.length > 0 && (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                mt={4}
                mb={2}
              >
                <PushPinIcon />
                <Typography variant="h6" fontWeight={600}>
                  Pinned Notices
                </Typography>
              </Stack>

              <Box sx={gridStyles} mb={4}>
                {pinnedNotices.map((notice) => (
                  <NoticeCard key={notice._id} notice={notice} />
                ))}
              </Box>
            </>
          )}

          {/* All Notices Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <ViewListIcon />
              <Typography variant="h6" fontWeight={600}>
                All Notices
              </Typography>
            </Stack>

            <Box className="bg-white border border-blue-300 min-w-[38px] h-[38px] flex items-center mr-5 justify-center rounded-full text-[13px] font-semibold">
              {regularNotices.length}
            </Box>
          </Stack>

          {/* Regular Notices */}
          <Box sx={gridStyles}>
            {regularNotices.length > 0 ? (
              regularNotices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  showBorder={false}
                />
              ))
            ) : (
              <Typography color="text.secondary">
                No notices found
              </Typography>
            )}
          </Box>
        </>
      )}
    </Container>
  );
}