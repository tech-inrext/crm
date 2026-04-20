"use client";

import React, { useEffect, useCallback } from "react";
import NoticeBoardHeader from "@/fe/pages/Notice/component/NoticeBoardHeader";
import Pagination from "@/components/ui/Navigation/Pagination";
import { Box, Typography, Stack, Container } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import ViewListIcon from "@mui/icons-material/ViewList";
import NoticeCard from "@/fe/pages/Notice/component/NoticeCard";
import NoticeShimmer from "@/fe/pages/Notice/component/NoticeShimmer";
import useNotices from "@/fe/pages/Notice/hooks/useNoticeDashboard";
import { gridStyles } from "@/fe/pages/Notice/utils/noticeUtils";
import { useNoticePagination } from "@/fe/pages/Notice/hooks/useNoticePagination";

export default function NoticesDashboard() {
  const {
    meta,
    loading,
    getAllNotice,
    pinnedNotices,
    regularNotices,
    deleteNoticeLocal,
  } = useNotices();

  /* ✅ FILTER */
  const handleFilterChange = useCallback(
    (filters: any) => {
      getAllNotice(filters);
    },
    [getAllNotice]
  );

  /* ✅ ONLY API AFTER CREATE */
  const handleNoticeAdded = useCallback(() => {
    getAllNotice();
  }, [getAllNotice]);

  /* ✅ PAGINATION */
  const {
    page,
    rowsPerPage,
    totalItems,
    setTotalItems,
    setPage,
    setRowsPerPage,
  } = useNoticePagination(1, 8);

  useEffect(() => {
    setTotalItems(regularNotices?.length || 0);
  }, [regularNotices, setTotalItems]);

  const paginatedNotices = (regularNotices || []).slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Container maxWidth={false} sx={{ bgcolor: "#fafaf9", p: 1 }}>
      {/* HEADER */}
      <NoticeBoardHeader
        onFilterChange={handleFilterChange}
        onNoticeAdded={handleNoticeAdded}
        categories={meta?.categories || []}
        priorities={meta?.priorities || []}
      />

      {loading ? (
        <Box sx={gridStyles} mt={4}>
          {[...Array(6)].map((_, i) => (
            <NoticeShimmer key={i} />
          ))}
        </Box>
      ) : (
        <>
          {/* PINNED */}
          {pinnedNotices?.length > 0 && (
            <>
              <Stack direction="row" alignItems="center" spacing={1} mt={4} mb={2}>
                <PushPinIcon />
                <Typography variant="h6" fontWeight={600}>
                  Pinned Notices
                </Typography>
              </Stack>

              <Box sx={gridStyles} mb={4}>
                {pinnedNotices.map((notice) => (
                  <NoticeCard
                    key={notice._id}
                    notice={notice}
                    onDelete={deleteNoticeLocal}
                  />
                ))}
              </Box>
            </>
          )}

          {/* ALL */}
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Stack direction="row" spacing={1}>
              <ViewListIcon />
              <Typography variant="h6">All Notices</Typography>
            </Stack>

            <Box className="bg-white border min-w-[38px] h-[38px] flex items-center justify-center rounded-full">
              {regularNotices?.length || 0}
            </Box>
          </Stack>

          {/* LIST */}
          <Box sx={gridStyles}>
            {paginatedNotices.length > 0 ? (
              paginatedNotices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  onDelete={deleteNoticeLocal}
                />
              ))
            ) : (
              <Typography textAlign="center">No notices found</Typography>
            )}
          </Box>

          {/* PAGINATION */}
          <Pagination
            page={page}
            pageSize={rowsPerPage}
            total={totalItems}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setRowsPerPage(s);
              setPage(1);
            }}
          />
        </>
      )}
    </Container>
  );
}