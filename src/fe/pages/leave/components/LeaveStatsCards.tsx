import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  EventAvailable as QuotaIcon,
  CheckCircleOutline as TakenIcon,
  HourglassEmpty as PendingIcon,
  BeachAccess as RemainingIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveStatsData } from "../types";

const TYPE_COLORS: Record<string, { main: string; bg: string }> = {
  "Casual Leave": { main: "#1976d2", bg: "#e3f2fd" },
  "Sick Leave": { main: "#e91e63", bg: "#fce4ec" },
  "Earned Leave": { main: "#9c27b0", bg: "#f3e5f5" },
  "Maternity Leave": { main: "#ed6c02", bg: "#fff3e0" },
  "Paternity Leave": { main: "#0288d1", bg: "#e0f7fa" },
  "Unpaid Leave": { main: "#757575", bg: "#f5f5f5" },
};

interface Props {
  refreshTrigger?: number;
  employeeId?: string;
}

const LeaveStatsCards: React.FC<Props> = ({ refreshTrigger, employeeId }) => {
  const [stats, setStats] = useState<LeaveStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!stats) {
      setLoading(true);
    }
    try {
      const res = await leaveApi.getLeaveStats(employeeId);
      if (res?.success && res?.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch leave stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger, employeeId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={30} sx={{ color: "#1976d2" }} />
      </Box>
    );
  }

  if (!stats) return null;

  const { summary, breakdown } = stats;

  const mainCards = [
    {
      title: "Total Leaves",
      value: `${summary.totalAllocated} Days`,
      subtitle: "Annual Quota",
      icon: <QuotaIcon sx={{ fontSize: 28, color: "#1976d2" }} />,
      bg: "#f0f7ff",
      border: "#bbe0ff",
    },
    {
      title: "Leaves Taken",
      value: `${summary.totalTaken} Days`,
      subtitle: "Approved",
      icon: <TakenIcon sx={{ fontSize: 28, color: "#2e7d32" }} />,
      bg: "#f1f8e9",
      border: "#c8e6c9",
    },
    {
      title: "Pending Approval",
      value: `${summary.totalPending} Days`,
      subtitle: "Awaiting Action",
      icon: <PendingIcon sx={{ fontSize: 28, color: "#ed6c02" }} />,
      bg: "#fff8e1",
      border: "#ffe082",
    },
    {
      title: "Remaining Balance",
      value: `${summary.totalRemaining} Days`,
      subtitle: "Available to Use",
      icon: <RemainingIcon sx={{ fontSize: 28, color: "#9c27b0" }} />,
      bg: "#faf0ca",
      border: "#f3d57e",
    },
  ];

  return (
    <Box mb={4}>
      {/* Overview Stat Cards */}
      <Typography variant="subtitle2" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
        Leave Overview & Balance
      </Typography>
      <Grid container spacing={2.5} mb={3}>
        {mainCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                backgroundColor: card.bg,
                border: `1px solid ${card.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                },
              }}
            >
              <Box>
                <Typography variant="caption" fontWeight="600" color="#64748b">
                  {card.title}
                </Typography>
                <Typography variant="h5" fontWeight="800" color="#1e293b" my={0.5}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="#94a3b8" fontWeight="500">
                  {card.subtitle}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  backgroundColor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quota Breakdown Per Leave Type */}
      <Typography variant="subtitle2" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
        Leave Type Quota Breakdown
      </Typography>
      <Grid container spacing={2}>
        {breakdown.map((item) => {
          const colors = TYPE_COLORS[item.leaveType] || { main: "#1976d2", bg: "#e3f2fd" };
          const isUnlimited = item.quota === 0;
          const percentage = isUnlimited ? 0 : Math.min(100, Math.round((item.taken / item.quota) * 100));

          return (
            <Grid item xs={12} sm={6} md={4} key={item.leaveType}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor: "#ffffff",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: colors.main,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: colors.main,
                      }}
                    />
                    <Typography variant="body2" fontWeight="700" color="#334155">
                      {item.leaveType}
                    </Typography>
                  </Box>
                  <Chip
                    label={isUnlimited ? "Unlimited" : `${item.remaining} Remaining`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      backgroundColor: colors.bg,
                      color: colors.main,
                    }}
                  />
                </Box>

                {!isUnlimited ? (
                  <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" my={1.5}>
                      <Typography variant="caption" color="#64748b">
                        Used: <strong>{item.taken}</strong> / {item.quota} Days
                      </Typography>
                      {item.pending > 0 && (
                        <Tooltip title="Days pending manager approval">
                          <Typography variant="caption" color="#ed6c02" fontWeight="600">
                            ({item.pending} Pending)
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: "#f1f5f9",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: colors.main,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </>
                ) : (
                  <Typography variant="caption" color="#94a3b8" display="block" mt={1}>
                    Taken: {item.taken} day(s) • No fixed limit
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default LeaveStatsCards;
