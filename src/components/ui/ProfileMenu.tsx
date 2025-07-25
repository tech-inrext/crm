"use client";

import React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import AccountCircle from "@mui/icons-material/AccountCircle";
import {
  Logout,
  Person,
  Settings,
  SwapHoriz,
  LockReset,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

import Profile from "@/components/ui/Profile";
import RoleSelectionDialog from "@/components/ui/RoleSelectionDialog";

const ProfileMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const open = Boolean(anchorEl);
  const { user, logout, switchRole, setChangeRole } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRoleSwitchClick = () => {
    setChangeRole(true);
    handleClose();
  };

  const handleProfileOpen = () => {
    handleClose();
    setTimeout(() => setProfileOpen(true), 150);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleResetPassword = async () => {
    setResetPasswordOpen(true);
    handleClose();
  };

  const handleResetPasswordSubmit = async () => {
    // Validate required fields
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    // Validate new password criteria
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match. Please try again.");
      return;
    }

    if (!user?.email) {
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
          email: user.email,
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Password reset successfully!");

        // Reset form and close dialog
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setResetPasswordOpen(false);
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

  const handleCloseResetPassword = () => {
    setResetPasswordOpen(false);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const getCurrentRoleName = () => {
    return user?.roles.find((role) => role._id === user?.currentRole)?.name;
  };

  return (
    <>
      <IconButton
        color=""
        onClick={handleMenu}
        sx={{ ml: 1 }}
        aria-label="profile menu"
        aria-controls={open ? "profile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <AccountCircle fontSize="large" />
      </IconButton>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "profile-menu" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          "& .MuiPaper-root": {
            minWidth: 200,
            mt: 1,
            borderRadius: 2,
          },
        }}
      >
        {user && [
          <MenuItem
            key="user-info"
            sx={{
              py: 1.5,
              flexDirection: "column",
              alignItems: "flex-start",
              cursor: "default",
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#000" }}
            >
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {user.email}
            </Typography>
          </MenuItem>,
          <Divider key="divider-1" />,
        ]}
        <MenuItem onClick={handleProfileOpen} sx={{ py: 1 }}>
          <Person sx={{ mr: 2, fontSize: 20 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleRoleSwitchClick} sx={{ py: 1 }}>
          <SwapHoriz sx={{ mr: 2, fontSize: 20 }} />
          Switch Role ({getCurrentRoleName()})
        </MenuItem>
        <MenuItem onClick={handleResetPassword} sx={{ py: 1 }}>
          <LockReset sx={{ mr: 2, fontSize: 20 }} />
          Reset Password
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ py: 1 }}>
          <Settings sx={{ mr: 2, fontSize: 20 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1, color: "error.main" }}>
          <Logout sx={{ mr: 2, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Reset Password Modal */}
      <Dialog
        open={resetPasswordOpen}
        onClose={handleCloseResetPassword}
        maxWidth="sm"
        fullWidth
      >
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
          <Button onClick={handleCloseResetPassword} disabled={isResetting}>
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
      {/* Profile Dialog */}
      <Profile open={profileOpen} onClose={handleProfileClose} user={user} />
    </>
  );
};

export default ProfileMenu;
