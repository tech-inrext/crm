import React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MyButton from "./MyButton";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import PermissionGuard from "../PermissionGuard";

interface RoleCardProps {
  role: { name: string; permissions: string[] };
  idx: number;
  isExpanded: boolean;
  isEditing: boolean;
  editRoleName: string;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditClick: (e: React.MouseEvent) => void;
  onExpand: () => void;
  modules: string[];
  permissions: string[];
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  idx,
  isExpanded,
  isEditing,
  editRoleName,
  onEditChange,
  onEditSave,
  onEditCancel,
  onEditClick,
  onExpand,
  modules,
  permissions,
}) => (
  <Paper
    elevation={3}
    sx={{
      width: "fit-content",
      minWidth: 0,
      maxWidth: 1,
      p: 2,
      borderRadius: 3,
      bgcolor: idx % 2 === 0 ? "#f5f7fa" : "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      position: "relative",
      cursor: isEditing ? "default" : "pointer",
      transition: "box-shadow 0.2s",
      boxShadow: isExpanded ? 6 : 2,
    }}
    onClick={() => {
      if (!isEditing) onExpand();
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      {isEditing ? (
        <TextField
          size="small"
          value={editRoleName}
          onChange={onEditChange}
          sx={{ width: 100, mr: 1, fontSize: 13 }}
          inputProps={{ style: { fontSize: 13 } }}
        />
      ) : (
        <Typography sx={{ fontWeight: 700, fontSize: 17, color: "#1a237e" }}>
          {role.name}
        </Typography>
      )}
      {isEditing ? (
        <>
          <MyButton
            size="small"
            variant="contained"
            sx={{ ml: 1 }}
            onClick={onEditSave}
          >
            Save
          </MyButton>
          <MyButton
            size="small"
            sx={{ ml: 1 }}
            color="inherit"
            onClick={onEditCancel}
          >
            Cancel
          </MyButton>{" "}
        </>
      ) : (
        <PermissionGuard module="role" action="write" hideWhenNoAccess>
          <MyButton
            size="small"
            variant="outlined"
            sx={{ ml: 2, minWidth: 36, p: 0 }}
            onClick={onEditClick}
          >
            <EditIcon sx={{ fontSize: 22, color: "#1976d2" }} />
          </MyButton>
        </PermissionGuard>
      )}
    </Box>
    {isExpanded && (
      <Box sx={{ mt: 2, width: "100%" }}>
        {modules.map((mod) => (
          <Box key={mod} sx={{ mb: 1 }}>
            <Typography
              sx={{ fontWeight: 600, fontSize: 14, color: "#1976d2", mb: 0.5 }}
            >
              {mod}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {permissions.filter((p) =>
                role.permissions.includes(`${mod}:${p}`)
              ).length === 0 ? (
                <span style={{ color: "#888", fontSize: 12 }}>-</span>
              ) : (
                permissions
                  .filter((p) => role.permissions.includes(`${mod}:${p}`))
                  .map((p) => {
                    const color =
                      p === "write"
                        ? "#1976d2"
                        : p === "delete"
                        ? "#d32f2f"
                        : "#388e3c";
                    const bg =
                      p === "write"
                        ? "#e3f2fd"
                        : p === "delete"
                        ? "#ffebee"
                        : "#e8f5e9";
                    return (
                      <Box
                        key={mod + p}
                        sx={{
                          display: "inline-block",
                          px: 1,
                          py: 0.5,
                          bgcolor: bg,
                          color: color,
                          borderRadius: 1,
                          fontSize: 12,
                          fontWeight: 500,
                          letterSpacing: 0.5,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Box>
                    );
                  })
              )}
            </Box>
          </Box>
        ))}
      </Box>
    )}
  </Paper>
);

export default RoleCard;
