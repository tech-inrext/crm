// src/fe/pages/roles/components/dialog/RoleDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Typography,
  Box,
  Checkbox,
  Button
} from "@/components/ui/Component";
import ButtonComponent from "@/components/ui/Component/ButtonComponent";
import { capitalizeFriendly } from "@/fe/pages/roles/utils";
import type {
  Role,
  RoleFormData,
  RoleDialogProps,
} from "@/fe/pages/roles/types";
import { useRoleDialog } from "@/fe/pages/roles/hooks/useRoleDialog";
import {
  dialogPaperSx,
  dialogTitleSx,
  dialogContentSx,
  readonlyTextFieldSx,
  readonlyInputStyle,
  textFieldSx,
  inputStyle,
  modulePermsSectionSx,
  sectionTitleSx,
  permissionsContainerSx,
  headerRowSx,
  headerModuleLabelSx,
  headerPermLabelSx,
  moduleRowSx,
  moduleNameSx,
  checkboxCellSx,
  checkboxSx,
  specialAccessSectionSx,
  specialAccessTitleSx,
  specialAccessRowSx,
  specialAccessCheckboxSx,
  dialogActionsSx,
} from "./styles";

const RoleDialog: React.FC<RoleDialogProps> = ({
  open,
  role,
  onSubmit,
  onClose,
}) => {
  const {
    roleName,
    setRoleName,
    modulePerms,
    isSystemAdmin,
    setIsSystemAdmin,
    showTotalUsers,
    setShowTotalUsers,
    showTotalVendorsBilling,
    setShowTotalVendorsBilling,
    showCabBookingAnalytics,
    setShowCabBookingAnalytics,
    showScheduleThisWeek,
    setShowScheduleThisWeek,
    isAVP,
    setIsAVP,
    isClient,
    windowWidth,
    gridTemplateColumns,
    handlePermChange,
    handleSubmit,
    modules,
    permissions,
  } = useRoleDialog({ open, role, onSubmit });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isClient && windowWidth < 600}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle sx={dialogTitleSx}>
        {role ? "Edit Role" : "Add Role"}
      </DialogTitle>

      <DialogContent sx={dialogContentSx}>
        {role ? (
          <Tooltip title="Role name cannot be edited" placement="top">
            <div>
              <TextField
                autoFocus={false}
                margin="dense"
                label="Role Name"
                fullWidth
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                sx={readonlyTextFieldSx}
                inputProps={{ style: readonlyInputStyle, readOnly: true }}
              />
            </div>
          </Tooltip>
        ) : (
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            sx={textFieldSx}
            inputProps={{ style: inputStyle }}
          />
        )}

        <Box sx={modulePermsSectionSx}>
          <Typography sx={sectionTitleSx}>Module Permissions</Typography>

          <Box sx={permissionsContainerSx}>
            {/* Header row */}
            <Box sx={headerRowSx(gridTemplateColumns)}>
              <Box sx={headerModuleLabelSx}>Module</Box>
              {permissions.map((p) => (
                <Box key={p} sx={headerPermLabelSx}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Box>
              ))}
            </Box>

            {/* Module rows */}
            {modules.map((mod) => (
              <Box key={mod} sx={moduleRowSx(gridTemplateColumns)}>
                <Box sx={moduleNameSx}>{capitalizeFriendly(mod)}</Box>
                {permissions.map((perm) => (
                  <Box key={mod + perm} sx={checkboxCellSx}>
                    <Checkbox
                      checked={modulePerms[mod]?.[perm] ?? false}
                      onChange={(e) =>
                        handlePermChange(mod, perm, e.target.checked)
                      }
                      sx={checkboxSx}
                      size={isClient && windowWidth < 600 ? "small" : "medium"}
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Special Access */}
        <Box sx={specialAccessSectionSx}>
          <Typography sx={specialAccessTitleSx}>Special Access</Typography>

          {[
            {
              checked: isSystemAdmin,
              onChange: setIsSystemAdmin,
              label: "System Admin (grants selected special permissions)",
            },
            {
              checked: showTotalUsers,
              onChange: setShowTotalUsers,
              label: "Show Total Users",
            },
            {
              checked: showTotalVendorsBilling,
              onChange: setShowTotalVendorsBilling,
              label: "Total Vendors & Billing amount",
            },
            {
              checked: showCabBookingAnalytics,
              onChange: setShowCabBookingAnalytics,
              label: "Cab-Booking Analytics",
            },
            {
              checked: showScheduleThisWeek,
              onChange: setShowScheduleThisWeek,
              label: "Schedule In This Week",
            },
            {
              checked: isAVP,
              onChange: setIsAVP,
              label: "isAVP",
            },
          ].map(({ checked, onChange, label }) => (
            <Box key={label} sx={specialAccessRowSx}>
              <Checkbox
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                sx={specialAccessCheckboxSx}
              />
              <Typography>{label}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={dialogActionsSx}>
        <ButtonComponent onClick={onClose} color="inherit">
          Cancel
        </ButtonComponent>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!roleName.trim()}
        >
          {role ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleDialog;
