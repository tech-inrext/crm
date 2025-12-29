import React from "react";
import { Box, IconButton, Badge } from "@/components/ui/Component";
import {
  Edit as EditIcon,
  Feedback as FeedbackIcon,
  PermissionGuard,
} from "@/components/ui/Component";

interface LeadsTableActionsProps {
  row: any;
  onEdit: (row: any) => void;
  onFeedback: (leadId: string) => void;
}

export const LeadsTableActions: React.FC<LeadsTableActionsProps> = ({
  row,
  onEdit,
  onFeedback,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 0.5,
        pl: 0.5,
      }}
    >
      <PermissionGuard module="lead" action="write" fallback={null}>
        <IconButton onClick={() => onEdit(row)} size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </PermissionGuard>

      <IconButton
        size="small"
        onClick={() => onFeedback(row.leadId || row._id || row.id)}
      >
        <Badge
          badgeContent={(row.followUpNotes && row.followUpNotes.length) || 0}
          color="primary"
        >
          <FeedbackIcon fontSize="small" />
        </Badge>
      </IconButton>
    </Box>
  );
};
