"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Chip,
} from "@mui/material";
import { SwapHoriz, Person } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const ProfileRoleSwitcher: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(
    user?.currentRole || user?.role || ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const hasMultipleRoles = userRoles.length > 1;

  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === user?.currentRole) return;

    setLoading(true);
    setMessage(null);

    try {
      await switchRole(selectedRole);
      setMessage({
        type: "success",
        text: `Successfully switched to ${selectedRole} role`,
      });

      // Refresh page to apply new role permissions
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Role switch error:", error);
      setMessage({
        type: "error",
        text: "Failed to switch role. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasMultipleRoles) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Person color="action" />
          <Box>
            <Typography variant="h6">Current Role</Typography>
            <Chip label={user?.role || "No role assigned"} color="primary" />
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography
        variant="h6"
        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <SwapHoriz />
        Role Management
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        You have access to multiple roles. Switch between them to access
        different features and permissions.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        <FormControl fullWidth>
          <InputLabel>Select Role</InputLabel>
          <Select
            value={selectedRole}
            label="Select Role"
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={loading}
          >
            {userRoles.map((role) => (
              <MenuItem key={role} value={role}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Typography>{role}</Typography>
                  {role === user?.currentRole && (
                    <Chip label="Current" size="small" color="primary" />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleRoleChange}
          disabled={loading || selectedRole === user?.currentRole}
          sx={{ minWidth: 120, height: 56 }}
        >
          {loading ? <CircularProgress size={24} /> : "Switch Role"}
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Current active role:{" "}
          <strong>{user?.currentRole || user?.role}</strong>
        </Typography>
      </Box>
    </Paper>
  );
};

export default ProfileRoleSwitcher;
