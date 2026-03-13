// src/fe/pages/roles/components/dialog/RolePermissionsDialog.tsx
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
  CloseIcon,
  SecurityIcon,
} from "@/components/ui/Component";
import {
  permissionColors,
  rolePermissionsDialogStyles,
} from "../card/styles";
import type { Role, RolePermissionsDialogProps } from "@/fe/pages/roles/types";
import { buildGroupedPermissions } from "@/fe/pages/roles/utils";

const RolePermissionsDialog: React.FC<RolePermissionsDialogProps> = ({
  open,
  onClose,
  role,
}) => {
  if (!role) return null;

  const groupedPermissions = buildGroupedPermissions(role);
  const modules = Object.keys(groupedPermissions);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth={true}
      fullScreen={false}
      PaperProps={{ sx: rolePermissionsDialogStyles.dialog }}
    >
      <DialogTitle sx={rolePermissionsDialogStyles.dialogTitle}>
        <Box sx={rolePermissionsDialogStyles.titleBox}>
          <SecurityIcon sx={rolePermissionsDialogStyles.securityIcon} />
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
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={rolePermissionsDialogStyles.dialogContent}>
        {modules.length === 0 ? (
          <Box sx={rolePermissionsDialogStyles.noPermissionsBox}>
            <SecurityIcon sx={rolePermissionsDialogStyles.noPermissionsIcon} />
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={rolePermissionsDialogStyles.noPermissionsTitle}
            >
              No Permissions Assigned
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={rolePermissionsDialogStyles.noPermissionsText}
            >
              This role does not have any permissions assigned yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {modules.map((module) => (
              <Grid item xs={12} sm={6} md={4} key={module}>
                <Paper
                  elevation={0}
                  sx={{ ...rolePermissionsDialogStyles.modulePaper, mt: 2 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={rolePermissionsDialogStyles.moduleTitle}
                  >
                    {module === "employee" ? "User" : module}
                  </Typography>
                  <Divider sx={rolePermissionsDialogStyles.moduleDivider} />
                  <Box
                    sx={{
                      ...rolePermissionsDialogStyles.moduleActions,
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
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
                      ),
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
