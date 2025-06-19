import { memo, useMemo } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Email, Phone, TrendingUp, Edit, Delete } from "@mui/icons-material";
import type { LeadDisplay as Lead } from "../../types/lead";
import StatusChip, { getStatusColor } from "./StatusChip";
import PermissionGuard from "../PermissionGuard";

// Style constants
const GRADIENTS = {
  paper: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
};

const COMMON_STYLES = {
  iconButton: (bg: string, hover?: string) => ({
    backgroundColor: bg,
    color: "white",
    "&:hover": { backgroundColor: hover || `${bg}99` },
  }),
};

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const LeadCard = memo(({ lead, onEdit, onDelete }: LeadCardProps) => {
  const avatar = useMemo(() => {
    if (lead?.fullName) {
      return lead?.fullName?.substring(0, 2).toUpperCase();
    }
    return "N/A";
  }, [lead]);

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          elevation: 8,
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
        },
        border: "1px solid",
        borderColor: "divider",
        background: GRADIENTS.paper,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: getStatusColor(lead.status),
                  width: 48,
                  height: 48,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                {avatar}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {lead?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {lead.id}
                </Typography>
              </Box>
            </Box>
            <StatusChip status={lead.status} />
          </Box>

          <Divider />

          <Stack spacing={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Email sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography variant="body2" color="text.primary">
                {lead.email || "Not provided"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                component="a"
                href={`tel:${lead.phone}`}
                variant="body2"
                color="primary.main"
                gap={1}
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                    cursor: "pointer",
                  },
                }}
              >
                <Phone
                  sx={{
                    color: "text.secondary",
                    fontSize: 18,
                  }}
                />
                {lead.phone}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUp sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                {lead.budgetRange}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
          >
            <PermissionGuard module="lead" action="write" fallback={<></>}>
              <Tooltip title="Edit Lead">
                <IconButton
                  onClick={() => onEdit(lead)}
                  size="small"
                  sx={COMMON_STYLES.iconButton("primary.main", "primary.dark")}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
});

LeadCard.displayName = "LeadCard";

export default LeadCard;
