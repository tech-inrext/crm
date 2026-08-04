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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
} from "@mui/material";
import {
  EventAvailable as QuotaIcon,
  CheckCircleOutline as TakenIcon,
  HourglassEmpty as PendingIcon,
  BeachAccess as RemainingIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon,
  CheckCircle as BulletIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveStatsData } from "../types";
import { formatDaysNumber } from "../utils/formatters";

const TYPE_COLORS: Record<string, { main: string; bg: string }> = {
  "Casual Leave": { main: "#1976d2", bg: "#e3f2fd" },
  "Sick Leave": { main: "#e91e63", bg: "#fce4ec" },
  "Earned Leave": { main: "#9c27b0", bg: "#f3e5f5" },
  "Maternity Leave": { main: "#ed6c02", bg: "#fff3e0" },
  "Paternity Leave": { main: "#0288d1", bg: "#e0f7fa" },
  "Bereavement Leave": { main: "#43a047", bg: "#e8f5e9" },
  "Women's Monthly Wellness Leave": { main: "#d81b60", bg: "#fce4ec" },
  "Compensatory Leave (Comp-Off)": { main: "#8e24aa", bg: "#f3e5f5" },
  "Loss Of Pay (LOP / LWP)": { main: "#757575", bg: "#f5f5f5" },
  "Sabbatical Leave": { main: "#546e7a", bg: "#eceff1" },
  "Unpaid Leave": { main: "#d32f2f", bg: "#ffebee" },
};

interface PolicyDetail {
  title: string;
  accrual: string;
  total: string;
  pointers: string[];
}

const LEAVE_POLICY_DETAILS: Record<string, PolicyDetail> = {
  "Casual Leave": {
    title: "Casual Leave (CL)",
    accrual: "0.85 day / month",
    total: "10.2 Days / year",
    pointers: [
      "Accrual Rate: 0.85 day credited on a monthly accrual basis.",
      "Annual Total: 10.2 Days credited proportionately each year.",
      "Carry Forward: Not carried forward to subsequent years.",
      "Policy Rule: All planned requests must be submitted in advance for Reporting Manager approval.",
    ],
  },
  "Sick Leave": {
    title: "Sick Leave (SL)",
    accrual: "1 day / month",
    total: "12 Days / year",
    pointers: [
      "Accrual Rate: 1 day credited on a monthly accrual basis.",
      "Annual Total: 12 Days per year.",
      "Carry Forward: Up to 6 leaves can be carried forward.",
      "Probation Rule: Employees in probation are eligible for 1 Sick Leave per month only.",
    ],
  },
  "Earned Leave": {
    title: "Earned Leave (EL)",
    accrual: "1 day / month",
    total: "12 Days / year",
    pointers: [
      "Accrual Rate: 1 day credited on a monthly accrual basis.",
      "Annual Total: 12 Days per year.",
      "Carry Forward & Encashment: Can be carried forward or encashed in the financial year.",
      "Confirmation Credit: Accrued leave during probation credited upon successful confirmation.",
    ],
  },
  "Maternity Leave": {
    title: "Maternity Leave (ML)",
    accrual: "As per Statutory Law",
    total: "Up to 26 Weeks",
    pointers: [
      "Accrual Rate: As per statutory law (Paid leave, not accrued monthly).",
      "Annual Total: Up to 26 Weeks for eligible female employees.",
      "Policy Detail: Paid leave provided in accordance with Maternity Benefit Act.",
      "Application: Prior notification and formal medical documentation required.",
    ],
  },
  "Paternity Leave": {
    title: "Paternity Leave",
    accrual: "Fixed Allocation",
    total: "5 - 15 Days",
    pointers: [
      "Accrual Rate: Fixed allocation upon event occurrence.",
      "Annual Total: 5 to 15 Days based on company policy guidelines.",
      "Timeframe: Must be utilized within a specific period following child birth.",
      "Approval: Pre-approval required from Reporting Manager.",
    ],
  },
  "Bereavement Leave": {
    title: "Bereavement Leave",
    accrual: "Short Duration",
    total: "2 - 4 Days",
    pointers: [
      "Accrual Rate: Granted on per-occurrence basis (No monthly accrual).",
      "Duration: 2 to 4 Days per occurrence.",
      "Usage: Granted for bereavement of immediate family members.",
      "Notification: Intimation to Reporting Manager and HR as soon as practicable.",
    ],
  },
  "Women's Monthly Wellness Leave": {
    title: "Women's Monthly Wellness Leave",
    accrual: "1 day / month (WFH)",
    total: "12 Days WFH / year",
    pointers: [
      "Accrual Rate: 1 day per month Work From Home (WFH).",
      "Annual Total: 12 Days WFH per year.",
      "Carry Forward: Not carried forward to subsequent months.",
      "Policy Detail: Dedicated Work From Home benefit for monthly wellness.",
    ],
  },
  "Compensatory Leave (Comp-Off)": {
    title: "Compensatory Leave (Comp-Off)",
    accrual: "1:1 Basis",
    total: "Per Occurrence",
    pointers: [
      "Accrual Rate: 1:1 basis for working on official holidays or weekends.",
      "Annual Total: Earned per occurrence.",
      "Usage: Availed against approved extra weekend/holiday work.",
      "Approval: Requires manager confirmation of holiday/weekend work.",
    ],
  },
  "Loss Of Pay (LOP / LWP)": {
    title: "Loss Of Pay Leave (LOP / LWP)",
    accrual: "0 Days",
    total: "0 Days (Unpaid)",
    pointers: [
      "Accrual Rate: 0 days (Unpaid Leave category).",
      "Salary Impact: Salary deducted on a pro-rata basis if utilized.",
      "Applicability: Utilized when all accrued leave balances are exhausted.",
      "Approval: Formal application must be approved through CRM system.",
    ],
  },
  "Sabbatical Leave": {
    title: "Sabbatical Leave",
    accrual: "0 Days",
    total: "0 Days (Unpaid)",
    pointers: [
      "Accrual Rate: 0 days (Unpaid long-term leave).",
      "Approval: Special Management approval required.",
      "Payment Status: Unpaid leave.",
      "Usage: Granted for specialized personal, research, or higher education goals.",
    ],
  },
  "Unpaid Leave": {
    title: "Unpaid Leave",
    accrual: "0 Days",
    total: "0 Days (Unpaid)",
    pointers: [
      "Accrual Rate: 0 days (Unpaid category).",
      "Salary Deduction: Daily salary deducted on a pro-rata basis.",
      "Usage: Applicable for absences beyond regular leave quotas.",
      "Approval: Subject to Reporting Manager and HR confirmation.",
    ],
  },
};

