"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Person, Security } from "@mui/icons-material";

interface RoleSelectionDialogProps {
  open: boolean;
  userName: string;
  userEmail: string;
  availableRoles: string[];
  defaultRole?: string;
  onRoleSelect: (role: string) => Promise<void>;
  onClose: () => void;
}

const RoleSelectionDialog: React.FC<RoleSelectionDialogProps> = ({
  open,
  userName,
  userEmail,
  availableRoles,
  defaultRole,
  onRoleSelect,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(() => {
    // Ensure the default role is in available roles, otherwise pick the first available
    const validDefault =
      defaultRole && availableRoles.includes(defaultRole)
        ? defaultRole
        : availableRoles[0] || "";
    return validDefault;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      setError("Please select a role to continue");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onRoleSelect(selectedRole);
    } catch (error) {
      console.error("Role selection failed:", error);
      setError("Failed to set role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      Admin: "#f44336",
      Manager: "#ff9800",
      Sales: "#4caf50",
      HR: "#2196f3",
      Employee: "#9c27b0",
    };
    return roleColors[role] || "#757575";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Security color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" component="div" fontWeight={700}>
          Welcome Back!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Select your role to continue
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {/* User Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {userName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userEmail}
            </Typography>
          </Box>
        </Box>

        {/* Role Selection */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="role-select-label">Select Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole}
            label="Select Role"
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={loading}
          >
            {availableRoles.map((role) => (
              <MenuItem key={role} value={role}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Chip
                    label={role}
                    size="small"
                    sx={{
                      backgroundColor: getRoleColor(role),
                      color: "white",
                      fontWeight: 600,
                      minWidth: 80,
                    }}
                  />
                  <Typography>{role}</Typography>
                  {role === defaultRole && (
                    <Chip
                      label="Default"
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ ml: "auto" }}
                    />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Available Roles Display */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Your available roles:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {availableRoles.map((role) => (
              <Chip
                key={role}
                label={role}
                size="small"
                variant={role === selectedRole ? "filled" : "outlined"}
                sx={{
                  backgroundColor:
                    role === selectedRole ? getRoleColor(role) : "transparent",
                  color: role === selectedRole ? "white" : getRoleColor(role),
                  borderColor: getRoleColor(role),
                  fontWeight: 600,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Info Text */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          You can switch roles later from your profile menu
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleRoleSelect}
          variant="contained"
          disabled={loading || !selectedRole}
          sx={{
            minWidth: 120,
            fontWeight: 600,
            background: selectedRole ? getRoleColor(selectedRole) : undefined,
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Continue"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleSelectionDialog;
