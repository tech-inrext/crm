import React, { useState } from "react";
import Dialog from "@/components/ui/Component/Dialog";
import DialogTitle from "@/components/ui/Component/DialogTitle";
import DialogContent from "@/components/ui/Component/DialogContent";
import DialogActions from "@/components/ui/Component/DialogActions";
import TextField from "@/components/ui/Component/TextField";
import Button from "@/components/ui/Component/Button";
import Box from "@/components/ui/Component/Box";

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  onClose,
  userEmail,
}) => {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPasswordSubmit = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match. Please try again.");
      return;
    }

    if (!userEmail) {
      alert("User email not found. Please log in again.");
      return;
    }

    setIsResetting(true);

    try {
      const response = await fetch("/api/v0/employee/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Password reset successfully!");
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        onClose();
      } else if (response.status === 401 || response.status === 404) {
        alert("Invalid current password.");
      } else {
        alert(`Error: ${data.message || "Failed to reset password."}`);
      }
    } catch (error) {
      console.error("Password reset failed:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleClose = () => {
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Current Password"
            type="password"
            value={passwordForm.oldPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                oldPassword: e.target.value,
              })
            }
            fullWidth
            variant="outlined"
          />
          <TextField
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                newPassword: e.target.value,
              })
            }
            fullWidth
            variant="outlined"
            helperText="Password must be at least 6 characters long"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value,
              })
            }
            fullWidth
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isResetting}>
          Cancel
        </Button>
        <Button
          onClick={handleResetPasswordSubmit}
          variant="contained"
          disabled={isResetting}
        >
          {isResetting ? "Resetting..." : "Reset Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordDialog;