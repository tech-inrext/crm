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
  Box,
  Stack,
  Divider,
} from "@/components/ui/Component";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

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
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async () => {
    // Validation: 
    // If type is 'note', note text is required.
    // If type is 'call back', date is required.
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
      // refresh list after save (keep dialog open so user sees the updated list)
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
      setFollowUpType("call back"); // Reset to default
      
      if (onSaved) onSaved();
      // Keep dialog open to show updated chat
      // onClose(); 
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
        if (mounted) setItems(res.data.data || []);
      } catch (err: any) {
        console.error("Failed to load follow-up items", err);
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600 }}>Daily Updates & Reminders</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Previous Updates & Reminders
            </Typography>
            <Box
              sx={{
                maxHeight: 300,
                overflowY: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                p: 2,
                bgcolor: "#f0f2f5", // Light gray background like WhatsApp web
                backgroundImage: "linear-gradient(#f0f2f5 1px, transparent 1px), linear-gradient(90deg, #f0f2f5 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            >
              {loadingItems ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : loadError ? (
                <Box sx={{ p: 1 }}>
                  <Typography color="error" variant="caption">{loadError}</Typography>
                </Box>
              ) : items.length > 0 ? (
                <Stack spacing={1.5}>
                  {items.map((it) => {
                    // Check if the current note was submitted by the logged-in user
                    // Handle both populated object and direct ID string cases
                    const submittedById = it.submittedBy?._id || it.submittedBy;
                    const isMe = String(submittedById) === String(user?._id);

                    return (
                      <Box
                        key={it._id}
                        sx={{
                          display: "flex",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: "80%",
                            p: 1.5,
                            borderRadius: 2,
                            // WhatsApp-style corner tweaks
                            borderTopRightRadius: isMe ? 0 : 2,
                            borderTopLeftRadius: !isMe ? 0 : 2,
                            bgcolor: isMe ? "#dcf8c6" : "#ffffff", // Standard WhatsApp colors (Greenish for me, White for others)
                            boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                            position: "relative",
                          }}
                        >
                          {/* Header: Name (only for others) and Type */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            {!isMe && (
                              <Typography variant="caption" sx={{ fontWeight: 700, color: "#d32f2f" }}>
                                {it.submittedByName || "Unknown"}
                              </Typography>
                            )}
                            {it.followUpType && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: "0.7rem",
                                  bgcolor: "rgba(0,0,0,0.05)",
                                  px: 0.5,
                                  borderRadius: 0.5,
                                  marginLeft: !isMe ? "auto" : 0
                                }}
                              >
                                {it.followUpType}
                              </Typography>
                            )}
                          </Stack>

                          {/* Message Content */}
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "#303030" }}>
                            {it.note !== "N/A" ? it.note : <span style={{ fontStyle: "italic", color: "#aaa" }}>No note content</span>}
                          </Typography>

                          {/* Reminder Date */}
                          {it.followUpDate && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: "#1976d2", fontWeight: 500 }}>
                              📅 Reminder: {new Date(it.followUpDate).toLocaleString()}
                            </Typography>
                          )}

                          {/* Footer: Timestamp */}
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block', 
                              textAlign: 'right', 
                              mt: 0.5, 
                              color: "text.secondary", 
                              fontSize: "0.7rem" 
                            }}
                          >
                            {it.createdAt ? new Date(it.createdAt).toLocaleString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            }) : ""}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Stack>
              ) : (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography color="textSecondary" variant="body2">
                    No updates yet.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Submitted by: <span style={{ fontWeight: 500, color: '#333' }}>{user?.name || "Unknown"}</span>
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                variant={followUpType === "call back" ? "contained" : "outlined"}
                onClick={() => setFollowUpType("call back")}
                fullWidth
                sx={{ textTransform: "capitalize", borderRadius: 2 }}
                color={followUpType === "call back" ? "primary" : "inherit"}
              >
                Call Back
              </Button>
              <Button
                variant={followUpType === "note" ? "contained" : "outlined"}
                onClick={() => setFollowUpType("note")}
                fullWidth
                sx={{ textTransform: "capitalize", borderRadius: 2 }}
                color={followUpType === "note" ? "primary" : "inherit"}
              >
                Note
              </Button>
            </Stack>

            {followUpType === "call back" && (
               <Box sx={{ mb: 2 }}>
                 <LocalizationProvider dateAdapter={AdapterDateFns}>
                   <DateTimePicker
                     label="Follow-up Date & Time *"
                     value={followUpDate}
                     onChange={(newValue) => setFollowUpDate(newValue)}
                     slotProps={{ textField: { fullWidth: true, size: "medium" } }}
                   />
                 </LocalizationProvider>
               </Box>
            )}

            <TextField
              label="Notes"
              fullWidth
              multiline
              minRows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your remarks or updates here..."
              sx={{ bgcolor: "#fafafa" }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: "text.secondary" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitDisabled}
          sx={{ px: 4, borderRadius: 2 }}
        >
          {submitting ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowUpDialog;
