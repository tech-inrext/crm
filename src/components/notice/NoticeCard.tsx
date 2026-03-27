"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Box,
} from "@mui/material";

import { categoryColors, priorityColors } from "@/utils/noticeUtils";

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

export default function NoticeCard({
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
            className="!font-semibold !rounded-lg !px-2"
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
              className="font-semibold rounded-full px-2"
              style={{
                backgroundColor: `${priorityColor}20`,
                color: priorityColor,
              }}
            />
          )}
        </Stack>

        <Box sx={{ flexGrow: 1 }}>
          <Typography className="font-bold text-[16px] mb-1 min-h-[48px]">
            {notice.title}
          </Typography>

          <Typography className="text-sm text-gray-500 mb-2 line-clamp-2 min-h-[40px]">
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