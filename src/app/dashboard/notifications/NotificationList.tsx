"use client";

import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Typography,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  NotificationsNone,
  Assignment,
  Business,
  Info,
} from "@mui/icons-material";
import { formatNotificationTime, getPriorityColor } from "./utils";

interface NotificationListProps {
  notifications: any[];
  selectedIds: string[];
  isClient: boolean;
  loading: boolean;
  onToggleSelection: (id: string) => void;
  onNotificationClick: (notification: any) => void;
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, JSX.Element> = {
    LEAD_ASSIGNED: <Assignment color="primary" />,
    LEAD_STATUS_UPDATE: <Business color="info" />,
  };
  return icons[type] || <Info color="action" />;
};

const getPriorityIcon = (priority: string) => {
  const icons: Record<string, string> = {
    URGENT: "🔴",
    HIGH: "🟠",
    MEDIUM: "🔵",
    LOW: "⚪",
  };
  return icons[priority] || "⚪";
};

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  selectedIds,
  isClient,
  loading,
  onToggleSelection,
  onNotificationClick,
}) => {
  if (loading && notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <CircularProgress size={40} />
        <Typography variant="body1" className="mt-2">
          Loading notifications...
        </Typography>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <NotificationsNone className="text-6xl text-gray-400 mb-2" />
        <Typography variant="h6" className="text-gray-600">
          No notifications found
        </Typography>
        <Typography variant="body2" className="text-gray-500">
          You're all caught up!
        </Typography>
      </div>
    );
  }

  return (
    <List className="p-0">
      {notifications.map((notification, index) => (
        <React.Fragment key={notification._id}>
          <ListItem
            onClick={() => onNotificationClick(notification)}
            className={`w-full flex items-start cursor-pointer ${
              notification.lifecycle.status === "READ"
                ? "bg-transparent"
                : "bg-blue-50 sm:bg-gray-100"
            } ${
              notification.lifecycle.status !== "READ"
                ? "border-l-4 border-blue-600"
                : "border-l-4 border-transparent"
            } py-2 sm:py-3 px-1 sm:px-3 gap-1 transition-colors hover:bg-gray-100`}
          >
            <ListItemIcon className="min-w-[32px] sm:min-w-[40px] mt-1">
              <Checkbox
                size="small"
                checked={selectedIds.includes(notification._id)}
                onChange={() => onToggleSelection(notification._id)}
                className="p-1"
              />
            </ListItemIcon>

            <ListItemIcon className="hidden sm:flex min-w-[40px] mt-1">
              {getTypeIcon(notification.type)}
            </ListItemIcon>

            <ListItemText
              className="flex-1 my-0"
              primary={
                <div className="flex items-start gap-1 mb-1 flex-wrap w-full">
                  <Typography
                    variant="h6"
                    component="span"
                    className={`flex-1 text-sm sm:text-base ${
                      notification.lifecycle.status !== "READ"
                        ? "font-semibold"
                        : "font-normal"
                    }`}
                  >
                    {notification.title}
                  </Typography>
                  <Chip
                    label={notification.metadata.priority}
                    size="small"
                    color={
                      getPriorityColor(notification.metadata.priority) as any
                    }
                    variant="outlined"
                    className="h-5 sm:h-6 text-xs"
                  />
                </div>
              }
              secondary={
                <span className="flex flex-col gap-1">
                  <span className="text-gray-600 text-xs sm:text-sm line-clamp-2 block">
                    {notification.message}
                  </span>
                  <span className="flex items-center gap-1 flex-wrap">
                    <Chip
                      label={notification.type.replace(/_/g, " ")}
                      size="small"
                      variant="outlined"
                      className="hidden sm:inline-flex h-5 text-xs"
                    />
                    <span className="text-gray-400 text-xs">
                      {formatNotificationTime(notification.createdAt, isClient)}
                    </span>
                    <Chip
                      label={notification.lifecycle.status}
                      size="small"
                      color={
                        notification.lifecycle.status === "READ"
                          ? "default"
                          : "primary"
                      }
                      className="h-5 text-xs"
                    />
                  </span>
                </span>
              }
              secondaryTypographyProps={{
                component: "span",
              }}
            />
          </ListItem>
          {index < notifications.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};
