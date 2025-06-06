import React, { useEffect, useState, useCallback } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import rolesData from "../../data/roles.json";
import MyButton from "@/components/ui/MyButton";

interface RoleWithPermissions {
  name: string;
  permissions: string[];
}

const LOCAL_ROLES_KEY = "roles";
const LOCAL_ROLE_NAMES_KEY = "roleNames";

const getMergedRoles = (): RoleWithPermissions[] => {
  const saved =
    typeof window !== "undefined"
      ? localStorage.getItem(LOCAL_ROLES_KEY)
      : null;
  let merged: RoleWithPermissions[] = [];
  if (saved) {
    const localRoles = JSON.parse(saved) as RoleWithPermissions[];
    const map = new Map<string, RoleWithPermissions>();
    (rolesData as RoleWithPermissions[]).forEach((r) => map.set(r.name, r));
    localRoles.forEach((r) => map.set(r.name, r));
    merged = Array.from(map.values());
  } else {
    merged = rolesData as RoleWithPermissions[];
  }
  return merged;
};

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [input, setInput] = useState("");
  const [permissions, setPermissions] = useState<{
    read: boolean;
    write: boolean;
  }>({
    read: false,
    write: false,
  });
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editInput, setEditInput] = useState("");
  const [editPermissions, setEditPermissions] = useState<{
    read: boolean;
    write: boolean;
  }>({
    read: false,
    write: false,
  });

  // Load roles on mount
  useEffect(() => {
    setRoles(getMergedRoles());
  }, []);

  // Sync roles to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_ROLES_KEY, JSON.stringify(roles));
    const roleNames = roles.map((r) => r.name);
    localStorage.setItem(LOCAL_ROLE_NAMES_KEY, JSON.stringify(roleNames));
  }, [roles]);

  const handleAdd = useCallback(() => {
    const trimmed = input.trim();
    if (
      trimmed &&
      !roles.map((r) => r.name.toLowerCase()).includes(trimmed.toLowerCase()) &&
      (permissions.read || permissions.write)
    ) {
      setRoles([
        {
          name: trimmed,
          permissions: Object.entries(permissions)
            .filter(([, v]) => v)
            .map(([k]) => k),
        },
        ...roles,
      ]);
      setInput("");
      setPermissions({ read: false, write: false });
    }
  }, [input, permissions, roles]);

  const handleDelete = useCallback((name: string) => {
    setRoles((prev) => prev.filter((r) => r.name !== name));
  }, []);

  const openEdit = useCallback(
    (idx: number) => {
      setEditIdx(idx);
      setEditInput(roles[idx].name);
      setEditPermissions({
        read: roles[idx].permissions.includes("read"),
        write: roles[idx].permissions.includes("write"),
      });
    },
    [roles]
  );

  const handleEditSave = useCallback(() => {
    if (editIdx === null) return;
    const trimmed = editInput.trim();
    if (!trimmed || (!editPermissions.read && !editPermissions.write)) return;
    setRoles((prev) =>
      prev.map((r, i) =>
        i === editIdx
          ? {
              name: trimmed,
              permissions: Object.entries(editPermissions)
                .filter(([, v]) => v)
                .map(([k]) => k),
            }
          : r
      )
    );
    setEditIdx(null);
    setEditInput("");
    setEditPermissions({ read: false, write: false });
  }, [editIdx, editInput, editPermissions]);

  const handleEditCancel = useCallback(() => {
    setEditIdx(null);
    setEditInput("");
    setEditPermissions({ read: false, write: false });
  }, []);

  return (
    <Box sx={{ mt: 2, ml: 2, maxWidth: 400 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 2 }}>
        Add Roles
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          size="small"
          label="Role name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={permissions.read}
              onChange={(e) =>
                setPermissions((p) => ({ ...p, read: e.target.checked }))
              }
            />
          }
          label="Read"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={permissions.write}
              onChange={(e) =>
                setPermissions((p) => ({ ...p, write: e.target.checked }))
              }
            />
          }
          label="Write"
        />
        <MyButton
          variant="contained"
          onClick={handleAdd}
          sx={{
            bgcolor: "#fff",
            color: "#1a237e",
            "&:hover": { bgcolor: "#f0f0f0" },
          }}
        >
          Add
        </MyButton>
      </Box>
      <Paper
        variant="outlined"
        sx={{ p: 2, bgcolor: "#f5f7fa", boxShadow: 2, borderRadius: 2 }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {roles.length === 0 && (
            <ListItem>
              <ListItemText primary="No roles added yet." />
            </ListItem>
          )}
          {roles.map((role, idx) => (
            <Box key={role.name + String(idx)}>
              <ListItem
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  borderBottom: "none",
                  py: 2,
                  px: 2,
                  bgcolor: "#fff",
                  borderRadius: 2,
                  mb: 0,
                  boxShadow: 1,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 4, bgcolor: "#f0f4ff" },
                  minHeight: 100,
                }}
              >
                <Box sx={{ width: "100%" }}>
                  {editIdx === idx ? (
                    <>
                      <TextField
                        size="small"
                        label="Role name"
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        sx={{ mb: 1, width: "100%" }}
                      />
                      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={editPermissions.read}
                              onChange={(e) =>
                                setEditPermissions((p) => ({
                                  ...p,
                                  read: e.target.checked,
                                }))
                              }
                            />
                          }
                          label="Read"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={editPermissions.write}
                              onChange={(e) =>
                                setEditPermissions((p) => ({
                                  ...p,
                                  write: e.target.checked,
                                }))
                              }
                            />
                          }
                          label="Write"
                        />
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <MyButton
                          size="small"
                          variant="contained"
                          onClick={handleEditSave}
                        >
                          Save
                        </MyButton>
                        <MyButton
                          size="small"
                          onClick={handleEditCancel}
                          color="inherit"
                        >
                          Cancel
                        </MyButton>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "#1a237e",
                          letterSpacing: 0.2,
                        }}
                      >
                        {role.name}
                      </Typography>
                      {Array.isArray(role.permissions) &&
                        role.permissions.length > 0 && (
                          <Box
                            sx={{
                              mt: 0.5,
                              display: "flex",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            {role.permissions.map((p) => (
                              <Box
                                key={p}
                                sx={{
                                  display: "inline-block",
                                  px: 1.5,
                                  py: 0.5,
                                  bgcolor:
                                    p === "write" ? "#e3f2fd" : "#ede7f6",
                                  color: p === "write" ? "#1976d2" : "#5e35b1",
                                  borderRadius: 1,
                                  fontSize: 13,
                                  fontWeight: 500,
                                  letterSpacing: 0.5,
                                }}
                              >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                              </Box>
                            ))}
                          </Box>
                        )}
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <MyButton
                          size="small"
                          variant="outlined"
                          onClick={() => openEdit(idx)}
                        >
                          Edit
                        </MyButton>
                        <MyButton
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleDelete(role.name)}
                        >
                          Delete
                        </MyButton>
                      </Box>
                    </>
                  )}
                </Box>
              </ListItem>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Roles;
