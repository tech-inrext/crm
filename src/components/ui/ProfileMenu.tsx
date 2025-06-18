"use client";

import React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Logout, Person, Settings, SwapHoriz } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionsContext";
import { useRouter } from "next/navigation";
import RoleSelectionDialog from "./RoleSelectionDialog";

const ProfileMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const open = Boolean(anchorEl);
  const { user, logout, switchRole } = useAuth();
  const { refreshPermissions } = usePermissions();
  const router = useRouter(); // Debug logging
  React.useEffect(() => {
    console.log("=== ProfileMenu Debug ===");
    console.log("Current user:", user);
    console.log("User roles:", user?.roles);
    console.log("User currentRole:", user?.currentRole);

    const getAvailableRoleNames = () => {
      if (!user?.roles) return 0;
      return user.roles.length;
    };

    console.log("Has multiple roles:", getAvailableRoleNames() > 1);
    console.log("Roles length:", getAvailableRoleNames());
    console.log("Switch role condition check:", getAvailableRoleNames() > 1);
  }, [user]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRoleSwitchClick = () => {
    setRoleDialogOpen(true);
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleMenu}
        sx={{ ml: 1 }}
        aria-label="profile menu"
        aria-controls={open ? "profile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <AccountCircle fontSize="large" />
      </IconButton>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "profile-menu" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          "& .MuiPaper-root": {
            minWidth: 200,
            mt: 1,
            borderRadius: 2,
          },
        }}
      >
        {user && [
          <MenuItem
            key="user-info"
            disabled
            sx={{ py: 1, flexDirection: "column", alignItems: "flex-start" }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </MenuItem>,
          <Divider key="divider-1" />,
        ]}{" "}
        <MenuItem onClick={handleClose} sx={{ py: 1 }}>
          <Person sx={{ mr: 2, fontSize: 20 }} />
          Profile
        </MenuItem>{" "}
        {(() => {
          const getAvailableRoleNames = () => {
            if (!user?.roles) return 0;
            return user.roles.length;
          };
          const getCurrentRoleName = () => {
            if (user?.currentRole) {
              return user.currentRole.name;
            }
            return "Unknown";
          };

          return (
            getAvailableRoleNames() > 1 && (
              <MenuItem onClick={handleRoleSwitchClick} sx={{ py: 1 }}>
                <SwapHoriz sx={{ mr: 2, fontSize: 20 }} />
                Switch Role ({getCurrentRoleName()})
              </MenuItem>
            )
          );
        })()}
        <MenuItem onClick={handleClose} sx={{ py: 1 }}>
          <Settings sx={{ mr: 2, fontSize: 20 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1, color: "error.main" }}>
          <Logout sx={{ mr: 2, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>{" "}
      {/* Role Selection Dialog */}
      <RoleSelectionDialog
        open={roleDialogOpen}
        userRoles={(() => {
          if (!user?.roles) return [];
          return user.roles.map((role) => role.name);
        })()}
        currentRole={(() => {
          if (user?.currentRole) {
            return user.currentRole.name;
          }
          return undefined;
        })()}
        onRoleSelect={async (roleName) => {
          try {
            console.log("🔄 Attempting to switch role to:", roleName);
            console.log("🔄 Current user before switch:", user); // Find the role ID from the role name
            const getRoleId = (name: string) => {
              if (!user?.roles) return name;
              const role = user.roles.find((r) => r.name === name);
              return role ? role._id : name;
            };

            const roleId = getRoleId(roleName);
            await switchRole(roleId);
            console.log("✅ Role switch successful");

            // Refresh permissions immediately after successful role switch
            console.log("🔄 Refreshing permissions for new role...");
            await refreshPermissions();
            console.log("✅ Permissions refreshed");

            setRoleDialogOpen(false);

            // Wait a bit before reloading to ensure the backend update is complete
            setTimeout(() => {
              console.log("🔄 Reloading page to apply new permissions");
              window.location.reload();
            }, 500);
          } catch (error) {
            console.error("❌ Failed to switch role:", error);
            console.error("❌ Error details:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });

            // Don't close dialog on error so user can try again
            alert(
              `Failed to switch role: ${
                error.response?.data?.message || error.message
              }`
            );
          }
        }}
        onClose={() => setRoleDialogOpen(false)}
        userName={user?.name}
      />
    </>
  );
};

export default ProfileMenu;
