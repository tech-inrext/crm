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
    isSystemAdmin?: boolean;
    showTotalUsers?: boolean;
    showTotalVendorsBilling?: boolean;
    showCabBookingAnalytics?: boolean;
    showScheduleThisWeek?: boolean;
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
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [showTotalUsers, setShowTotalUsers] = useState(false);
  const [showTotalVendorsBilling, setShowTotalVendorsBilling] = useState(false);
  const [showCabBookingAnalytics, setShowCabBookingAnalytics] = useState(false);
  const [showScheduleThisWeek, setShowScheduleThisWeek] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200); // Default width for SSR
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (open) {
      if (role) {
        console.log("Role data received in AddRoleDialog:", role);
        console.log(
          "Raw showTotalUsers value:",
          (role as any).showTotalUsers,
          "Type:",
          typeof (role as any).showTotalUsers
        );
        setRoleName(role.name || "");
        // Coerce boolean or string values correctly ('false' should be false)
        const sysVal = (role as any).isSystemAdmin;
        setIsSystemAdmin(
          typeof sysVal === "string"
            ? sysVal.toLowerCase() === "true"
            : Boolean(sysVal)
        );
        console.log("Setting showTotalUsers to:", (role as any).showTotalUsers);
        setShowTotalUsers(
          typeof (role as any).showTotalUsers === "string"
            ? (role as any).showTotalUsers.toLowerCase() === "true"
            : Boolean((role as any).showTotalUsers)
        );
        console.log(
          "Setting showTotalVendorsBilling to:",
          (role as any).showTotalVendorsBilling
        );
        setShowTotalVendorsBilling(
          typeof (role as any).showTotalVendorsBilling === "string"
            ? (role as any).showTotalVendorsBilling.toLowerCase() === "true"
            : Boolean((role as any).showTotalVendorsBilling)
        );
        console.log(
          "Setting showCabBookingAnalytics to:",
          (role as any).showCabBookingAnalytics
        );
        setShowCabBookingAnalytics(
          typeof (role as any).showCabBookingAnalytics === "string"
            ? (role as any).showCabBookingAnalytics.toLowerCase() === "true"
            : Boolean((role as any).showCabBookingAnalytics)
        );
        console.log(
          "Setting showScheduleThisWeek to:",
          (role as any).showScheduleThisWeek
        );
        setShowScheduleThisWeek(
          typeof (role as any).showScheduleThisWeek === "string"
            ? (role as any).showScheduleThisWeek.toLowerCase() === "true"
            : Boolean((role as any).showScheduleThisWeek)
        );
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
        // Normalization map for frontend to backend module names
        const normalizeModule = (mod: string) => {
          const map: Record<string, string> = {
            users: "users",
            user: "employee", // backend expects 'employee'
            employee: "employee",
            leads: "lead",
            lead: "lead",
            roles: "role",
            role: "role",
            department: "department",
            departments: "department",
            cabbooking: "cab-booking",
            cabBooking: "cab-booking",
            "cab-booking": "cab-booking",
            vendors: "vendor",
            vendor: "vendor",
            cabvendor: "cab-vendor",
            cabVendor: "cab-vendor",
            "cab-vendor": "cab-vendor",
            branch: "branch",
            branches: "branch",
            team: "team",
            teams: "team",
            bookinglogin: "booking-login",
            "booking-login": "booking-login",
            trainingvideos: "training-videos",
            "training-videos": "training-videos",
            property: "property",
            properties: "property",
            property: "property",
            pillar: "pillar",
            pillars: "pillar",
          };
          // Always map UI-friendly labels for cab vendors to 'cab-vendor' (backend)
          if (
            mod === "CabVendor" ||
            mod === "Vendor booking" ||
            mod.toLowerCase() === "vendor booking"
          )
            return "cab-vendor";
          // Map Team UI labels to backend 'team'
          if (mod === "Team" || mod === "Teams" || mod.toLowerCase() === "team")
            return "team";
          // Map BookingLogin UI labels to backend 'booking-login'
          if (mod === "BookingLogin" || mod.toLowerCase() === "bookinglogin")
            return "booking-login";
          // Map TrainingVideos UI labels to backend 'training-videos'
          if (
            mod === "TrainingVideos" ||
            mod.toLowerCase() === "trainingvideos"
          )
            return "training-videos";
          // Map Property UI labels to backend 'property'
          if (mod === "Property" || mod.toLowerCase() === "property")
            return "property";
          // Map Pillar UI labels to backend 'pillar'
          if (mod === "Pillar" || mod.toLowerCase() === "pillar")
            return "pillar";

          return map[mod.toLowerCase()] || mod.toLowerCase();
        };
        // Normalize all module names to backend format for mapping
        const moduleMap = Object.fromEntries(
          modules.map((m) => [normalizeModule(m), m])
        );
        if (read)
          read.forEach((mod: string) => {
            const norm = normalizeModule(mod);
            const key = moduleMap[norm];
            if (key) perms[key].read = true;
          });
        if (write)
          write.forEach((mod: string) => {
            const norm = normalizeModule(mod);
            const key = moduleMap[norm];
            if (key) perms[key].write = true;
          });
        if (del)
          del.forEach((mod: string) => {
            const norm = normalizeModule(mod);
            const key = moduleMap[norm];
            if (key) perms[key].delete = true;
          });
        setModulePerms(perms);
      } else {
        setRoleName("");
        setIsSystemAdmin(false);
        setShowTotalUsers(false);
        setShowTotalVendorsBilling(false);
        setShowCabBookingAnalytics(false);
        setShowScheduleThisWeek(false);
        setModulePerms(
          Object.fromEntries(
            modules.map((m) => [
              m,
              { read: false, write: false, delete: false },
            ])
          )
        );
      }
    }
  }, [open, role, modules]);

  function capitalize(str: string) {
    if (str === "CabBooking") return "Cab Booking";
    // Show friendly UI label for CabVendor without changing backend mapping
    if (
      str === "CabVendor" ||
      str === "cab-vendor" ||
      str.toLowerCase() === "cabvendor"
    )
      return "Vendor booking";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // grid template for module rows + permission columns so checkboxes align
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
      <DialogContent
        sx={{
          p: { xs: 2.5, sm: 2 },
          overflowY: "auto",
          flex: 1,
        }}
      >
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
                  // ensure visual disabled look
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
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: gridTemplateColumns,
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
            {modules.map((mod) => (
              <Box
                key={mod}
                sx={{
                  display: "grid",
                  gridTemplateColumns: gridTemplateColumns,
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
                  {capitalize(mod)}
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
                      checked={modulePerms[mod][perm]}
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
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 600, mb: 1, color: "#1a237e" }}>
            Special Access
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Checkbox
              checked={isSystemAdmin}
              onChange={(e) => setIsSystemAdmin(e.target.checked)}
              sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
            />
            <Typography>
              System Admin (grants selected special permissions)
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <Checkbox
              checked={showTotalUsers}
              onChange={(e) => setShowTotalUsers(e.target.checked)}
              sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
            />
            <Typography>Show Total Users</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <Checkbox
              checked={showTotalVendorsBilling}
              onChange={(e) => setShowTotalVendorsBilling(e.target.checked)}
              sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
            />
            <Typography>Total Vendors & Billing amount</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <Checkbox
              checked={showCabBookingAnalytics}
              onChange={(e) => setShowCabBookingAnalytics(e.target.checked)}
              sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
            />
            <Typography>Cab-Booking Analytics</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <Checkbox
              checked={showScheduleThisWeek}
              onChange={(e) => setShowScheduleThisWeek(e.target.checked)}
              sx={{ color: "#1976d2", "&.Mui-checked": { color: "#1976d2" } }}
            />
            <Typography>Schedule In This Week</Typography>
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
