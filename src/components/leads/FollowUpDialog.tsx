"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Drawer,
  Button,
  TextField,
  CircularProgress,
  Typography,
  LocalizationProvider,
  AdapterDateFns,
  DateTimePicker,
  IconButton,
  PhoneIcon,
  Tooltip,
  Avatar,
  Chip,
  Event,
  Box,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
  Notes,
  CloseIcon,
  RefreshIcon,
  Check,
  Clear,
} from "@/components/ui/Component";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import LeadActivity, { ValueChip } from "./LeadActivity";
import FollowUpHeader from "./FollowUpHeader";

// Helper to get initials for avatar
const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
};

interface FollowUpDialogProps {
  open: boolean;
  onClose: () => void;
  leadIdentifier: string; // leadId or _id
  onSaved?: () => void;
  onScheduleSiteVisit?: (leadId: string) => void;
  /** Increment this value from the parent to trigger an automatic refresh of the follow-up list */
  refreshTrigger?: number;
}

const FollowUpDialog: React.FC<FollowUpDialogProps> = ({
  open,
  onClose,
  leadIdentifier,
  onSaved,
  onScheduleSiteVisit,
  refreshTrigger,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadIdentifierFromUrl = searchParams.get("leadIdentifier");

  const [note, setNote] = useState("");
  const [followUpType, setFollowUpType] = useState<"call back" | "note">(
    "call back"
  );
  const handleDialogClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.has("leadIdentifier")) {
      params.delete("leadIdentifier");
      const queryString = params.toString();
      router.replace(`/dashboard/leads${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }
    onClose();
  };
  const finalLeadIdentifier = leadIdentifier || leadIdentifierFromUrl || "";
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<Array<any>>([]);
  const [historyFilter, setHistoryFilter] = useState<
    "all" | "call back" | "site visit" | "note" | "history"
  >("all");
  const [leadInfo, setLeadInfo] = useState<{
    phone?: string;
    fullName?: string;
  } | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();

  // Feedback form states for site visit completion/missed
  const [activeFeedbackForm, setActiveFeedbackForm] = useState<{
    followUpId: string;
    outcome: "completed" | "missed";
  } | null>(null);
  const [feedbackRemarks, setFeedbackRemarks] = useState("");
  const [interestLevel, setInterestLevel] = useState<"high" | "medium" | "low" | "">("");
  const [missedReason, setMissedReason] = useState("");
  const [missedReasonDetails, setMissedReasonDetails] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // mForm feedback submission viewer
  const [feedbackViewOpen, setFeedbackViewOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleViewFeedback = async (followUpId: string) => {
    setFeedbackViewOpen(true);
    setFeedbackData(null);
    setFeedbackError(null);
    setFeedbackLoading(true);
    try {
      const res = await axios.get(`/api/v0/lead/feedback-submission`, {
        params: { followUpId },
        withCredentials: true,
      });
      setFeedbackData(res.data);
    } catch (err: any) {
      setFeedbackError(err?.response?.data?.message || "Failed to load feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = async () => {
    if (followUpType === "note" && !note.trim()) return;
    if (followUpType === "call back" && !followUpDate) return;

    setSubmitting(true);
    try {
      const payload = {
        leadIdentifier: finalLeadIdentifier,
        note,
        followUpType,
        followUpDate: followUpType === "call back" ? followUpDate : null,
      };

      await axios.post(`/api/v0/lead/follow-up`, payload, {
        withCredentials: true,
      });
      // refresh list after save
      try {
        const res = await axios.get(`/api/v0/lead/follow-up`, {
          params: { leadIdentifier: finalLeadIdentifier },
          withCredentials: true,
        });
        setItems(res.data.data || []);
      } catch (err) {
        console.error("Failed to refresh follow-ups after save", err);
      }
      setNote("");
      setFollowUpDate(null);

      if (onSaved) onSaved();
    } catch (err) {
      console.error("Failed to submit follow-up", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOutcome = async (followUpId: string, outcome: string) => {
    try {
      await axios.patch(
        `/api/v0/lead/follow-up`,
        { followUpId, outcome },
        {
          withCredentials: true,
        }
      );
      // Refresh list
      const res = await axios.get(`/api/v0/lead/follow-up`, {
        params: { leadIdentifier: finalLeadIdentifier },
        withCredentials: true,
      });
      setItems(res.data.data || []);
    } catch (err) {
      console.error("Failed to update outcome", err);
    }
  };
  useEffect(() => {
    if (open && finalLeadIdentifier) {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("leadIdentifier") !== finalLeadIdentifier) {
        params.set("leadIdentifier", finalLeadIdentifier);
        router.replace(`/dashboard/leads?${params.toString()}`, { scroll: false });
      }
    }
  }, [open, finalLeadIdentifier, router, searchParams]);

  const loadFollowUps = React.useCallback(async () => {
    if (!open || !finalLeadIdentifier) return;
    setLoadError(null);
    setLoadingItems(true);
    try {
      const res = await axios.get(`/api/v0/lead/follow-up`, {
        params: { leadIdentifier: finalLeadIdentifier },
        withCredentials: true,
      });
      setItems(res.data.data || []);
      setLeadInfo(res.data.lead || null);
    } catch (err: any) {
      setLoadError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load follow-ups"
      );
    } finally {
      setLoadingItems(false);
    }
  }, [open, finalLeadIdentifier]);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  // Refresh when parent signals (e.g. after a site visit is saved from SiteVisitDialog)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadFollowUps();
    }
  }, [refreshTrigger]);

  const isSubmitDisabled =
    submitting ||
    (followUpType === "note" && !note.trim()) ||
    (followUpType === "call back" && !followUpDate);

  const hasPendingSiteVisit = items.some(
    (it) =>
      it.followUpType === "site visit" &&
      (!it.outcome || it.outcome === "pending")
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyContainerRef = useRef<HTMLDivElement>(null);

  const scrollToFirstPending = () => {
    const el = historyContainerRef.current?.querySelector(
      '[data-pending="true"]'
    );
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    if (open && items.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [items, open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleDialogClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : 480,
          maxWidth: "100%",
          backgroundImage: "none",
          boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <FollowUpHeader 
        leadInfo={leadInfo} 
        handleDialogClose={handleDialogClose} 
        isMobile={isMobile} 
        onLeadUpdate={loadFollowUps}
      />
      

      {/* History Section Header + Filter – pinned */}
      <Box
        sx={{
          px: 2.5,
          pt: 1,
          pb: 0.75,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            variant="overline"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              letterSpacing: "0.05em",
            }}
          >
            History
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {(
              [
                { key: "all", label: "All" },
                { key: "call back", label: "Calls" },
                { key: "site visit", label: "Visits" },
                { key: "note", label: "Notes" },
                { key: "history", label: "Activity" },
              ] as const
            ).map(({ key, label }) => (
              <Box
                key={key}
                onClick={() => setHistoryFilter(key)}
                sx={{
                  px: 1,
                  py: 0.25,
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  bgcolor: historyFilter === key ? "#1e293b" : "transparent",
                  color: historyFilter === key ? "#fff" : "#64748b",
                  "&:hover": {
                    bgcolor: historyFilter === key ? "#1e293b" : "#e2e8f0",
                  },
                }}
              >
                {label}
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Scrollable History Area */}
      <Box sx={{ p: 0, bgcolor: "#f8fafc", flexGrow: 1, overflowY: "auto" }}>
        <Stack spacing={0}>
          <Box
            ref={historyContainerRef}
            sx={{
              flexGrow: 1,
              minHeight: 200,
              overflowY: "auto",
              px: 2.5,
              py: 1.5,
              scrollBehavior: "smooth",
            }}
          >
            {loadingItems ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress size={24} thickness={5} />
              </Box>
            ) : loadError ? (
              <Box
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: "#fee2e2",
                  borderRadius: 2,
                }}
              >
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                >
                  {loadError}
                </Typography>
              </Box>
            ) : items.length > 0 ? (
              <Stack spacing={1.5}>
                {items
                  .filter(
                    (it) =>
                      historyFilter === "all" ||
                      it.followUpType === historyFilter
                  )
                  .map((it) => {
                    const isCallBack = it.followUpType === "call back";
                    const isSiteVisit = it.followUpType === "site visit";
                    const isHistory = it.followUpType === "history";

                    let accentColor = "#059669"; // default note (green)
                    if (isCallBack) accentColor = "#2563eb"; // blue
                    if (isSiteVisit) accentColor = "#7c3aed"; // violet/purple
                    if (isHistory) accentColor = "#f59e0b"; // amber for history

                    let bgColor = "#ecfdf5";
                    if (isCallBack) bgColor = "#eff6ff";
                    if (isSiteVisit) bgColor = "#f5f3ff";
                    if (isHistory) bgColor = "#fffbeb";

                    let chipColor = "#065f46";
                    if (isCallBack) chipColor = "#1e40af";
                    if (isSiteVisit) chipColor = "#5b21b6";
                    if (isHistory) chipColor = "#92400e";

                    let chipBg = "#d1fae5";
                    if (isCallBack) chipBg = "#dbeafe";
                    if (isSiteVisit) chipBg = "#ede9fe";
                    if (isHistory) chipBg = "#fef3c7";

                    const isPendingAction =
                      (isCallBack || isSiteVisit) &&
                      it.followUpDate &&
                      new Date() > new Date(it.followUpDate) &&
                      (!it.outcome || it.outcome === "pending");

                    return (
                      <Box
                        key={it._id}
                        data-pending={isPendingAction ? "true" : undefined}
                        sx={{
                          width: "100%",
                          bgcolor: "#fff",
                          borderRadius: 1.5,
                          border: "1px solid #e5e7eb",
                          borderLeft: `3px solid ${accentColor}`,
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
                          transition: "all 0.2s ease-in-out",
                          position: "relative",
                          overflow: "hidden",
                          "&:hover": {
                            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.08)",
                            borderColor: "#e2e8f0",
                          },
                        }}
                      >
                        <Box sx={{ p: 1.25, position: "relative", zIndex: 1 }}>
                          {/* Header: User Info & Time */}
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            sx={{ mb: 0.75 }}
                          >
                            {/* Footer: Actionable Info */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{ mt: "auto", gap: 1 }}
                            >
                              {isCallBack && leadInfo?.phone && (
                                <Tooltip
                                  title={`Initiate Call to ${leadInfo.phone}`}
                                >
                                  <IconButton
                                    size="small"
                                    component="a"
                                    href={`tel:${leadInfo.phone}`}
                                    sx={{
                                      bgcolor: "#2563eb",
                                      color: "#fff",
                                      "&:hover": {
                                        bgcolor: "#1e40af",
                                        transform: "scale(1.03)",
                                      },
                                      transition: "all 0.2s",
                                    }}
                                  >
                                    <PhoneIcon sx={{ fontSize: "0.95rem" }} />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {isSiteVisit && it.cabBookingId && (
                                <Tooltip title="Cab Booked - View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/cab-booking?bookingId=${it.cabBookingId}`
                                      )
                                    }
                                    sx={{
                                      bgcolor: "#7c3aed",
                                      color: "#fff",
                                      "&:hover": {
                                        bgcolor: "#570ad3ff",
                                        transform: "scale(1.03)",
                                      },
                                      transition: "all 0.2s",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                                      </svg>
                                    </div>
                                  </IconButton>
                                </Tooltip>
                              )}

                              {isSiteVisit && !it.cabBookingId && (
                                <Tooltip title="No Cab Requested">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      bgcolor: "#94a3b8",
                                      color: "#fff",
                                      opacity: 0.8,
                                      "&:hover": {
                                        bgcolor: "#64748b",
                                        transform: "scale(1.03)",
                                        opacity: 1,
                                      },
                                      transition: "all 0.2s",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                      }}
                                    >
                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        fill="none"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path
                                          d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"
                                          fill="currentColor"
                                          stroke="none"
                                        />
                                        <line
                                          x1="2"
                                          y1="2"
                                          x2="22"
                                          y2="22"
                                          stroke="white"
                                          strokeWidth="2.5"
                                        />
                                      </svg>
                                    </div>
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Chip
                                label={
                                  it.followUpType === "history"
                                    ? "activity"
                                    : it.followUpType
                                }
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.5rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  bgcolor: chipBg,
                                  color: chipColor,
                                  letterSpacing: "0.05em",
                                  borderRadius: "6px",
                                }}
                              />
                            </Stack>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.5rem",
                              }}
                            >
                              Created At :{" "}
                              {it.createdAt
                                ? new Date(it.createdAt).toLocaleString([], {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </Typography>
                          </Stack>

                          {/* Middle: Note Content */}
                          <Typography
                            variant="body2"
                            component="div"
                            sx={{
                              color: "#374151",
                              fontSize: "0.85rem",
                              lineHeight: 1.45,
                              whiteSpace: "pre-wrap",
                              mb: 1,
                            }}
                          >
                            {it.isCreation ? (
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                                <Typography variant="body2" sx={{ color: "#374151" }}>
                                  {it.note}
                                </Typography>
                                <ValueChip color="new">{it.submittedByName}</ValueChip>
                              </Box>
                            ) : isHistory && it.change ? (
                              <LeadActivity change={it.change} />
                            ) : it.note !== "N/A" ? (
                              it.note
                            ) : (
                              <span
                                style={{
                                  fontStyle: "italic",
                                  color: "#9ca3af",
                                }}
                              >
                                No detailed remarks provided.
                              </span>
                            )}
                          </Typography>
                          <Stack
                            direction="row"
                            alignItems="space-between"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {it.followUpDate &&
                                it.followUpType !== "note" && (
                                  <Chip
                                    icon={
                                      <Event
                                        sx={{
                                          fontSize: "14px !important",
                                          color: "#2563eb !important",
                                        }}
                                      />
                                    }
                                    label={`Scheduled At : ${new Date(
                                      it.followUpDate
                                    ).toLocaleString([], {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}`}
                                    size="small"
                                    sx={{
                                      bgcolor: "#f3f4f6",
                                      border: "1px solid #e5e7eb",
                                      fontWeight: 600,
                                      fontSize: "0.6rem",
                                      height: 22,
                                      color: "#1f2937",
                                    }}
                                  />
                                )}
                            </Box>
                            {/* User Info */}
                            {!it.isCreation && (
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="end"
                                spacing={1}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontSize: "0.5rem",
                                  }}
                                >
                                  By:{" "}
                                </Typography>
                                <Avatar
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    fontSize: "0.5rem",
                                    bgcolor: bgColor,
                                    color: accentColor,
                                    border: `1px solid ${accentColor}15`,
                                  }}
                                >
                                  {getInitials(it.submittedByName)}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      color: "#111827",
                                      fontSize: "0.6rem",
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {it.submittedByName || "System User"}
                                  </Typography>
                                </Box>
                              </Stack>
                            )}
                          </Stack>

                          {/* Outcome Section: Show ONLY if date is passed OR outcome is already recorded */}
                          {(isCallBack || isSiteVisit) &&
                            it.followUpDate &&
                            (new Date() > new Date(it.followUpDate) ||
                              (it.outcome && it.outcome !== "pending")) && (
                              <Box
                                sx={{
                                  mt: 1.5,
                                  pt: 1.25,
                                  borderTop: "1px solid #f1f5f9",
                                }}
                              >
                                {new Date() > new Date(it.followUpDate) &&
                                (it.outcome === "pending" || !it.outcome) ? (
                                  (!activeFeedbackForm || activeFeedbackForm.followUpId !== it._id) ? (
                                    <Stack
                                      direction={isMobile ? "column" : "row"}
                                      alignItems={isMobile ? "stretch" : "center"}
                                      justifyContent="space-between"
                                      spacing={isMobile ? 1.5 : 0.5}
                                      sx={{ width: "100%", overflow: "hidden" }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 600,
                                          color: "text.secondary",
                                          whiteSpace: "nowrap",
                                          fontSize: { xs: "0.9rem", sm: "0.8rem" },
                                          mb: isMobile ? 0.5 : 0,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          minWidth: 0,
                                          flexShrink: 1,
                                        }}
                                      >
                                        Was the{" "}
                                        {isCallBack ? "call" : "site visit"}{" "}
                                        completed?
                                      </Typography>
                                      <Stack 
                                        direction="row" 
                                        spacing={0.75}
                                        sx={{ 
                                          width: isMobile ? "100%" : "auto",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <Button
                                          size="small"
                                          variant="contained"
                                          startIcon={
                                            <Check
                                              sx={{ fontSize: "14px !important", color: "#fff" }}
                                            />
                                          }
                                          onClick={() => {
                                            if (isSiteVisit) {
                                              setActiveFeedbackForm({ followUpId: it._id, outcome: "completed" });
                                              setFeedbackRemarks("");
                                              setInterestLevel("medium");
                                            } else {
                                              handleUpdateOutcome(it._id, "completed");
                                            }
                                          }}
                                          sx={{
                                            flex: isMobile ? 1 : "initial",
                                            height: isMobile ? 36 : 28,
                                            fontSize: isMobile ? "0.75rem" : "0.65rem",
                                            px: isMobile ? 2 : 1.5,
                                            fontWeight: 700,
                                            textTransform: "none",
                                            borderRadius: isMobile ? "8px" : "6px",
                                            boxShadow: "none",
                                            whiteSpace: "nowrap",
                                            minWidth: "auto",
                                            bgcolor: "#2e7d32",
                                            color: "#fff",
                                            "&:hover": {
                                              boxShadow: "none",
                                              bgcolor: "#1b5e20",
                                            },
                                            "&:focus, &:active": {
                                              outline: "none",
                                              boxShadow: "none",
                                            },
                                          }}
                                        >
                                          Yes, Done
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          startIcon={
                                            <Clear
                                              sx={{ fontSize: "14px !important", color: "#d32f2f" }}
                                            />
                                          }
                                          onClick={() => {
                                            if (isSiteVisit) {
                                              setActiveFeedbackForm({ followUpId: it._id, outcome: "missed" });
                                              setMissedReason("");
                                              setMissedReasonDetails("");
                                            } else {
                                              handleUpdateOutcome(it._id, "missed");
                                            }
                                          }}
                                          sx={{
                                            flex: isMobile ? 1 : "initial",
                                            height: isMobile ? 36 : 28,
                                            fontSize: isMobile ? "0.75rem" : "0.65rem",
                                            px: isMobile ? 2 : 1.5,
                                            fontWeight: 700,
                                            textTransform: "none",
                                            borderRadius: isMobile ? "8px" : "6px",
                                            whiteSpace: "nowrap",
                                            minWidth: "auto",
                                            borderColor: "#d74040ff",
                                            color: "#d32f2f",
                                            bgcolor: "#fff",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                              borderColor: "#d32f2f",
                                              bgcolor: "#fff5f5",
                                              borderWidth: 1,
                                            },
                                            "&:focus, &:active": {
                                              outline: "none",
                                              boxShadow: "none",
                                              borderColor: "#d32f2f",
                                            },
                                          }}
                                        >
                                          No, Missed
                                        </Button>
                                      </Stack>
                                    </Stack>
                                  ) : (
                                    <Box sx={{ width: "100%", p: 1.5, border: "1px solid #e2e8f0", borderRadius: "8px", bgcolor: "#f8fafc" }}>
                                      {activeFeedbackForm?.outcome === "completed" ? (
                                        <Stack spacing={1.25}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.75rem" }}>
                                            Site Visit Feedback Form
                                          </Typography>
                                          
                                          <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569", display: "block", mb: 0.5 }}>
                                              Customer Interest Level
                                            </Typography>
                                            <select
                                              value={interestLevel}
                                              onChange={(e) => setInterestLevel(e.target.value as any)}
                                              style={{
                                                width: "100%",
                                                padding: "6px 10px",
                                                borderRadius: "6px",
                                                border: "1px solid #cbd5e1",
                                                fontSize: "0.75rem",
                                                backgroundColor: "#fff",
                                                color: "#334155",
                                                outline: "none",
                                              }}
                                            >
                                              <option value="">-- Select Interest Level --</option>
                                              <option value="high">High</option>
                                              <option value="medium">Medium</option>
                                              <option value="low">Low</option>
                                            </select>
                                          </Box>

                                          <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569", display: "block", mb: 0.5 }}>
                                              Remarks / Comments
                                            </Typography>
                                            <TextField
                                              fullWidth
                                              multiline
                                              rows={2}
                                              value={feedbackRemarks}
                                              onChange={(e) => setFeedbackRemarks(e.target.value)}
                                              placeholder="Enter site visit feedback..."
                                              size="small"
                                              sx={{
                                                "& .MuiOutlinedInput-root": {
                                                  fontSize: "0.75rem",
                                                  bgcolor: "#fff",
                                                }
                                              }}
                                            />
                                          </Box>
                                        </Stack>
                                      ) : (
                                        <Stack spacing={1.25}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#991b1b", fontSize: "0.75rem" }}>
                                            Reason for Missed Site Visit
                                          </Typography>

                                          <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569", display: "block", mb: 0.5 }}>
                                              Select Reason
                                            </Typography>
                                            <select
                                              value={missedReason}
                                              onChange={(e) => setMissedReason(e.target.value)}
                                              style={{
                                                width: "100%",
                                                padding: "6px 10px",
                                                borderRadius: "6px",
                                                border: "1px solid #cbd5e1",
                                                fontSize: "0.75rem",
                                                backgroundColor: "#fff",
                                                color: "#334155",
                                                outline: "none",
                                              }}
                                            >
                                              <option value="">-- Select a Reason --</option>
                                              <option value="Client Cancelled">Client Cancelled</option>
                                              <option value="Client No Show">Client No Show / Unreachable</option>
                                              <option value="Executive Unavailability">Executive/Agent Unavailability</option>
                                              <option value="Rescheduled">Rescheduled by Client</option>
                                              <option value="Other">Other</option>
                                            </select>
                                          </Box>

                                          <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569", display: "block", mb: 0.5 }}>
                                              Additional Details
                                            </Typography>
                                            <TextField
                                              fullWidth
                                              multiline
                                              rows={2}
                                              value={missedReasonDetails}
                                              onChange={(e) => setMissedReasonDetails(e.target.value)}
                                              placeholder="Provide details about why the visit was missed..."
                                              size="small"
                                              sx={{
                                                "& .MuiOutlinedInput-root": {
                                                  fontSize: "0.75rem",
                                                  bgcolor: "#fff",
                                                }
                                              }}
                                            />
                                          </Box>
                                        </Stack>
                                      )}

                                      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                                        <Button
                                          size="small"
                                          variant="text"
                                          onClick={() => setActiveFeedbackForm(null)}
                                          sx={{ fontSize: "0.7rem", textTransform: "none", color: "#64748b" }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          disabled={
                                            feedbackSubmitting ||
                                            (activeFeedbackForm?.outcome === "completed" 
                                              ? !feedbackRemarks.trim() || !interestLevel
                                              : !missedReason || !missedReasonDetails.trim())
                                          }
                                          onClick={async () => {
                                            if (!activeFeedbackForm) return;
                                            setFeedbackSubmitting(true);
                                            try {
                                              const payload = {
                                                followUpId: it._id,
                                                outcome: activeFeedbackForm.outcome,
                                                ...(activeFeedbackForm.outcome === "completed" 
                                                  ? { interestLevel, feedbackRemarks }
                                                  : { missedReason, missedReasonDetails }
                                                )
                                              };
                                              await axios.patch(`/api/v0/lead/follow-up`, payload, {
                                                withCredentials: true,
                                              });
                                              setActiveFeedbackForm(null);
                                              // Refresh list
                                              const res = await axios.get(`/api/v0/lead/follow-up`, {
                                                params: { leadIdentifier: finalLeadIdentifier },
                                                withCredentials: true,
                                              });
                                              setItems(res.data.data || []);
                                            } catch (err) {
                                              console.error("Failed to submit feedback", err);
                                            } finally {
                                              setFeedbackSubmitting(false);
                                            }
                                          }}
                                          sx={{
                                            fontSize: "0.7rem",
                                            textTransform: "none",
                                            minWidth: 72,
                                            bgcolor: activeFeedbackForm?.outcome === "completed" ? "#10b981" : "#ef4444",
                                            color: "#fff",
                                            "&:hover": {
                                              bgcolor: activeFeedbackForm?.outcome === "completed" ? "#059669" : "#dc2626",
                                            }
                                          }}
                                        >
                                          {feedbackSubmitting ? (
                                            <CircularProgress size={14} thickness={5} sx={{ color: "#fff" }} />
                                          ) : (
                                            "Submit"
                                          )}
                                        </Button>
                                      </Stack>
                                    </Box>
                                  )
                                ) : it.outcome && it.outcome !== "pending" ? (
                                  <Box sx={{ width: "100%" }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: isSiteVisit ? 0.75 : 0,
                                      }}
                                    >
                                      <Chip
                                        label={
                                          it.outcome === "completed"
                                            ? isCallBack
                                              ? "Call Completed"
                                              : "Visit Done"
                                            : isCallBack
                                            ? "Call Missed"
                                            : "Visit Missed"
                                        }
                                        size="small"
                                        icon={
                                          it.outcome === "completed" ? (
                                            <Check
                                              sx={{
                                                fontSize: "12px !important",
                                                color: "white !important",
                                              }}
                                            />
                                          ) : (
                                            <Clear
                                              sx={{
                                                fontSize: "12px !important",
                                                color: "white !important",
                                              }}
                                            />
                                          )
                                        }
                                        sx={{
                                          height: 22,
                                          fontSize: "0.65rem",
                                          fontWeight: 700,
                                          bgcolor:
                                            it.outcome === "completed"
                                              ? "#10b981"
                                              : "#ef4444",
                                          color: "#fff",
                                          "& .MuiChip-label": { px: 1 },
                                        }}
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "text.secondary",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        {it.outcome === "completed"
                                          ? `This ${
                                              isCallBack ? "call" : "visit"
                                            } was successfully conducted.`
                                          : `The scheduled ${
                                              isCallBack ? "call" : "site visit"
                                            } was marked as not done.`}
                                      </Typography>
                                    </Box>

                                    {/* Display saved feedback for Site Visit */}
                                    {isSiteVisit && it.outcome === "completed" && (
                                      <Box sx={{ mt: 0.5, pl: 1, borderLeft: "2px solid #10b981", py: 0.25 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e293b", display: "block" }}>
                                          Interest Level: <span style={{ 
                                            textTransform: "capitalize", 
                                            color: it.interestLevel === "high" ? "#10b981" : it.interestLevel === "medium" ? "#f59e0b" : "#ef4444",
                                            fontWeight: 700 
                                          }}>{it.interestLevel || "N/A"}</span>
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "#475569", display: "block", mt: 0.25 }}>
                                          <strong>Feedback:</strong> {it.feedbackRemarks || "No remarks provided."}
                                        </Typography>
                                        {/* View mForm Feedback Button */}
                                        {it.feedbackToken && (
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleViewFeedback(it._id)}
                                            sx={{
                                              mt: 1,
                                              fontSize: "0.68rem",
                                              textTransform: "none",
                                              fontWeight: 600,
                                              borderColor: "#3b82f6",
                                              color: "#3b82f6",
                                              py: 0.25,
                                              "&:hover": { bgcolor: "#eff6ff" }
                                            }}
                                          >
                                            📋 View Client Feedback
                                          </Button>
                                        )}
                                      </Box>
                                    )}

                                    {isSiteVisit && it.outcome === "missed" && (
                                      <Box sx={{ mt: 0.5, pl: 1, borderLeft: "2px solid #ef4444", py: 0.25 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e293b", display: "block" }}>
                                          Reason: <span style={{ color: "#ef4444", fontWeight: 700 }}>{it.missedReason || "N/A"}</span>
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "#475569", display: "block", mt: 0.25 }}>
                                          <strong>Details:</strong> {it.missedReasonDetails || "No details provided."}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                ) : null}
                              </Box>
                            )}
                        </Box>
                      </Box>
                    );
                  })}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    pt: 0.5,
                    pb: 1,
                  }}
                >
                  <Tooltip title="Refresh">
                    <IconButton
                      onClick={loadFollowUps}
                      disabled={loadingItems}
                      size="small"
                      sx={{
                        color: "#94a3b8",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        px: 1.5,
                        py: 0.4,
                        fontSize: "0.7rem",
                        gap: 0.5,
                        transition: "all 0.15s",
                        "&:hover": {
                          color: "#2563eb",
                          borderColor: "#bfdbfe",
                          bgcolor: "#eff6ff",
                        },
                      }}
                    >
                      {loadingItems ? (
                        <CircularProgress size={14} thickness={5} />
                      ) : (
                        <RefreshIcon sx={{ fontSize: "0.9rem" }} />
                      )}
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 500 }}>
                        Refresh
                      </Typography>
                    </IconButton>
                  </Tooltip>
                </Box>
                <div ref={messagesEndRef} />
              </Stack>
            ) : (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography
                  color="text.secondary"
                  variant="body1"
                  sx={{ fontWeight: 500 }}
                >
                  No previous updates found for this lead.
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Pending actions alert */}
      {(() => {
        const pendingCount = items.filter(
          (it) =>
            (it.followUpType === "call back" ||
              it.followUpType === "site visit") &&
            it.followUpDate &&
            new Date() > new Date(it.followUpDate) &&
            (!it.outcome || it.outcome === "pending")
        ).length;
        if (!pendingCount) return null;
        return (
          <Box
            onClick={scrollToFirstPending}
            sx={{
              mx: 2,
              mt: 0.5,
              px: 1.5,
              py: 0.6,
              bgcolor: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              cursor: "pointer",
              transition: "all 0.15s",
              "&:hover": { bgcolor: "#fde68a", borderColor: "#f59e0b" },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "#f59e0b",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {pendingCount}
              </Box>
              <Typography
                sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#92400e" }}
              >
                {pendingCount === 1
                  ? "1 pending action needs your response"
                  : `${pendingCount} pending actions need your response`}
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#b45309",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                whiteSpace: "nowrap",
              }}
            >
              View ↑
            </Typography>
          </Box>
        );
      })()}

      {/* Compact input area – pinned to bottom */}
      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1.5,
          bgcolor: "#fff",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        {/* Type toggle – small pill buttons */}
        <Stack direction="row" spacing={0.75} sx={{ mb: 1 }}>
          {[
            {
              key: "call back" as const,
              label: "Schedule Call",
              color: "#2563eb",
              bg: "#eff6ff",
            },
            {
              key: "note" as const,
              label: "Note",
              color: "#059669",
              bg: "#ecfdf5",
            },
          ].map(({ key, label, color, bg }) => (
            <Box
              key={key}
              onClick={() => setFollowUpType(key)}
              sx={{
                px: 1.5,
                py: 0.4,
                fontSize: "0.7rem",
                fontWeight: 600,
                borderRadius: "20px",
                cursor: "pointer",
                transition: "all 0.15s",
                bgcolor: followUpType === key ? color : "transparent",
                color: followUpType === key ? "#fff" : color,
                border: `1.5px solid ${followUpType === key ? color : bg}`,
                "&:hover": { bgcolor: followUpType === key ? color : bg },
              }}
            >
              {label}
            </Box>
          ))}

          {onScheduleSiteVisit && (
            <Box
              onClick={() => {
                if (hasPendingSiteVisit) {
                  // alert("Please complete the pending site visit before scheduling a new one.");
                  return;
                }
                onScheduleSiteVisit(finalLeadIdentifier);
              }}
              sx={{
                px: 1.5,
                py: 0.4,
                fontSize: "0.7rem",
                fontWeight: 600,
                borderRadius: "20px",
                cursor: hasPendingSiteVisit ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                color: hasPendingSiteVisit ? "#9ca3af" : "#7c3aed",
                border: `1.5px solid ${hasPendingSiteVisit ? "#e5e7eb" : "#ede9fe"}`,
                bgcolor: hasPendingSiteVisit ? "#f3f4f6" : "transparent",
                "&:hover": { bgcolor: hasPendingSiteVisit ? "#f3f4f6" : "#f5f3ff" },
                opacity: hasPendingSiteVisit ? 0.7 : 1,
              }}
              title={hasPendingSiteVisit ? "Please complete the pending site visit first" : ""}
            >
              Site Visit
            </Box>
          )}
        </Stack>

        {/* Date picker – inline, compact */}
        <Box
          sx={{
            mb: 1,
            display: followUpType === "call back" ? "block" : "block h-[40px]",
          }}
        >
          {followUpType === "call back" && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                value={followUpDate}
                onChange={(newValue) => setFollowUpDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    placeholder: "Pick date & time",
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        bgcolor: "#f9fafb",
                        fontSize: "0.8rem",
                        height: 34,
                      },
                      "& .MuiInputBase-input": { py: 0.5 },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          )}
        </Box>

        {/* Textarea + send in one row */}
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write an update..."
            size="medium"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#f9fafb",
                fontSize: "0.8rem",
              },
            }}
          />
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitDisabled}
            sx={{
              minWidth: 40,
              height: 36,
              borderRadius: "8px",
              boxShadow: "none",
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
              "&:disabled": { bgcolor: "#e2e8f0" },
            }}
          >
            {submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isSubmitDisabled ? "#94a3b8" : "#fff"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </Button>
        </Stack>

        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            display: "block",
            color: "#9ca3af",
            fontSize: "0.65rem",
          }}
        >
          {user?.name || "Anonymous"}
        </Typography>
      </Box>

      {/* mForm Client Feedback Submission Dialog */}
      {feedbackViewOpen && (
        <Box
          sx={{
            position: "fixed", inset: 0, zIndex: 1400,
            bgcolor: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", p: 2,
          }}
          onClick={() => setFeedbackViewOpen(false)}
        >
          <Box
            sx={{
              bgcolor: "#fff", borderRadius: 4, maxWidth: 500, width: "100%",
              maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Box sx={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.2 }}>Client Feedback</Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Submitted via mForm</Typography>
              </Box>
              <IconButton size="small" onClick={() => setFeedbackViewOpen(false)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "#fff" } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ overflowY: "auto", flex: 1, p: 3 }}>
              {feedbackLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress size={32} />
                </Box>
              )}
              {feedbackError && (
                <Box sx={{ p: 2, bgcolor: "#fef2f2", borderRadius: 2, border: "1px solid #fecaca" }}>
                  <Typography variant="body2" color="error">{feedbackError}</Typography>
                </Box>
              )}
              {!feedbackLoading && !feedbackError && feedbackData && (
                <>
                  {/* Invite Status */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <Box sx={{
                      px: 1.5, py: 0.5, borderRadius: 99,
                      bgcolor: feedbackData.invite?.status === "completed" ? "#dcfce7" : "#fef3c7",
                      border: "1px solid",
                      borderColor: feedbackData.invite?.status === "completed" ? "#86efac" : "#fcd34d",
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: feedbackData.invite?.status === "completed" ? "#15803d" : "#92400e" }}>
                        {feedbackData.invite?.status === "completed" ? "✓ Feedback Received" : "⏳ Awaiting Response"}
                      </Typography>
                    </Box>
                    {feedbackData.feedbackFormUrl && (
                      <Button size="small" variant="text" onClick={() => window.open(feedbackData.feedbackFormUrl, "_blank")}
                        sx={{ fontSize: "0.68rem", textTransform: "none", color: "#3b82f6" }}>
                        Open Link ↗
                      </Button>
                    )}
                  </Box>

                  {feedbackData.submission ? (
                    <>
                      {/* Submitter info */}
                      <Typography variant="overline" sx={{ color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.65rem" }}>Respondent</Typography>
                      <Box sx={{ mt: 0.75, mb: 2.5, p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <Stack direction="row" spacing={3}>
                          <Box><Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>NAME</Typography><Typography variant="body2" fontWeight={700}>{feedbackData.submission.submittedBy?.name || "—"}</Typography></Box>
                          <Box><Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>PHONE</Typography><Typography variant="body2" fontWeight={700}>{feedbackData.submission.submittedBy?.phone || "—"}</Typography></Box>
                          <Box><Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontWeight: 600 }}>EMAIL</Typography><Typography variant="body2" fontWeight={700}>{feedbackData.submission.submittedBy?.email || "—"}</Typography></Box>
                        </Stack>
                      </Box>

                      {/* Answers */}
                      <Typography variant="overline" sx={{ color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.65rem" }}>Answers</Typography>
                      <Stack spacing={1.5} sx={{ mt: 0.75 }}>
                        {feedbackData.submission.answers?.map((ans: any, idx: number) => (
                          <Box key={idx} sx={{ p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.62rem" }}>
                              {ans.fieldLabel || ans.fieldId}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="#0f172a">
                              {Array.isArray(ans.value) ? ans.value.join(", ") : (ans.value?.toString() || "—")}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography sx={{ fontSize: "2.5rem", mb: 1 }}>📭</Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Client hasn&apos;t submitted the feedback yet.</Typography>
                      <Typography variant="caption" color="text.disabled">The link has been sent. Check back later.</Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default FollowUpDialog;
