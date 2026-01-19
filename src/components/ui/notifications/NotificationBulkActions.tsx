import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { MarkAsUnread, Archive, Delete } from "@mui/icons-material";

interface NotificationBulkActionsProps {
  selectedCount: number;
  actionLoading: string | null;
  onMarkAsRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const NotificationBulkActions: React.FC<
  NotificationBulkActionsProps
> = ({ selectedCount, actionLoading, onMarkAsRead, onArchive, onDelete }) => {
  return (
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
        {selectedCount} selected
      </Typography>
      <IconButton
        size="small"
        onClick={onMarkAsRead}
        disabled={actionLoading === "mark as read"}
        title="Mark as read"
      >
        <MarkAsUnread fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={onArchive}
        disabled={actionLoading === "archive"}
        title="Archive"
      >
        <Archive fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={onDelete}
        disabled={actionLoading === "delete"}
        title="Delete"
      >
        <Delete fontSize="small" />
      </IconButton>
    </Box>
  );
};
