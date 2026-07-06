"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import NoticeBoardHeader from "@/fe/pages/Notice/component/NoticeBoardHeader";
import Pagination from "@/components/ui/Navigation/Pagination";
import { Box, Typography, Stack, Container } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import NoticeCard from "@/fe/pages/Notice/component/NoticeCard";
import NoticeShimmer from "@/fe/pages/Notice/component/NoticeShimmer";
import useNotices from "@/fe/pages/Notice/hooks/useNoticeDashboard";
import { gridStyles, categoryColors, priorityColors } from "@/fe/pages/Notice/utils/noticeUtils";
import { useNoticePagination } from "@/fe/pages/Notice/hooks/useNoticePagination";

export default function NoticesDashboard() {
  const {
    notices,
    meta,
    loading,
    getAllNotice,
    pinnedNotices,
    regularNotices,
    deleteNoticeLocal,
    updateNoticeLocal,
  } = useNotices();

  /* ✅ FILTER */
  const handleFilterChange = useCallback(
    (filters: any) => {
      getAllNotice(filters);
    },
    [getAllNotice],
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

  const combinedNotices = useMemo(() => {
    return [...(pinnedNotices || []), ...(regularNotices || [])];
  }, [pinnedNotices, regularNotices]);

  useEffect(() => {
    setTotalItems(combinedNotices.length);
  }, [combinedNotices, setTotalItems]);

  const paginatedNotices = combinedNotices.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  // Compute stats for header
  const totalNoticesCount = notices?.length || 0;
  const urgentCount = notices?.filter((n: any) => n.priority === "Urgent")?.length || 0;
  const pinnedCount = pinnedNotices?.length || 0;
  const categoriesCount = new Set(notices?.map((n: any) => n.category)).size;

  const categories = Object.keys(categoryColors);
  const priorities = Object.keys(priorityColors);

  return (
    <Container maxWidth={false} sx={{ bgcolor: "#fafaf9", p: 1 }}>
      {/* HEADER */}
      <NoticeBoardHeader
        onFilterChange={handleFilterChange}
        onNoticeAdded={handleNoticeAdded}
        categories={categories}
        priorities={priorities}
        stats={{
          totalNotices: totalNoticesCount,
          urgent: urgentCount,
          pinned: pinnedCount,
          categories: categoriesCount
        }}
      />

      {loading ? (
        <Box sx={gridStyles} mt={4}>
          {[...Array(6)].map((_, i) => (
            <NoticeShimmer key={i} />
          ))}
        </Box>
      ) : (
        <>
          {/* ALL NOTICES */}
          <Box sx={gridStyles} mb={4}>
            {paginatedNotices.length > 0 ? (
              paginatedNotices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  onDelete={deleteNoticeLocal}
                  getAllNotice={getAllNotice}
                  updateNoticeLocal={updateNoticeLocal}
                />
              ))
            ) : (
              <Typography textAlign="center" width="100%">No notices found</Typography>
            )}
          </Box>

          {/* PAGINATION */}
          {combinedNotices.length > 0 && (
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
          )}
        </>
      )}
    </Container>
  );
}
