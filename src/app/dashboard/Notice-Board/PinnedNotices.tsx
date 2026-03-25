"use client";

import React from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
  Container,
} from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import ViewListIcon from "@mui/icons-material/ViewList";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// Example data
const notices = [
  {
    category: "Urgent Alerts",
    priority: "Urgent",
    title: "Emergency: Server Maintenance",
    description: "The CRM and main database will be down...",
    date: "Mar 24, 11:46 AM",
    author: "Admin Team",
    color: "#f44336",
    priorityColor: "#d32f2f",
    pinned: true,
  },
  {
    category: "Project Updates",
    priority: "Info",
    title: "New Luxury Villa Project Launch",
    description: "We are thrilled to announce the launch...",
    date: "Mar 24, 9:46 AM",
    author: "Project Manager",
    color: "#9c27b0",
    priorityColor: "#1976d2",
    pinned: false,
  },
  {
    category: "Project Updates",
    priority: "Info",
    title: "New Luxury Villa Project Launch",
    description: "We are thrilled to announce the launch...",
    date: "Mar 24, 9:46 AM",
    author: "Marketing Team",
    color: "#9c27b0",
    priorityColor: "#1976d2",
    pinned: false,
  },
  {
    category: "Sales Targets",
    priority: "Important",
    title: "Updated Commission Structure",
    description: "The commission structure has been revised...",
    date: "Mar 23, 11:46 AM",
    author: "Sales Head",
    color: "#3f51b5",
    priorityColor: "#ed6c02",
    pinned: false,
  },
];

// Grid styles
const gridStyles = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
  },
  gap: 2,
};

// NoticeCard component
function NoticeCard({
  notice,
  showBorder = true,
}: {
  notice: (typeof notices)[0];
  showBorder?: boolean;
}) {
  return (
   <Card
  className="!rounded-2xl flex flex-col h-full"
  style={{
    borderLeft: showBorder ? `4px solid ${notice.color}` : "none",
  }}
>
      <CardContent className="flex flex-col flex-grow">
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Chip
            label={notice.category}
            size="small"
            sx={{ color: notice.color }}
          />

          {notice.priority && (
            <Chip
              icon={
                notice.priorityColor && (
                  <FiberManualRecordIcon
                    sx={{ fontSize: 10, color: notice.priorityColor }}
                  />
                )
              }
              label={notice.priority}
              size="small"
              sx={{
                backgroundColor: notice.priorityColor
                  ? `${notice.priorityColor}20`
                  : "transparent",
                color: notice.priorityColor || notice.color,
              }}
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

        {/* Author + Date */}
        <Stack className="justify-between items-center mt-1" direction="row">
          <Typography fontSize={12} color="text.secondary">
            By {notice.author}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            {notice.date}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function NoticesDashboard() {
  const pinnedNotices = notices.filter((n) => n.pinned);
  const regularNotices = notices.filter((n) => !n.pinned);

  return (
    <Container maxWidth={false} sx={{ bgcolor: "#fafaf9", p: 6 }}>
      {/* Pinned Notices */}
      {pinnedNotices.length > 0 && (
        <>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <PushPinIcon />
            <Typography variant="h6" fontWeight={600}>
              Pinned Notices
            </Typography>
          </Stack>

          <Box sx={gridStyles} mb={4}>
            {pinnedNotices.map((notice, i) => (
              <NoticeCard key={i} notice={notice} />
            ))}
          </Box>
        </>
      )}

      {/* All Notices */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <ViewListIcon />
        <Typography variant="h6" fontWeight={600}>
          All Notices
        </Typography>

        <Box className="bg-gray-200 px-1.5 py-0.5 rounded-full text-[13px]">
          {regularNotices.length}
        </Box>
      </Stack>

      <Box sx={gridStyles}>
        {regularNotices.map((notice, i) => (
          <NoticeCard key={i} notice={notice} showBorder={false} />
        ))}
      </Box>
    </Container>
  );
}
