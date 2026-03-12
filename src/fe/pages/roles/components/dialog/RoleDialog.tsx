// src/fe/pages/roles/components/dialog/RoleDialog.tsx
import React, { useState, useEffect } from "react";
import Dialog from "@/components/ui/Component/Dialog";
import DialogTitle from "@/components/ui/Component/DialogTitle";
import DialogContent from "@/components/ui/Component/DialogContent";
import DialogActions from "@/components/ui/Component/DialogActions";
import TextField from "@/components/ui/Component/TextField";
import Tooltip from "@/components/ui/Component/Tooltip";
import Typography from "@/components/ui/Component/Typography";
import Box from "@/components/ui/Component/Box";
import Checkbox from "@/components/ui/Component/Checkbox";
import ButtonComponent from "@/components/ui/Component/ButtonComponent";
import {
  ROLE_MODULES,
  ROLE_PERMISSIONS,
} from "@/fe/pages/roles/constants/roles";
import {
  parseRoleToModulePerms,
  capitalizeFriendly,
} from "@/fe/pages/roles/utils";
import type { Role, RoleFormData } from "@/fe/pages/roles/types";

const modules = [...ROLE_MODULES];
const permissions = [...ROLE_PERMISSIONS];

interface RoleDialogProps {
  open: boolean;
  role?: Role | null;
  onSubmit: (data: RoleFormData) => void;
  onClose: () => void;
}

const RoleDialog: React.FC<RoleDialogProps> = ({
  open,
  role,
  onSubmit,
  onClose,
}) => {
  const [roleName, setRoleName] = useState("");
  const [modulePerms, setModulePerms] = useState(() =>
    Object.fromEntries(
      modules.map((m) => [m, { read: false, write: false, delete: false }]),
    ),
  );
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [showTotalUsers, setShowTotalUsers] = useState(false);
  const [showTotalVendorsBilling, setShowTotalVendorsBilling] = useState(false);
  const [showCabBookingAnalytics, setShowCabBookingAnalytics] = useState(false);
  const [showScheduleThisWeek, setShowScheduleThisWeek] = useState(false);
  const [isAVP, setIsAVP] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const coerceBool = (val: any): boolean =>
    typeof val === "string" ? val.toLowerCase() === "true" : Boolean(val);

  useEffect(() => {
    if (!open) return;

    if (role) {
      setRoleName(role.name || "");
      setIsSystemAdmin(coerceBool(role.isSystemAdmin));
      setShowTotalUsers(coerceBool(role.showTotalUsers));
      setShowTotalVendorsBilling(coerceBool(role.showTotalVendorsBilling));
      setShowCabBookingAnalytics(coerceBool(role.showCabBookingAnalytics));
      setShowScheduleThisWeek(coerceBool(role.showScheduleThisWeek));
      setIsAVP(coerceBool(role.isAVP));
      setModulePerms(parseRoleToModulePerms(role, modules));
    } else {
      setRoleName("");
      setIsSystemAdmin(false);
      setShowTotalUsers(false);
      setShowTotalVendorsBilling(false);
      setShowCabBookingAnalytics(false);
      setShowScheduleThisWeek(false);
      setIsAVP(false);
      setModulePerms(
        Object.fromEntries(
          modules.map((m) => [m, { read: false, write: false, delete: false }]),
        ),
      );
    }
  }, [open, role]);

  const gridTemplateColumns = `minmax(90px, 170px) repeat(${permissions.length}, 1fr)`;

  const handlePermChange = (mod: string, perm: string, checked: boolean) => {
    setModulePerms((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [perm]: checked },
    }));
  };

  const handleSubmit = () => {
    if (!roleName.trim()) return;
    onSubmit({
      name: roleName,
      modulePerms,
      editId: role?._id,
      isSystemAdmin,
      showTotalUsers,
      showTotalVendorsBilling,
      showCabBookingAnalytics,
      showScheduleThisWeek,
      isAVP,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isClient && windowWidth < 600}
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

      <DialogContent sx={{ p: { xs: 2.5, sm: 2 }, overflowY: "auto", flex: 1 }}>
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
                sx={{
                  mb: 2,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  "& .MuiInputBase-root": {
                    bgcolor: "#f5f5f5",
                    cursor: "not-allowed",
                  },
                }}
                inputProps={{
                  style: { fontSize: "1rem", cursor: "not-allowed" },
                  readOnly: true,
                }}
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
            sx={{ mb: 2, fontSize: { xs: "0.95rem", sm: "1rem" } }}
            inputProps={{ style: { fontSize: "1rem" } }}
          />
        )}

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
            {/* Header row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns,
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <Box
                sx={{
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
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#1976d2",
                    fontSize: { xs: 13, sm: 15 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Box>
              ))}
            </Box>

            {/* Module rows */}
            {modules.map((mod) => (
              <Box
                key={mod}
                sx={{
                  display: "grid",
                  gridTemplateColumns,
                  alignItems: "center",
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Box
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    fontSize: { xs: 14, sm: 15 },
                  }}
                >
                  {capitalizeFriendly(mod)}
                </Box>
                {permissions.map((perm) => (
                  <Box
                    key={mod + perm}
                    sx={{
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Checkbox
                      checked={modulePerms[mod]?.[perm] ?? false}
                      onChange={(e) =>
                        handlePermChange(mod, perm, e.target.checked)
                      }
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": { color: "#1976d2" },
                        p: 0.5,
                      }}
                      size={isClient && windowWidth < 600 ? "small" : "medium"}
                    />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Special Access */}
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 600, mb: 1, color: "#1a237e" }}>
            Special Access
          </Typography>

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
            <Box
              key={label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                mt: 1,
              }}
            >
              <Checkbox
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
              />
              <Typography>{label}</Typography>
            </Box>
          ))}
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

export default RoleDialog;
