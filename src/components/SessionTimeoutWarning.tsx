"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { AccessTime } from "@mui/icons-material";

interface SessionTimeoutWarningProps {
  open: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  remainingTime: number; // in seconds
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  open,
  onExtendSession,
  onLogout,
  remainingTime,
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    setTimeLeft(remainingTime);
  }, [remainingTime]);

  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      onClose={() => {}} // Prevent closing by clicking outside
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AccessTime color="warning" />
        Session Timeout Warning
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your session is about to expire due to inactivity.
        </Alert>
        <Typography variant="body1" gutterBottom>
          You will be automatically logged out in:
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            my: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: timeLeft <= 30 ? "error.main" : "warning.main",
              fontFamily: "monospace",
            }}
          >
            {formatTime(timeLeft)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Click "Stay Logged In" to extend your session, or "Logout" to sign out
          now.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onLogout} variant="outlined" color="error">
          Logout Now
        </Button>
        <Button
          onClick={onExtendSession}
          variant="contained"
          color="primary"
          autoFocus
        >
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutWarning;
