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
      let read = role.read;
      let write = role.write;
      let del = role.delete;
      // Fallback: if role.read/write/delete are undefined, parse from permissions array
      if (
        (!read || !write || !del) &&
        Array.isArray((role as any).permissions)
      ) {
        read = [];
        write = [];
        del = [];
        (role as any).permissions.forEach((perm: string) => {
          const [mod, action] = perm.split(":");
          if (action === "read") read.push(mod);
          if (action === "write") write.push(mod);
          if (action === "delete") del.push(mod);
        });
      }
      const perms = Object.fromEntries(
        modules.map((m) => [m, { read: false, write: false, delete: false }])
      );
      // Normalization map for backend module names to frontend
      const normalizeModule = (mod: string) => {
        const map: Record<string, string> = {
          users: "User",
          user: "User",
          employee: "User", // Add this mapping for backend 'employee' -> frontend 'User'
          leads: "Lead",
          lead: "Lead",
          roles: "Role",
          role: "Role",
          department: "Department",
          departments: "Department",
        };
        return map[mod.toLowerCase()] || mod;
      };
      // Normalize all module names to lowercase for mapping
      const moduleMap = Object.fromEntries(
        modules.map((m) => [m.toLowerCase(), m])
      );
      if (read)
        read.forEach((mod: string) => {
          const norm = normalizeModule(mod);
          const key = moduleMap[norm.toLowerCase()];
          if (key) perms[key].read = true;
        });
      if (write)
        write.forEach((mod: string) => {
          const norm = normalizeModule(mod);
          const key = moduleMap[norm.toLowerCase()];
          if (key) perms[key].write = true;
        });
      if (del)
        del.forEach((mod: string) => {
          const norm = normalizeModule(mod);
          const key = moduleMap[norm.toLowerCase()];
          if (key) perms[key].delete = true;
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
    if (str === "CabBooking") return "Cab Booking";
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
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={typeof window !== "undefined" && window.innerWidth < 600}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          m: 2,
          height: { xs: "80vh", sm: "auto" },
          maxHeight: { xs: "60vh", sm: "90vh" },
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
        },
      }}
    >
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
          p: { xs: 2.5, sm: 2 },
          overflowY: "auto",
          flex: 1,
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
              display: "flex",
              flexDirection: "column",
              gap: 1,
              bgcolor: "#f5f7fa",
              borderRadius: 2,
              p: { xs: 1, sm: 2 },
              boxShadow: 1,
              width: "100%",
              overflowX: "auto",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
              <Box
                sx={{
                  minWidth: 90,
                  fontWeight: 700,
                  color: "#1976d2",
                  fontSize: { xs: 13, sm: 15 },
                }}
              >
                Module
              </Box>
              {permissions.map((p) => (
                <Box
                  key={p}
                  sx={{
                    flex: 1,
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#1976d2",
                    fontSize: { xs: 13, sm: 15 },
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Box>
              ))}
            </Box>
            {modules.map((mod) => (
              <Box
                key={mod}
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  mb: 0.5,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    minWidth: 90,
                    fontWeight: 600,
                    color: "#333",
                    fontSize: { xs: 14, sm: 15 },
                  }}
                >
                  {capitalize(mod)}
                </Box>
                {permissions.map((perm) => (
                  <Box
                    key={mod + perm}
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
                      size={
                        typeof window !== "undefined" && window.innerWidth < 600
                          ? "small"
                          : "medium"
                      }
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: { xs: 1, sm: 2 },
          borderTop: "1px solid #e0e0e0",
          justifyContent: "flex-end",
        }}
      >
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
