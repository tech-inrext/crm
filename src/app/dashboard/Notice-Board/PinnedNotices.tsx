"use client";

import React, { useEffect, useState } from "react";
import NoticeBoardHeader from "./NoticeBoardHeader";

import {
  Box,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
  Container,
  Skeleton,
} from "@mui/material";

import PushPinIcon from "@mui/icons-material/PushPin";
import ViewListIcon from "@mui/icons-material/ViewList";

// Notice Type
type Notice = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  pinned: boolean;
  createdAt: string;
  createdBy?: {
    name: string;
  };
};

// Meta Type
type Meta = {
  categories: string[];
  priorities: string[];
};

// Category Colors
const categoryColors: Record<string, string> = {
  "Urgent Alerts": "#f44336",
  "Project Updates": "#9c27b0",
  "Sales Targets": "#3f51b5",
  "Pricing / Offers": "#4caf50",
  "HR / Internal": "#ff9800",
  "General Announcements": "#1976d2",
};

// Priority Colors
const priorityColors: Record<string, string> = {
  Urgent: "#d32f2f",
  Important: "#ed6c02",
  Info: "#1976d2",
};

// Grid
const gridStyles = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
  },
  gap: 2,
};

// Notice Card
function NoticeCard({
  notice,
  showBorder = true,
}: {
  notice: Notice;
  showBorder?: boolean;
}) {
  const color = categoryColors[notice.category] || "#1976d2";
  const priorityColor = priorityColors[notice.priority] || "#1976d2";

  return (
    <Card
      className="!rounded-2xl flex flex-col h-full"
      style={{
        borderLeft: showBorder ? `4px solid ${color}` : "none",
      }}
    >
      <CardContent className="flex flex-col flex-grow">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Chip
            label={notice.category}
            size="small"
            variant="outlined"
            className="!font-semibold !rounded-lg !px-2 !border"
            style={{
              color: color,
              borderColor: `${color}40`,
              backgroundColor: `${color}10`,
            }}
          />

          {notice.priority && (
            <Chip
              label={notice.priority}
              size="small"
              className="font-semibold rounded-full px-2 shadow-sm flex items-center gap-2"
              style={{
                backgroundColor: `${priorityColor}20`,
                color: priorityColor,
              }}
              icon={
                <span className="relative flex h-3 w-3 ml-1">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: priorityColor }}
                  ></span>

                  <span
                    className="relative inline-flex rounded-full h-3 w-3"
                    style={{ backgroundColor: priorityColor }}
                  ></span>
                </span>
              }
            />
          )}
        </Stack>

        <Box sx={{ flexGrow: 1 }}>
          <Typography className="font-bold text-[16px] mb-1 min-h-[48px]">
            {notice.title}
          </Typography>

          <Typography className="!text-sm text-gray-500 mb-2 line-clamp-2 min-h-[40px]">
            {notice.description}
          </Typography>
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="space-between" mt={1}>
          <Typography fontSize={12} fontWeight={700} color="text.secondary">
            {notice.createdBy
              ? `By ${notice.createdBy.name}`
              : "Unknown Author"}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            {new Date(notice.createdAt).toLocaleDateString()}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Shimmer
function NoticeShimmer() {
  return (
    <Card className="!rounded-2xl">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Skeleton variant="rounded" width={100} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Stack>

        <Skeleton variant="text" height={30} />
        <Skeleton variant="text" height={30} />
        <Skeleton variant="text" height={20} width="80%" />

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between">
          <Skeleton width={100} />
          <Skeleton width={80} />
        </Stack>
      </CardContent>
    </Card>
  );
}

// Main
export default function NoticesDashboard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [meta, setMeta] = useState<Meta>({
    categories: [],
    priorities: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch Meta
  const fetchMeta = async () => {
    try {
      const res = await fetch("/api/v0/notice/meta");
      const data = await res.json();

      if (data.success) {
        setMeta(data.data);
      }
    } catch (error) {
      console.error("Meta Fetch Error:", error);
    }
  };

  // Fetch Notices
  const fetchNotices = async (filters: any = {}) => {
    try {
      setLoading(true);

      const query = new URLSearchParams();

      if (filters?.searchText?.trim()) {
        query.append("search", filters.searchText);
      }

      if (filters?.category && filters.category !== "All") {
        query.append("category", filters.category);
      }

      if (filters?.priority && filters.priority !== "All") {
        query.append("priority", filters.priority);
      }

      if (filters?.date) {
        query.append(
          "date",
          filters.date?.format
            ? filters.date.format("YYYY-MM-DD")
            : filters.date,
        );
      }

      const url = `/api/v0/notice${
        query.toString() ? `?${query.toString()}` : ""
      }`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setNotices(data.data);
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error("Fetch Notice Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    fetchNotices();
  }, []);

  const handleFilterChange = (filters: any) => {
    fetchNotices(filters);
  };

  const pinnedNotices = notices.filter((n) => n.pinned);
  const regularNotices = notices.filter((n) => !n.pinned);

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
          {pinnedNotices.length > 0 && (
            <>
             <Stack className="flex items-center !gap-2 !mt-4 !mb-2" direction="row">
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
              <Typography color="text.secondary">No notices found</Typography>
            )}
          </Box>
        </>
      )}
    </Container>
  );
}
