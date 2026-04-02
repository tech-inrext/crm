"use client";

import React, { useEffect } from "react";
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
  const { meta, loading, fetchNotices, pinnedNotices, regularNotices } =
    useNotices();

  /* ---------------- FILTER ---------------- */

  const handleFilterChange = (filters: any) => {
    fetchNotices(filters);
  };

  /* ---------------- AUTO REFRESH ---------------- */

  const handleNoticeAdded = () => {
    fetchNotices(); // refresh notices after publish
  };

  /* ---------------- PAGINATION ---------------- */

  const {
    page,
    rowsPerPage,
    totalItems,
    setTotalItems,
    setPage,
    setRowsPerPage,
  } = useNoticePagination(1, 6);

  useEffect(() => {
    setTotalItems(regularNotices.length);
  }, [regularNotices, setTotalItems]);

  const paginatedNotices = regularNotices.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        bgcolor: "#fafaf9",
        p: 1,
        ml: { xs: 0, sm: 0.5 },
      }}
    >
      {/* HEADER */}

      <NoticeBoardHeader
        onFilterChange={handleFilterChange}
        onNoticeAdded={handleNoticeAdded}   // ✅ important
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

          {/* All Notices */}

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

          <Box
            sx={{
              ...gridStyles,
              minHeight: 380,
              display: regularNotices.length === 0 ? "flex" : "grid",
              alignItems: "center",
              justifyContent: "center",
              gridAutoRows: "max-content",
            }}
          >
            {paginatedNotices.length > 0 ? (
              paginatedNotices.map((notice) => (
                <NoticeCard
                  key={notice._id}
                  notice={notice}
                  showBorder={false}
                />
              ))
            ) : (
              <Typography
                color="text.secondary"
                className="text-center text-lg font-medium"
              >
                No notices found
              </Typography>
            )}
          </Box>

          {/* Pagination */}

          <Box sx={{ mt: 2 }}>
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
          </Box>
        </>
      )}
    </Container>
  );
}