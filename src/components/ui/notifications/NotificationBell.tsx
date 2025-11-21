"use client";

import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsNone,
  MarkAsUnread,
  Archive,
  Delete,
  CheckCircle,
  Info,
  Warning,
  Error as ErrorIcon,
  Close,
} from "@mui/icons-material";
import { useNotifications } from "../../../contexts/NotificationContext";
import { useNotificationActions } from "../../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    loadMoreNotifications,
    hasMore,
    clearError,
  } = useNotifications();

  const {
    selectedIds,
    actionLoading,
    toggleSelection,
    markSelectedAsRead,
    markAllAsReadAction,
    archiveSelected,
    deleteSelected,
    clearSelection,
    hasSelectedItems,
  } = useNotificationActions({
    onSuccess: (action, count) => {
      console.log(`Successfully ${action} ${count} notifications`);
    },
    onError: (action, error) => {
      console.error(`Failed to ${action}:`, error);
    },
  });

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    clearSelection();
  };

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

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if unread
    if (notification.lifecycle.status !== "READ") {
      await markSelectedAsRead();
    }

    // Navigate to action URL if present
    if (notification.metadata.actionUrl) {
      handleClose();
      window.location.href = notification.metadata.actionUrl;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Box>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={() => markAllAsReadAction()}
                  disabled={loading || actionLoading === "mark all as read"}
                >
                  {actionLoading === "mark all as read" ? (
                    <CircularProgress size={16} />
                  ) : (
                    "Mark all read"
                  )}
                </Button>
              )}
              <IconButton size="small" onClick={handleClose}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={clearError} sx={{ m: 1 }}>
              {error}
            </Alert>
          )}

          {/* Bulk Actions */}
          {hasSelectedItems && (
            <Box
              sx={{
                p: 1,
                backgroundColor: "action.hover",
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                {selectedIds.length} selected
              </Typography>
              <IconButton
                size="small"
                onClick={() => markSelectedAsRead()}
                disabled={actionLoading === "mark as read"}
                title="Mark as read"
              >
                <MarkAsUnread fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => archiveSelected()}
                disabled={actionLoading === "archive"}
                title="Archive"
              >
                <Archive fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => deleteSelected()}
                disabled={actionLoading === "delete"}
                title="Delete"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Notifications List */}
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            {loading && notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Loading notifications...
                </Typography>
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <NotificationsNone
                  sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification._id}>
                    <ListItem
                      sx={{
                        cursor: "pointer",
                        backgroundColor:
                          notification.lifecycle.status === "READ"
                            ? "transparent"
                            : "action.hover",
                        "&:hover": {
                          backgroundColor: "action.selected",
                        },
                        borderLeft:
                          notification.lifecycle.status !== "READ"
                            ? "4px solid"
                            : "4px solid transparent",
                        borderColor:
                          notification.lifecycle.status !== "READ"
                            ? `${getPriorityColor(
                                notification.metadata.priority
                              )}.main`
                            : "transparent",
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <ListItemIcon
                        sx={{ minWidth: 40 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(notification._id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(notification._id)}
                          onChange={() => toggleSelection(notification._id)}
                          style={{ cursor: "pointer" }}
                        />
                      </ListItemIcon>

                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getPriorityIcon(notification.metadata.priority)}
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={
                                notification.lifecycle.status !== "READ"
                                  ? 600
                                  : 400
                              }
                              sx={{
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Chip
                              label={notification.metadata.priority}
                              size="small"
                              color={
                                getPriorityColor(
                                  notification.metadata.priority
                                ) as any
                              }
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                mb: 0.5,
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {formatNotificationTime(notification.createdAt)}
                              {notification.sender && (
                                <> • from {notification.sender.name}</>
                              )}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* Load More */}
            {hasMore && (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Button
                  onClick={loadMoreNotifications}
                  disabled={loading}
                  variant="text"
                  size="small"
                >
                  {loading ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Loading...
                    </>
                  ) : (
                    "Load more"
                  )}
                </Button>
              </Box>
            )}
          </Box>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  handleClose();
                  // Navigate to notifications page when implemented
                  window.location.href = "/dashboard/notifications";
                }}
              >
                View all notifications
              </Button>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