interface Props {
  refreshTrigger?: number;
  employeeId?: string;
}

const LeaveStatsCards: React.FC<Props> = ({ refreshTrigger, employeeId }) => {
  const [stats, setStats] = useState<LeaveStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPolicyType, setSelectedPolicyType] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await leaveApi.getLeaveStats(employeeId);
        if (res?.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error("Failed to load leave stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [employeeId, refreshTrigger]);

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
      value: `${formatDaysNumber(summary.totalAllocated)} Days`,
      subtitle: "Annual Quota",
      icon: <QuotaIcon sx={{ fontSize: 28, color: "#1976d2" }} />,
      bg: "#f0f7ff",
      border: "#bbe0ff",
    },
    {
      title: "Leaves Taken",
      value: `${formatDaysNumber(summary.totalTaken)} Days`,
      subtitle: "Approved",
      icon: <TakenIcon sx={{ fontSize: 28, color: "#2e7d32" }} />,
      bg: "#f1f8e9",
      border: "#c8e6c9",
    },
    {
      title: "Pending Approval",
      value: `${formatDaysNumber(summary.totalPending)} Days`,
      subtitle: "Awaiting Action",
      icon: <PendingIcon sx={{ fontSize: 28, color: "#ed6c02" }} />,
      bg: "#fff8e1",
      border: "#ffe082",
    },
    {
      title: "Remaining Balance",
      value: `${formatDaysNumber(summary.totalRemaining)} Days`,
      subtitle: "Available to Use",
      icon: <RemainingIcon sx={{ fontSize: 28, color: "#9c27b0" }} />,
      bg: "#faf0ca",
      border: "#f3d57e",
    },
  ];

  const policyDetail = selectedPolicyType ? LEAVE_POLICY_DETAILS[selectedPolicyType] : null;
  const activeColor = selectedPolicyType ? (TYPE_COLORS[selectedPolicyType] || { main: "#1976d2", bg: "#e3f2fd" }) : { main: "#1976d2", bg: "#e3f2fd" };

  return (
    <Box mb={4}>
      {/* Overview Stat Cards */}
      <Typography variant="subtitle2" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.05em" mb={2}>
        Leave Overview & Balance
      </Typography>
      <Grid container spacing={2.5} mb={4}>
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
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                transition: "transform 0.2s ease, boxShadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                },
              }}
            >
              <Box>
                <Typography variant="caption" fontWeight="600" color="#64748b" display="block">
                  {card.title}
                </Typography>
                <Typography variant="h5" fontWeight="800" color="#0f172a" my={0.5}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="#64748b" fontWeight="500">
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.05em">
          Leave Type Quota Breakdown
        </Typography>
        <Typography variant="caption" color="#94a3b8" fontWeight="600">
          💡 Click any leave card to view policy details
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {breakdown.map((item) => {
          const colors = TYPE_COLORS[item.leaveType] || { main: "#1976d2", bg: "#e3f2fd" };
          const isUnlimited = item.quota === 0;
          const percentage = isUnlimited ? 0 : Math.min(100, Math.round((item.taken / item.quota) * 100));

          return (
            <Grid item xs={12} sm={6} md={4} key={item.leaveType}>
              <Paper
                elevation={0}
                onClick={() => setSelectedPolicyType(item.leaveType)}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor: "#ffffff",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  position: "relative",
                  "&:hover": {
                    borderColor: colors.main,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
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
                    label={isUnlimited ? "Unlimited" : `${formatDaysNumber(item.remaining)} Remaining`}
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
                        Used: <strong>{formatDaysNumber(item.taken)}</strong> / {formatDaysNumber(item.quota)} Days
                      </Typography>
                      {item.pending > 0 && (
                        <Tooltip title="Days pending manager approval">
                          <Typography variant="caption" color="#ed6c02" fontWeight="600">
                            ({formatDaysNumber(item.pending)} Pending)
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
                    Taken: {formatDaysNumber(item.taken)} day(s) • No fixed limit
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Leave Policy Details Dialog */}
      <Dialog
        open={Boolean(selectedPolicyType)}
        onClose={() => setSelectedPolicyType(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <InfoIcon sx={{ color: activeColor.main, fontSize: 24 }} />
            <Typography variant="subtitle1" fontWeight="700" color="#1e293b">
              {policyDetail?.title || selectedPolicyType}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setSelectedPolicyType(null)} sx={{ color: "#94a3b8" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, pb: 3, pt: 1 }}>
          {/* Quick Metrics Chips */}
          <Box display="flex" gap={1.5} mb={2.5}>
            <Box
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: activeColor.bg,
                border: `1px solid ${activeColor.main}30`,
              }}
            >
              <Typography variant="caption" color="#64748b" fontWeight="600" display="block">
                Accrual Rate
              </Typography>
              <Typography variant="body2" fontWeight="700" color={activeColor.main} mt={0.3}>
                {policyDetail?.accrual || "N/A"}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography variant="caption" color="#64748b" fontWeight="600" display="block">
                Annual Quota
              </Typography>
              <Typography variant="body2" fontWeight="700" color="#0f172a" mt={0.3}>
                {policyDetail?.total || "N/A"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2, borderColor: "#f1f5f9" }} />

          {/* Policy Detail Pointers */}
          <Typography variant="caption" fontWeight="700" color="#475569" letterSpacing="0.05em" textTransform="uppercase" display="block" mb={1.5}>
            Policy Provisions & Rules
          </Typography>

          <Box display="flex" flexDirection="column" gap={1.5}>
            {policyDetail?.pointers.map((pointer, idx) => (
              <Box key={idx} display="flex" alignItems="flex-start" gap={1.2}>
                <BulletIcon sx={{ fontSize: 16, color: activeColor.main, mt: 0.3, flexShrink: 0 }} />
                <Typography variant="body2" color="#334155" sx={{ lineHeight: 1.45, fontSize: "0.85rem" }}>
                  {pointer}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LeaveStatsCards;
