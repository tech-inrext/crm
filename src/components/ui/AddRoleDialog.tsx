import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import ButtonComponent from "./Button";

interface AddRoleDialogProps {
  open: boolean;
  role?: {
    name: string;
    read?: string[];
    write?: string[];
    delete?: string[];
    _id?: string;
  } | null;
  modules: string[];
  permissions: string[];
  onSubmit: (data: {
    name: string;
    modulePerms: Record<string, Record<string, boolean>>;
    editId?: string;
  }) => void;
  onClose: () => void;
}

const AddRoleDialog: React.FC<AddRoleDialogProps> = ({
  open,
  role,
  modules,
  permissions,
  onSubmit,
  onClose,
}) => {
  const [roleName, setRoleName] = useState("");
  const [modulePerms, setModulePerms] = useState(
    Object.fromEntries(
      modules.map((m) => [m, { read: false, write: false, delete: false }])
    )
  );
  useEffect(() => {
    if (role) {
      setRoleName(role.name || "");
      const perms = Object.fromEntries(
        modules.map((m) => [m, { read: false, write: false, delete: false }])
      );
      if (role.read)
        role.read.forEach((mod) => {
          if (perms[capitalize(mod)]) perms[capitalize(mod)].read = true;
        });
      if (role.write)
        role.write.forEach((mod) => {
          if (perms[capitalize(mod)]) perms[capitalize(mod)].write = true;
        });
      if (role.delete)
        role.delete.forEach((mod) => {
          if (perms[capitalize(mod)]) perms[capitalize(mod)].delete = true;
        });
      setModulePerms(perms);
    } else {
      setRoleName("");
      setModulePerms(
        Object.fromEntries(
          modules.map((m) => [m, { read: false, write: false, delete: false }])
        )
      );
    }
  }, [role, modules]);

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const handlePermChange = (mod: string, perm: string, checked: boolean) => {
    setModulePerms((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [perm]: checked },
    }));
  };

  const handleSubmit = () => {
    if (!roleName.trim()) return;
    onSubmit({ name: roleName, modulePerms, editId: role?._id });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          p: { xs: 1.5, sm: 2 },
        }}
      >
        {role ? "Edit Role" : "Add Role"}
      </DialogTitle>
      <DialogContent
        sx={{
          p: { xs: 1.5, sm: 3 },
          minWidth: { xs: "auto", sm: 350 },
          width: { xs: "100vw", sm: "auto" },
          maxWidth: { xs: "100vw", sm: 500 },
          boxSizing: "border-box",
        }}
      >
        <TextField
          autoFocus
          margin="dense"
          label="Role Name"
          fullWidth
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          sx={{ mb: 2, fontSize: { xs: "0.95rem", sm: "1rem" } }}
          inputProps={{ style: { fontSize: "1rem" } }}
        />
        <Box sx={{ mt: 1 }}>
          <Typography
            sx={{
              fontWeight: 600,
              mb: 1,
              color: "#1a237e",
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            Module Permissions
          </Typography>
          <Box
            sx={{
              display: { xs: "block", sm: "grid" },
              gridTemplateColumns: {
                sm: `140px repeat(${permissions.length}, 1fr)`,
              },
              gap: 1,
              alignItems: "center",
              bgcolor: "#f5f7fa",
              borderRadius: 2,
              p: { xs: 1, sm: 2 },
              boxShadow: 1,
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "block" } }} />
            {permissions.map((p) => (
              <Typography
                key={p}
                align="center"
                sx={{
                  fontWeight: 700,
                  color: "#1976d2",
                  fontSize: { xs: 13, sm: 15 },
                  display: { xs: "none", sm: "block" },
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Typography>
            ))}
            {modules.map((mod) => (
              <Box
                key={mod}
                sx={{
                  mb: { xs: 1.5, sm: 0 },
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    fontSize: { xs: 14, sm: 15 },
                    minWidth: 90,
                    mb: { xs: 0.5, sm: 0 },
                  }}
                >
                  {mod}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    ml: { xs: 0, sm: 2 },
                  }}
                >
                  {permissions.map((perm) => (
                    <Box
                      key={mod + perm}
                      sx={{
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Checkbox
                        checked={modulePerms[mod][perm]}
                        onChange={(e) =>
                          handlePermChange(mod, perm, e.target.checked)
                        }
                        sx={{
                          color: "#1976d2",
                          "&.Mui-checked": { color: "#1976d2" },
                          p: 0.5,
                        }}
                        size={window.innerWidth < 600 ? "small" : "medium"}
                      />
                      <Typography
                        sx={{
                          display: { xs: "inline", sm: "none" },
                          fontSize: 12,
                          ml: 0.5,
                        }}
                      >
                        {perm.charAt(0).toUpperCase() + perm.slice(1)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
        <ButtonComponent onClick={onClose} color="inherit">
          Cancel
        </ButtonComponent>
        <ButtonComponent
          onClick={handleSubmit}
          variant="contained"
          disabled={!roleName.trim()}
        >
          {role ? "Save" : "Add"}
        </ButtonComponent>
      </DialogActions>
    </Dialog>
  );
};

export default AddRoleDialog;
