import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";

interface NotificationHeaderProps {
  unreadCount: number;
  loading: boolean;
  actionLoading: string | null;
  onMarkAllRead: () => void;
  onRefresh: () => void;
  onClose: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  unreadCount,
  loading,
  actionLoading,
  onMarkAllRead,
  onRefresh,
  onClose,
}) => {
  return (
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
            onClick={() => onMarkAllRead()}
            disabled={loading || actionLoading === "mark all as read"}
          >
            {actionLoading === "mark all as read" ? (
              <CircularProgress size={16} />
            ) : (
              "Mark all read"
            )}
          </Button>
        )}
        <Button
          size="small"
          onClick={onRefresh}
          disabled={loading}
          title="Refresh notifications"
        >
          Refresh
        </Button>
        <IconButton size="small" onClick={onClose}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};
