"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
} from "@/components/ui/Component";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

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
}

const FollowUpDialog: React.FC<FollowUpDialogProps> = ({
  open,
  onClose,
  leadIdentifier,
  onSaved,
}) => {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [followUpType, setFollowUpType] = useState<"call back" | "note">(
    "call back"
  );
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<Array<any>>([]);
  const [leadInfo, setLeadInfo] = useState<{
    phone?: string;
    fullName?: string;
  } | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = async () => {
    if (followUpType === "note" && !note.trim()) return;
    if (followUpType === "call back" && !followUpDate) return;

    setSubmitting(true);
    try {
      const payload = {
        leadIdentifier,
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
          params: { leadIdentifier },
          withCredentials: true,
        });
        setItems(res.data.data || []);
      } catch (err) {
        console.error("Failed to refresh follow-ups after save", err);
      }
      setNote("");
      setFollowUpDate(null);
      setFollowUpType("call back");

      if (onSaved) onSaved();
    } catch (err) {
      console.error("Failed to submit follow-up", err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open) return;
      setLoadError(null);
      setLoadingItems(true);
      try {
        const res = await axios.get(`/api/v0/lead/follow-up`, {
          params: { leadIdentifier },
          withCredentials: true,
        });
        if (mounted) {
          setItems(res.data.data || []);
          setLeadInfo(res.data.lead || null);
        }
      } catch (err: any) {
        if (mounted)
          setLoadError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load follow-ups"
          );
      } finally {
        if (mounted) setLoadingItems(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [open, leadIdentifier]);

  const isSubmitDisabled =
    submitting ||
    (followUpType === "note" && !note.trim()) ||
    (followUpType === "call back" && !followUpDate);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && items.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [items, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          backgroundImage: "none",
          boxShadow: isMobile ? "none" : "0 10px 30px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 500,
          fontSize: isMobile ? "1rem" : "1.05rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f3f4f6",
          bgcolor: "#fff",
          py: 1,
          px: 2.5,
        }}
      >
        Daily Updates & Reminders
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: "#f8fafc" }}>
        <Stack spacing={0}>
          {/* History Section Header */}
          <Box sx={{ px: 2.5, pt: 1, pb: 0.5 }}>
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
          </Box>

          {/* Scrollable History Area */}
          <Box
            sx={{
              height: isMobile ? "calc(100vh - 430px)" : 280,
              minHeight: 200,
              overflowY: "auto",
              px: 2.5,
              pb: 2,
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
                {items.map((it) => {
                  const isCallBack = it.followUpType === "call back";
                  const isSiteVisit = it.followUpType === "site visit";

                  let accentColor = "#059669"; // default note (green)
                  if (isCallBack) accentColor = "#2563eb"; // blue
                  if (isSiteVisit) accentColor = "#7c3aed"; // violet/purple

                  let bgColor = "#ecfdf5";
                  if (isCallBack) bgColor = "#eff6ff";
                  if (isSiteVisit) bgColor = "#f5f3ff";

                  let chipColor = "#065f46";
                  if (isCallBack) chipColor = "#1e40af";
                  if (isSiteVisit) chipColor = "#5b21b6";

                  let chipBg = "#d1fae5";
                  if (isCallBack) chipBg = "#dbeafe";
                  if (isSiteVisit) chipBg = "#ede9fe";

                  return (
                    <Box
                      key={it._id}
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
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: "0.75rem",
                                fontWeight: 600,
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
                                  fontWeight: 600,
                                  color: "#111827",
                                  lineHeight: 1.2,
                                }}
                              >
                                {it.submittedByName || "System User"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 400,
                                }}
                              >
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
                            </Box>
                          </Stack>

                          <Chip
                            label={it.followUpType}
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

                        {/* Middle: Note Content */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#374151",
                            fontSize: "0.85rem",
                            lineHeight: 1.45,
                            whiteSpace: "pre-wrap",
                            mb: 1,
                          }}
                        >
                          {it.note !== "N/A" ? (
                            it.note
                          ) : (
                            <span
                              style={{ fontStyle: "italic", color: "#9ca3af" }}
                            >
                              No detailed remarks provided.
                            </span>
                          )}
                        </Typography>

                        {/* Footer: Actionable Info */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mt: "auto" }}
                        >
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {it.followUpDate && it.followUpType !== "note" && (
                              <Chip
                                icon={
                                  <Event
                                    sx={{
                                      fontSize: "14px !important",
                                      color: "#2563eb !important",
                                    }}
                                  />
                                }
                                label={`Reminder: ${new Date(
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
                        </Stack>
                      </Box>
                    </Box>
                  );
                })}
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

          {/* Record Input Area */}
          <Box sx={{ p: 2, bgcolor: "#fff", borderTop: "1px solid #f1f5f9" }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1,
                fontWeight: 600,
                color: "#111827",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Notes sx={{ color: "#3b82f6" }} /> Add New Update
            </Typography>

            <Stack direction="row" spacing={1.25} sx={{ mb: 1.5 }}>
              <Button
                variant={
                  followUpType === "call back" ? "contained" : "outlined"
                }
                onClick={() => setFollowUpType("call back")}
                fullWidth
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  py: 0.7,
                  fontSize: "0.8rem",
                  boxShadow: "none",
                }}
              >
                Schedule Call
              </Button>
              <Button
                variant={followUpType === "note" ? "contained" : "outlined"}
                onClick={() => setFollowUpType("note")}
                fullWidth
                color="success"
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  py: 0.7,
                  fontSize: "0.8rem",
                  boxShadow: "none",
                }}
              >
                Simple Note
              </Button>
            </Stack>

            {followUpType === "call back" && (
              <Box sx={{ mb: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Callback Date & Time"
                    value={followUpDate}
                    onChange={(newValue) => setFollowUpDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            bgcolor: "#f9fafb",
                            minHeight: 36,
                          },
                          "& .MuiInputBase-input": { py: 0.75 },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            )}

            <TextField
              label="Update Details"
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Start typing the discussion details..."
              size="small"
              sx={{
                bgcolor: "#f9fafb",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />

            <Typography
              variant="caption"
              sx={{
                mt: 0.75,
                display: "block",
                color: "text.secondary",
                fontWeight: 400,
              }}
            >
              Logged by: <strong>{user?.name || "Anonymous"}</strong>
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid #f3f4f6",
          bgcolor: "#fff",
        }}
      >
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            color: "text.secondary",
            fontWeight: 500,
            textTransform: "none",
            px: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitDisabled}
          sx={{
            px: 3.5,
            py: 0.7,
            borderRadius: "8px",
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.85rem",
            boxShadow: "none",
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
          }}
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Save Update"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowUpDialog;
