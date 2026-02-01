"use client";

import React from "react";
import { Card, CardContent, Typography, Chip, Pagination } from "@mui/material";
import {
  Notifications,
  NotificationsNone,
  Schedule,
  Error as ErrorIcon,
} from "@mui/icons-material";

interface StatsCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  value,
  label,
  color,
}) => (
  <Card className="h-full shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
    <CardContent className="p-2.5 sm:p-4">
      <div className="flex items-center gap-1.5 flex-col justify-center">
        {icon}
        <div className="text-center">
          <Typography
            variant="h3"
            className={`font-bold text-2xl sm:text-3xl mb-1 ${color || ""}`}
          >
            {value}
          </Typography>
          <Typography
            variant="body2"
            className="text-gray-600 font-medium text-xs sm:text-sm uppercase tracking-wide"
          >
            {label}
          </Typography>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface NotificationStatsProps {
  total: number;
  unread: number;
  today: number;
  urgent: number;
}

export const NotificationStats: React.FC<NotificationStatsProps> = ({
  total,
  unread,
  today,
  urgent,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 w-full">
    <StatsCard
      icon={<Notifications color="primary" className="text-4xl sm:text-5xl" />}
      value={total}
      label="Total"
    />
    <StatsCard
      icon={
        <NotificationsNone color="error" className="text-4xl sm:text-5xl" />
      }
      value={unread}
      label="Unread"
      color="text-red-600"
    />
    <StatsCard
      icon={<Schedule color="warning" className="text-4xl sm:text-5xl" />}
      value={today}
      label="Today"
    />
    <StatsCard
      icon={<ErrorIcon color="error" className="text-4xl sm:text-5xl" />}
      value={urgent}
      label="Urgent"
    />
  </div>
);

export const CustomPagination: React.FC<{
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}> = ({ totalPages, currentPage, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="p-2 sm:p-3 flex justify-center">
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        size="medium"
        siblingCount={1}
        boundaryCount={1}
        className="[&_.MuiPaginationItem-root]:text-xs [&_.MuiPaginationItem-root]:sm:text-sm"
      />
    </div>
  );
};
