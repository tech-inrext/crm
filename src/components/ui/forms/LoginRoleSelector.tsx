"use client";

import React, { useState, useMemo } from "react";
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
} from "../Component";
import { Person, Security } from "@mui/icons-material";

interface Role {
  _id: string;
  name: string;
}

interface RoleSelectionDialogProps {
  open: boolean;
  userName: string;
  userEmail: string;
  availableRoles: Role[];
  currentRole?: string;
  showCancel?: boolean;
  onRoleSelect: (role: string) => Promise<void>;
  onClose: () => void;
}

const RoleSelectionDialog: React.FC<RoleSelectionDialogProps> = ({
  open,
  userName,
  userEmail,
  availableRoles,
  currentRole,
  showCancel = false,
  onRoleSelect,
  onClose,
}) => {
  const initialRole = useMemo(() => {
    return currentRole || availableRoles?.[0]?._id;
  }, [currentRole, availableRoles]);

  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog
      open={open}
      onClose={showCancel ? onClose : () => {}}
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
            onChange={(e) => setSelectedRole(e.target.value as string)}
            disabled={loading}
          >
            {availableRoles.map((role) => (
              <MenuItem key={role._id} value={role._id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Typography>{role.name}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Info Text */}
        <Typography variant="body2" color="text.secondary">
          Note: You can change your role anytime from the profile menu
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        {showCancel && (
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={() => onRoleSelect(selectedRole)}
          variant="contained"
          disabled={loading || !selectedRole}
          sx={{
            minWidth: 120,
            fontWeight: 600,
            background: "#2196f3",
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
