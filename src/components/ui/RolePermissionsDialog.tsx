import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import { Close, Security } from "@mui/icons-material";
import {
  permissionColors,
  rolePermissionsDialogStyles,
} from "./RoleCard.styles";

interface RolePermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  role: any;
}

const RolePermissionsDialog: React.FC<RolePermissionsDialogProps> = ({
  open,
  onClose,
  role,
}) => {
  if (!role) return null;

  // Group permissions by module
  const groupedPermissions = role.permissions.reduce(
    (acc: any, perm: string) => {
      const [module, action] = perm.split(":");
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(action);
      return acc;
    },
    {}
  );

  const modules = Object.keys(groupedPermissions);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth={false}
      PaperProps={{
        sx: rolePermissionsDialogStyles.dialog,
      }}
    >
      <DialogTitle sx={rolePermissionsDialogStyles.dialogTitle}>
        <Box sx={rolePermissionsDialogStyles.titleBox}>
          <Security />
          <Typography
            variant="h6"
            component="div"
            sx={rolePermissionsDialogStyles.titleText}
          >
            {role.name} - Permissions
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={rolePermissionsDialogStyles.closeButton}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={rolePermissionsDialogStyles.dialogContent}>
        {modules.length === 0 ? (
          <Box sx={rolePermissionsDialogStyles.noPermissionsBox}>
            <Security sx={rolePermissionsDialogStyles.noPermissionsIcon} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Permissions Assigned
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This role doesn't have any permissions assigned yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {modules.map((module, index) => (
              <Grid item xs={12} sm={6} md={4} key={module}>
                <Paper
                  elevation={0}
                  sx={rolePermissionsDialogStyles.modulePaper}
                >
                  <Typography
                    variant="subtitle1"
                    sx={rolePermissionsDialogStyles.moduleTitle}
                  >
                    {module === "employee" ? "User" : module}
                  </Typography>
                  <Divider sx={{ mb: 1.5 }} />
                  <Box sx={rolePermissionsDialogStyles.moduleActions}>
                    {groupedPermissions[module].map(
                      (action: string, i: number) => (
                        <Chip
                          key={i}
                          label={
                            action.charAt(0).toUpperCase() + action.slice(1)
                          }
                          size="small"
                          sx={{
                            ...rolePermissionsDialogStyles.actionChip,
                            backgroundColor:
                              permissionColors[
                                action as keyof typeof permissionColors
                              ] || permissionColors.read,
                          }}
                        />
                      )
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={rolePermissionsDialogStyles.dialogActions}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={rolePermissionsDialogStyles.closeActionButton}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RolePermissionsDialog;
