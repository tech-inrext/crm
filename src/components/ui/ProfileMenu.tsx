"use client";

import React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Logout, Person, Settings, SwapHoriz } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import RoleSelectionDialog from "@/components/ui/RoleSelectionDialog";

const ProfileMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { user, logout, switchRole, setChangeRole } = useAuth();
  const router = useRouter();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRoleSwitchClick = () => {
    setChangeRole(true);
    handleClose();
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

  const getCurrentRoleName = () => {
    return user?.roles.find((role) => role._id === user?.currentRole)?.name;
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
            <Typography color="text.secondary">{user.email}</Typography>
          </MenuItem>,
          <Divider key="divider-1" />,
        ]}
        <MenuItem onClick={handleClose} sx={{ py: 1 }}>
          <Person sx={{ mr: 2, fontSize: 20 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleRoleSwitchClick} sx={{ py: 1 }}>
          <SwapHoriz sx={{ mr: 2, fontSize: 20 }} />
          Switch Role ({getCurrentRoleName()})
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ py: 1 }}>
          <Settings sx={{ mr: 2, fontSize: 20 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1, color: "error.main" }}>
          <Logout sx={{ mr: 2, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
