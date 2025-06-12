import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import MyButton from "./MyButton";

interface AddRoleDialogProps {
  open: boolean;
  roleName: string;
  modulePerms: Record<string, Record<string, boolean>>;
  modules: string[];
  permissions: string[];
  onRoleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPermChange: (mod: string, perm: string, checked: boolean) => void;
  onClose: () => void;
  onAdd: () => void;
  canAdd: boolean;
}

const AddRoleDialog: React.FC<AddRoleDialogProps> = ({
  open,
  roleName,
  modulePerms,
  modules,
  permissions,
  onRoleNameChange,
  onPermChange,
  onClose,
  onAdd,
  canAdd,
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Add Role</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Role Name"
        fullWidth
        value={roleName}
        onChange={onRoleNameChange}
        sx={{ mb: 3 }}
      />
      <Box sx={{ mt: 1, minWidth: 350 }}>
        <Typography sx={{ fontWeight: 600, mb: 1, color: "#1a237e" }}>
          Module Permissions
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `140px repeat(${permissions.length}, 1fr)`,
            gap: 1,
            alignItems: "center",
            bgcolor: "#f5f7fa",
            borderRadius: 2,
            p: 2,
            boxShadow: 1,
          }}
        >
          <Box />
          {permissions.map((p) => (
            <Typography
              key={p}
              align="center"
              sx={{ fontWeight: 700, color: "#1976d2", fontSize: 15 }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Typography>
          ))}
          {modules.map((mod) => [
            <Typography
              key={mod}
              sx={{ fontWeight: 600, color: "#333", fontSize: 15 }}
            >
              {mod}
            </Typography>,
            ...permissions.map((perm) => (
              <Box key={mod + perm} sx={{ textAlign: "center" }}>
                <Checkbox
                  checked={modulePerms[mod][perm]}
                  onChange={(e) => onPermChange(mod, perm, e.target.checked)}
                  sx={{
                    color: "#1976d2",
                    "&.Mui-checked": { color: "#1976d2" },
                    p: 0.5,
                  }}
                />
              </Box>
            )),
          ])}
        </Box>
      </Box>
    </DialogContent>
    <DialogActions>
      <MyButton onClick={onClose} color="inherit">
        Cancel
      </MyButton>
      <MyButton onClick={onAdd} variant="contained" disabled={!canAdd}>
        Add
      </MyButton>
    </DialogActions>
  </Dialog>
);

export default AddRoleDialog;
