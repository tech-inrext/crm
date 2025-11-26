"use client";

import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import {
  MoreVert,
  CheckCircle,
  Info,
  Warning,
  Error as ErrorIcon,
  Person,
  Business,
  DirectionsCar,
  Home,
  Announcement,
  Assignment,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "../../../contexts/NotificationContext";
import { useNotificationItem } from "../../../hooks/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  selected?: boolean;
  onSelect?: (notificationId: string) => void;
  onMenuClick?: (notification: Notification, event: React.MouseEvent) => void;
  showActions?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  selected = false,
  onSelect,
  onMenuClick,
  showActions = true,
}) => {
  const { isRead, handleNotificationClick, priority, hasActionUrl } =
    useNotificationItem(notification);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      case "LOW":
      default:
        return "default";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <ErrorIcon color="error" fontSize="small" />;
      case "HIGH":
        return <Warning color="warning" fontSize="small" />;
      case "MEDIUM":
        return <Info color="info" fontSize="small" />;
      case "LOW":
      default:
        return <CheckCircle color="action" fontSize="small" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LEAD_ASSIGNED":
      case "LEAD_STATUS_UPDATE":
      case "LEAD_FOLLOWUP_DUE":
        return <Assignment color="primary" />;
      case "CAB_BOOKING_APPROVED":
      case "CAB_BOOKING_REJECTED":
      case "CAB_BOOKING_ASSIGNED":
      case "CAB_BOOKING_REQUEST":
        return <DirectionsCar color="secondary" />;
      case "VENDOR_BOOKING_UPDATE":
      case "VENDOR_ASSIGNED":
        return <Business color="info" />;
      case "PROPERTY_UPLOADED":
      case "PROPERTY_STATUS_UPDATE":
        return <Home color="success" />;
      case "USER_ROLE_CHANGED":
      case "NEW_USER_ADDED":
        return <Person color="warning" />;
      case "SYSTEM_ANNOUNCEMENT":
        return <Announcement color="error" />;
      default:
        return <Info color="action" />;
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const getTypeDisplayName = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleCardClick = (event: React.MouseEvent) => {
    // Don't trigger click if clicking on actions
    if ((event.target as HTMLElement).closest(".notification-actions")) {
      return;
    }
    handleNotificationClick();
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: hasActionUrl ? "pointer" : "default",
        backgroundColor: isRead ? "transparent" : "action.hover",
        border: selected ? "2px solid primary.main" : "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderLeft: !isRead ? "4px solid" : "4px solid transparent",
        borderLeftColor: !isRead
          ? `${getPriorityColor(priority)}.main`
          : "transparent",
        "&:hover": {
          boxShadow: 2,
          borderColor: "primary.light",
        },
        transition: "all 0.2s ease-in-out",
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          {/* Selection checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(notification._id)}
              onClick={(e) => e.stopPropagation()}
              style={{
                marginTop: 8,
                cursor: "pointer",
                transform: "scale(1.2)",
              }}
            />
          )}

          {/* Notification Icon */}
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: isRead ? "grey.200" : "background.paper",
              border: "1px solid",
              borderColor: isRead ? "grey.300" : "primary.main",
            }}
          >
            {getNotificationIcon(notification.type)}
          </Avatar>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography
                variant="subtitle2"
                fontWeight={isRead ? 500 : 700}
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {notification.title}
              </Typography>

              {/* Priority Badge */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {getPriorityIcon(priority)}
                <Chip
                  label={priority}
                  size="small"
                  color={getPriorityColor(priority) as any}
                  variant={isRead ? "outlined" : "filled"}
                  sx={{
                    fontSize: "0.7rem",
                    height: 20,
                    fontWeight: isRead ? 400 : 600,
                  }}
                />
              </Box>

              {/* Actions */}
              {showActions && onMenuClick && (
                <div className="notification-actions">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMenuClick(notification, e);
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </div>
              )}
            </Box>

            {/* Message */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.4,
              }}
            >
              {notification.message}
            </Typography>

            {/* Footer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={getTypeDisplayName(notification.type)}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.65rem",
                    height: 18,
                    bgcolor: isRead ? "transparent" : "background.paper",
                  }}
                />

                <Typography variant="caption" color="text.disabled">
                  {formatNotificationTime(notification.createdAt)}
                </Typography>

                {notification.sender && (
                  <>
                    <Typography variant="caption" color="text.disabled">
                      •
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      from {notification.sender.name}
                    </Typography>
                  </>
                )}
              </Box>

              {/* Action Button */}
              {hasActionUrl && (
                <Button
                  size="small"
                  variant={isRead ? "outlined" : "contained"}
                  color="primary"
                  sx={{
                    fontSize: "0.7rem",
                    minWidth: "auto",
                    px: 1.5,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotificationClick();
                  }}
                >
                  View
                </Button>
              )}
            </Box>

            {/* Read status indicator */}
            {!isRead && (
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: `${getPriorityColor(priority)}.main`,
                }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationItem;
