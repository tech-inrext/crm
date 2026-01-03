"use client";

import React, { useState, useEffect, useRef } from "react";
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
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
  const [note, setNote] = useState("");
  const [followUpType, setFollowUpType] = useState<"call back" | "note">("call back");
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<Array<any>>([]);
  const [leadInfo, setLeadInfo] = useState<{ phone?: string; fullName?: string } | null>(null);
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
        followUpDate: followUpType === "call back" ? followUpDate : null
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
          setLoadError(err?.response?.data?.message || err.message || "Failed to load follow-ups");
      } finally {
        if (mounted) setLoadingItems(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [open, leadIdentifier]);

  const isSubmitDisabled = submitting || 
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
          boxShadow: isMobile ? "none" : "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 800, 
        fontSize: isMobile ? "1.1rem" : "1.3rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f3f4f6",
        bgcolor: "#fff",
        py: 2
      }}>
        Daily Updates & Reminders
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, bgcolor: "#f9fafb" }}>
        <Stack spacing={0}>
          {/* History Section Header */}
          <Box sx={{ px: 3, pt: 2, pb: 1 }}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: "0.05em" }}>
              Previous Records
            </Typography>
          </Box>

          {/* Scrollable History Area */}
          <Box
            sx={{
              height: isMobile ? "calc(100vh - 450px)" : 320,
              minHeight: 200,
              overflowY: "auto",
              px: 3,
              pb: 3,
              scrollBehavior: "smooth"
            }}
          >
            {loadingItems ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CircularProgress size={24} thickness={5} />
              </Box>
            ) : loadError ? (
              <Box sx={{ p: 2, textAlign: "center", bgcolor: "#fee2e2", borderRadius: 2 }}>
                <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>{loadError}</Typography>
              </Box>
            ) : items.length > 0 ? (
              <Stack spacing={3}>
                {items.map((it) => {
                  const isCallBack = it.followUpType === "call back";
                  const accentColor = isCallBack ? "#2563eb" : "#059669";
                  
                  return (
                    <Box
                      key={it._id}
                      sx={{
                        width: "100%",
                        bgcolor: "#fff",
                        borderRadius: "16px",
                        border: "1px solid #e5e7eb",
                        borderLeft: `6px solid ${accentColor}`,
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                        transition: "all 0.2s ease-in-out",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          borderColor: "#d1d5db"
                        }
                      }}
                    >
                      {/* Subgraph background for Call Back */}
                      {isCallBack && (
                        <Box sx={{ 
                          position: "absolute", 
                          top: -20, 
                          right: -20, 
                          width: 80, 
                          height: 80, 
                          bgcolor: "#eff6ff", 
                          borderRadius: "50%", 
                          zIndex: 0,
                          opacity: 0.5
                        }} />
                      )}

                      <Box sx={{ p: 2, position: "relative", zIndex: 1 }}>
                        {/* Header: User Info & Time */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                fontSize: "0.9rem", 
                                fontWeight: 800,
                                bgcolor: isCallBack ? "#eff6ff" : "#ecfdf5",
                                color: accentColor,
                                border: `1px solid ${accentColor}15`
                              }}
                            >
                              {getInitials(it.submittedByName)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
                                {it.submittedByName || "System User"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                                {it.createdAt ? new Date(it.createdAt).toLocaleString([], { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                }) : ""}
                              </Typography>
                            </Box>
                          </Stack>
                          
                          <Chip
                            label={it.followUpType}
                            size="small"
                            sx={{ 
                              height: 22, 
                              fontSize: "0.6rem", 
                              fontWeight: 900, 
                              textTransform: "uppercase",
                              bgcolor: isCallBack ? "#dbeafe" : "#d1fae5",
                              color: isCallBack ? "#1e40af" : "#065f46",
                              letterSpacing: "0.05em",
                              borderRadius: "6px"
                            }}
                          />
                        </Stack>

                        {/* Middle: Note Content */}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: "#374151", 
                            fontSize: "0.925rem", 
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                            mb: 2
                          }}
                        >
                          {it.note !== "N/A" ? it.note : <span style={{ fontStyle: "italic", color: "#9ca3af" }}>No detailed remarks provided.</span>}
                        </Typography>

                        {/* Footer: Actionable Info */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: "auto" }}>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {it.followUpDate && (
                              <Chip
                                icon={<Event sx={{ fontSize: "14px !important", color: "#2563eb !important" }} />}
                                label={`Reminder: ${new Date(it.followUpDate).toLocaleString([], { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}`}
                                size="small"
                                sx={{ 
                                  bgcolor: "#f3f4f6", 
                                  border: "1px solid #e5e7eb",
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                  height: 26,
                                  color: "#1f2937"
                                }}
                              />
                            )}
                          </Box>

                          {isCallBack && leadInfo?.phone && (
                            <Tooltip title={`Initiate Call to ${leadInfo.phone}`}>
                              <IconButton 
                                size="small" 
                                component="a"
                                href={`tel:${leadInfo.phone}`}
                                sx={{ 
                                  bgcolor: "#2563eb", 
                                  color: "#fff",
                                  "&:hover": { bgcolor: "#1e40af", transform: "scale(1.1)" },
                                  transition: "all 0.2s"
                                }}
                              >
                                <PhoneIcon sx={{ fontSize: "1.1rem" }} />
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
                <Typography color="text.secondary" variant="body1" sx={{ fontWeight: 500 }}>No previous updates found for this lead.</Typography>
              </Box>
            )}
          </Box>

          {/* Record Input Area */}
          <Box sx={{ p: 3, bgcolor: "#fff", borderTop: "2px solid #f3f4f6" }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: 1 }}>
              <Notes sx={{ color: "#3b82f6" }} /> Add New Update
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Button
                variant={followUpType === "call back" ? "contained" : "outlined"}
                onClick={() => setFollowUpType("call back")}
                fullWidth
                sx={{ 
                  textTransform: "none", 
                  borderRadius: "12px",
                  fontWeight: 800,
                  py: 1.2,
                  fontSize: "0.9rem",
                  boxShadow: followUpType === "call back" ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none"
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
                  borderRadius: "12px",
                  fontWeight: 800,
                  py: 1.2,
                  fontSize: "0.9rem",
                  boxShadow: followUpType === "note" ? "0 4px 12px rgba(5, 150, 105, 0.2)" : "none"
                }}
              >
                Simple Note
              </Button>
            </Stack>

            {followUpType === "call back" && (
               <Box sx={{ mb: 3 }}>
                 <LocalizationProvider dateAdapter={AdapterDateFns}>
                   <DateTimePicker
                     label="Callback Date & Time"
                     value={followUpDate}
                     onChange={(newValue) => setFollowUpDate(newValue)}
                     slotProps={{ 
                       textField: { 
                         fullWidth: true, 
                         size: isMobile ? "small" : "medium",
                         sx: { "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "#f9fafb" } }
                       } 
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
              sx={{ 
                bgcolor: "#f9fafb",
                "& .MuiOutlinedInput-root": { borderRadius: "14px" }
              }}
            />
            
            <Typography variant="caption" sx={{ mt: 1, display: "block", color: "text.secondary", fontWeight: 500 }}>
              Logged by: <strong>{user?.name || "Anonymous"}</strong>
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2.5, borderTop: "1px solid #f3f4f6", bgcolor: "#fff" }}>
        <Button 
          onClick={onClose} 
          disabled={submitting} 
          sx={{ color: "text.secondary", fontWeight: 700, textTransform: "none", px: 3 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitDisabled}
          sx={{ 
            px: 5, 
            py: 1.2,
            borderRadius: "12px", 
            fontWeight: 800,
            textTransform: "none",
            fontSize: "0.95rem",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            background: "linear-gradient(45deg, #2563eb, #3b82f6)"
          }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Save Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowUpDialog;
