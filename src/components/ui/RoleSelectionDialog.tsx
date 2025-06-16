"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Radio,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";
import {
  AdminPanelSettings,
  Person,
  SupervisorAccount,
} from "@mui/icons-material";

interface RoleSelectionDialogProps {
  open: boolean;
  userRoles: string[];
  currentRole?: string;
  onRoleSelect: (role: string) => void;
  onClose: () => void;
  userName?: string;
}

const RoleSelectionDialog: React.FC<RoleSelectionDialogProps> = ({
  open,
  userRoles,
  currentRole,
  onRoleSelect,
  onClose,
  userName = "User",
}) => {
  const [selectedRole, setSelectedRole] = useState(
    currentRole || userRoles[0] || ""
  );

  const getRoleIcon = (role: string) => {
    if (role.toLowerCase().includes("admin")) return <AdminPanelSettings />;
    if (
      role.toLowerCase().includes("manager") ||
      role.toLowerCase().includes("supervisor")
    )
      return <SupervisorAccount />;
    return <Person />;
  };

  const getRoleColor = (role: string) => {
    if (role.toLowerCase().includes("admin")) return "error";
    if (
      role.toLowerCase().includes("manager") ||
      role.toLowerCase().includes("supervisor")
    )
      return "warning";
    return "primary";
  };

  const handleRoleSelect = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
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
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: "auto",
            mb: 2,
            bgcolor: "primary.main",
            fontSize: "1.5rem",
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h5" fontWeight={600}>
          Welcome, {userName}!
        </Typography>{" "}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          You have multiple roles. Please select which role you&apos;d like to
          use for this session.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <List sx={{ pt: 0 }}>
          {userRoles.map((role) => (
            <ListItem key={role} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => setSelectedRole(role)}
                selected={selectedRole === role}
                sx={{
                  borderRadius: 2,
                  border: selectedRole === role ? 2 : 1,
                  borderColor:
                    selectedRole === role ? "primary.main" : "divider",
                  "&.Mui-selected": {
                    bgcolor: "primary.50",
                  },
                }}
              >
                <ListItemIcon>
                  <Radio
                    checked={selectedRole === role}
                    value={role}
                    sx={{ mr: 1 }}
                  />
                  {getRoleIcon(role)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {role}
                      </Typography>{" "}
                      <Chip
                        label={
                          role.toLowerCase().includes("admin")
                            ? "Full Access"
                            : role.toLowerCase().includes("manager")
                            ? "Management"
                            : "Standard"
                        }
                        size="small"
                        color={
                          getRoleColor(role) as "primary" | "error" | "warning"
                        }
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    role.toLowerCase().includes("admin")
                      ? "Access to all features and settings"
                      : role.toLowerCase().includes("manager")
                      ? "Team management and reporting features"
                      : "Standard user permissions"
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleRoleSelect}
          variant="contained"
          disabled={!selectedRole}
          sx={{
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          Continue as {selectedRole}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleSelectionDialog;
