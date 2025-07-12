import React, { useState } from "react";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import { Settings, Security } from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";
import Skeleton from "@mui/material/Skeleton";

interface RoleCardProps {
  role: any;
  idx: number;
  openEdit: (idx: number) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, idx, openEdit }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.08)",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(25, 118, 210, 0.18)",
          transform: "translateY(-4px) scale(1.02)",
          borderColor: "primary.light",
        },
        border: "1.5px solid",
        borderColor: "divider",
        background: "linear-gradient(135deg, #fafdff 0%, #f1f5fa 100%)",
        minWidth: { xs: "100%", sm: 270 },
        minHeight: { xs: 70, sm: 120 },
        maxWidth: { xs: "100%", sm: 340 },
        m: { xs: 0, sm: 1 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: { xs: "100%", sm: "auto" },
        p: { xs: 0.5, sm: 0 },
        cursor: "pointer",
      }}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <CardContent
        sx={{
          p: { xs: 1, sm: 3 },
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Stack spacing={1.2} sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: { xs: 38, sm: 56 },
                height: { xs: 38, sm: 56 },
                fontSize: { xs: "1rem", sm: "1.5rem" },
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.15)",
              }}
            >
              <Security fontSize="small" />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                color="text.primary"
                noWrap
                sx={{
                  letterSpacing: 0.5,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {role.name}
              </Typography>
            </Box>
            <PermissionGuard module="role" action="write" fallback={<></>}>
              <Tooltip title="Edit Role">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(idx);
                  }}
                  size="small"
                  sx={{
                    backgroundColor: "#e3f2fd",
                    color: "primary.main",
                    border: "1px solid #90caf9",
                    "&:hover": {
                      backgroundColor: "primary.light",
                      color: "white",
                    },
                    boxShadow: "0 2px 8px rgba(25, 118, 210, 0.10)",
                  }}
                >
                  <Settings fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          </Box>
          {expanded && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Permissions
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7 }}>
                  {role.permissions.length === 0 ? (
                    <Chip
                      label="No permissions"
                      size="small"
                      sx={{
                        backgroundColor: "#f5f5f5",
                        color: "text.secondary",
                        fontWeight: 500,
                        fontSize: "0.8rem",
                      }}
                    />
                  ) : (
                    role.permissions.map((perm: string, permIdx: number) => {
                      const [module, action] = perm.split(":");
                      const actionColor =
                        action === "read"
                          ? "#2196F3"
                          : action === "write"
                          ? "#FF9800"
                          : "#F44336";
                      return (
                        <Chip
                          key={permIdx}
                          label={`${module} ${action}`}
                          size="small"
                          sx={{
                            backgroundColor: actionColor,
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            mb: 0.5,
                          }}
                        />
                      );
                    })
                  )}
                </Box>
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export const LoadingSkeleton = () => (
  <Box sx={{ mt: 2 }}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} sx={{ mb: 2, p: 2 }}>
        <Stack spacing={1}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="rectangular" width="100%" height={60} />
        </Stack>
      </Card>
    ))}
  </Box>
);

export default RoleCard;
