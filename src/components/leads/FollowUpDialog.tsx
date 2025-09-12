"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
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
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<Array<any>>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      const payload = { leadIdentifier, note };
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
      if (onSaved) onSaved();
      // close the dialog after successful save
      onClose();
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Submit Follow-up</DialogTitle>
      <DialogContent>
        <div style={{ marginBottom: 12 }}>
          <strong>Previous follow-ups</strong>
          <div style={{ maxHeight: 200, overflow: "auto", marginTop: 8 }}>
            {loadingItems ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: 16,
                }}
              >
                <CircularProgress size={20} />
              </div>
            ) : loadError ? (
              <div style={{ padding: 12 }}>
                <Typography color="error">{loadError}</Typography>
              </div>
            ) : items.length > 0 ? (
              items.map((it) => (
                <div
                  key={it._id}
                  style={{
                    marginBottom: 8,
                    borderBottom: "1px solid #eee",
                    paddingBottom: 6,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {it.createdAt
                      ? new Date(it.createdAt).toLocaleString()
                      : ""}{" "}
                    — {it.submittedByName || "Unknown"}
                  </div>
                  <div style={{ marginTop: 4 }}>{it.note}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: 12 }}>
                <Typography color="textSecondary">
                  No follow-ups yet.
                </Typography>
              </div>
            )}
          </div>
        </div>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Submitted by: {user?.name || "Unknown"}
        </Typography>
        <TextField
          label="Follow-up"
          fullWidth
          multiline
          minRows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your follow-up or notes here..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !note.trim()}
        >
          {submitting ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowUpDialog;
