"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsNone,
  CheckCircle,
  Info,
  Warning,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useNotifications } from "../../../contexts/NotificationContext";
import { useNotificationActions } from "../../../hooks/useNotifications";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationBulkActions } from "./NotificationBulkActions";
import { formatDistanceToNow } from "date-fns";

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
  const iconProps = { fontSize: "small" as const };
  switch (priority) {
    case "URGENT":
      return <ErrorIcon color="error" {...iconProps} />;
    case "HIGH":
      return <Warning color="warning" {...iconProps} />;
    case "MEDIUM":
      return <Info color="info" {...iconProps} />;
    case "LOW":
    default:
      return <CheckCircle color="action" {...iconProps} />;
  }
};

const SimpleNotificationList: React.FC<{
  notifications: any[];
  loading: boolean;
  hasMore: boolean;
  isClient: boolean;
  onLoadMore: () => void;
  onNotificationClick: (notification: any) => void;
}> = ({
  notifications,
  loading,
  hasMore,
  isClient,
  onLoadMore,
  onNotificationClick,
}) => {
  if (loading && notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading notifications...
        </Typography>
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <NotificationsNone
          sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          No notifications yet
        </Typography>
      </Box>
    );
  }

  const formatTime = (dateString: string) => {
    if (!isClient) return "moments ago";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  return (
    <>
      <List sx={{ p: 0 }}>
        {notifications.map((notification, index) => {
          const isUnread = notification.lifecycle.status !== "READ";
          const priority = notification.metadata?.priority || "LOW";

          return (
            <React.Fragment key={notification._id}>
              <ListItem
                sx={{
                  cursor: "pointer",
                  backgroundColor: isUnread ? "action.hover" : "transparent",
                  "&:hover": { backgroundColor: "action.selected" },
                  borderLeft: isUnread ? "4px solid" : "4px solid transparent",
                  borderColor: isUnread
                    ? `${getPriorityColor(priority)}.main`
                    : "transparent",
                  py: 1.5,
                  px: 2,
                }}
                onClick={() => onNotificationClick(notification)}
              >
                <Box sx={{ minWidth: 32, mr: 1 }}>
                  {getPriorityIcon(priority)}
                </Box>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={isUnread ? 600 : 400}
                        sx={{ flex: 1 }}
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={priority}
                        size="small"
                        color={getPriorityColor(priority) as any}
                        variant="outlined"
                        sx={{ fontSize: "0.65rem", height: 18 }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          fontSize: "0.875rem",
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.disabled"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        {formatTime(notification.createdAt)}
                        {notification.sender && (
                          <> • {notification.sender.name}</>
                        )}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
      {hasMore && (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Button
            onClick={onLoadMore}
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
    </>
  );
};

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    loadMoreNotifications,
    hasMore,
    clearError,
    forceRefresh,
    markAsRead,
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
    onSuccess: (action, count) =>
      console.log(`Successfully ${action} ${count} notifications`),
    onError: (action, error) => console.error(`Failed to ${action}:`, error),
  });

  useEffect(() => setIsClient(true), []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => {
    setAnchorEl(null);
    clearSelection();
  };

  const handleNotificationClick = async (notification: any) => {
    if (notification.lifecycle.status !== "READ") {
      await markAsRead([notification._id], { actionType: "CLICKED" });
    }
    handleClose();

    if (notification.metadata?.actionUrl) {
      if (notification.metadata.actionUrl.startsWith("/")) {
        const leadMatch = notification.metadata.actionUrl.match(
          /\/dashboard\/leads\/([a-zA-Z0-9]+)$/
        );
        const userMatch = notification.metadata.actionUrl.match(
          /\/dashboard\/users\/([a-zA-Z0-9]+)$/
        );

        if (leadMatch) {
          router.push(
            `/dashboard/leads?openDialog=true&leadId=${leadMatch[1]}`
          );
        } else if (userMatch) {
          router.push(
            `/dashboard/users?openDialog=true&userId=${userMatch[1]}`
          );
        } else {
          router.push(notification.metadata.actionUrl);
        }
      } else {
        window.location.href = notification.metadata.actionUrl;
      }
      return;
    }
    router.push("/dashboard/notifications");
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
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
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
          <NotificationHeader
            unreadCount={unreadCount}
            loading={loading}
            actionLoading={actionLoading}
            onMarkAllRead={markAllAsReadAction}
            onRefresh={forceRefresh}
            onClose={handleClose}
          />

          {error && (
            <Alert severity="error" onClose={clearError} sx={{ m: 1 }}>
              {error}
            </Alert>
          )}

          {hasSelectedItems && (
            <NotificationBulkActions
              selectedCount={selectedIds.length}
              actionLoading={actionLoading}
              onMarkAsRead={markSelectedAsRead}
              onArchive={archiveSelected}
              onDelete={deleteSelected}
            />
          )}

          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            <SimpleNotificationList
              notifications={notifications}
              loading={loading}
              hasMore={hasMore}
              isClient={isClient}
              onLoadMore={loadMoreNotifications}
              onNotificationClick={handleNotificationClick}
            />
          </Box>

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
