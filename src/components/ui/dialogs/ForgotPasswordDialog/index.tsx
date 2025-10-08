import { useEffect } from "react";
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

interface ForgotPasswordDialogProps { 
  open: boolean;
  onClose: () => void;
}

export default function ForgotPasswordDialog({
  open,
  onClose,
}: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open) {
      setStep("email");
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");  
      setSuccess("");  
      setLoading(false);
    }
  }, [open]);

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Call your backend API to send OTP
      const res = await fetch("/api/v0/employee/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Defensive parsing: server may return non-JSON (HTML/text) in some error
      // situations (proxies, platform error pages). Try JSON first, otherwise
      // fallback to text so we can show a readable message instead of crashing.
      let data: any = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text();
        data = { message: text || "Unknown error" };
      }

      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setStep("otp");
      setSuccess("OTP sent to your email.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setSuccess("");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Call your backend API to verify OTP and reset password
      const res = await fetch("/api/v0/employee/reset-password-with-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        onClose();
        // Optionally redirect to login page here
      }, 4000);
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Forgot Password</DialogTitle>
      <DialogContent>
        {step === "email" && (
          <>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              disabled={loading}
            />
          </>
        )}
        {step === "otp" && (
          <>
            <TextField
              label="OTP"
              fullWidth
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </>
        )}
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        {success && (
          <div style={{ color: "green", marginTop: 8 }}>{success}</div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {step === "email" ? (
          <Button
            onClick={handleSendOtp}
            disabled={loading || !email}
            variant="contained"
          >
            {loading ? <CircularProgress size={20} /> : "Send OTP"}
          </Button>
        ) : (
          <Button
            onClick={handleResetPassword}
            disabled={loading || !otp || !newPassword || !confirmPassword}
            variant="contained"
          >
            {loading ? <CircularProgress size={20} /> : "Reset Password"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
