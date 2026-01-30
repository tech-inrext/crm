import React from "react";
import Menu from "@/components/ui/Component/Menu";
import MenuItem from "@/components/ui/Component/MenuItem";
import Divider from "@/components/ui/Component/Divider";
import Typography from "@/components/ui/Component/Typography";
import Box from "@/components/ui/Component/Box";
import Avatar from "@/components/ui/Component/Avatar";
import {
  Logout,
  Person,
  Settings,
  SwapHoriz,
  LockReset,
} from "@/components/ui/Component";
import { User } from "@/contexts/AuthContext";

interface ProfileMenuContentProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  user: User;
  onClose: () => void;
  onProfileOpen: () => void;
  onRoleSwitch: () => void;
  onResetPassword: () => void;
  onLogout: () => void;
}

const ProfileMenuContent: React.FC<ProfileMenuContentProps> = ({
  anchorEl,
  open,
  user,
  onClose,
  onProfileOpen,
  onRoleSwitch,
  onResetPassword,
  onLogout,
}) => {
  const userPhoto = user.photo || "";
  const hasPhoto = userPhoto && userPhoto.trim() !== "";
  const userInitials = user.name?.charAt(0).toUpperCase() || "U";

  const getCurrentRoleName = () => {
    return user?.roles.find((role) => role._id === user?.currentRole)?.name;
  };

  return (
    <Menu
      id="profile-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
      <MenuItem
        key="user-info"
        sx={{
          py: 1.5,
          flexDirection: "column",
          alignItems: "flex-start",
          cursor: "default",
          "&:hover": { backgroundColor: "transparent" },
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          {hasPhoto ? (
            <Avatar
              src={userPhoto}
              alt={user.name}
              sx={{
                width: 40,
                height: 40,
                border: "2px solid #1976d2",
                "& img": {
                  objectFit: "cover",
                  objectPosition: "top",
                },
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#1976d2",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {userInitials}
            </Avatar>
          )}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: "#000" }}
            >
              {user.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
      </MenuItem>
      
      <Divider key="divider-1" />
      
      <MenuItem onClick={onProfileOpen} sx={{ py: 1 }}>
        <Person sx={{ mr: 2, fontSize: 20 }} />
        Profile
      </MenuItem>
      
      <MenuItem onClick={onRoleSwitch} sx={{ py: 1 }}>
        <SwapHoriz sx={{ mr: 2, fontSize: 20 }} />
        Switch Role ({getCurrentRoleName()})
      </MenuItem>
      
      <MenuItem onClick={onResetPassword} sx={{ py: 1 }}>
        <LockReset sx={{ mr: 2, fontSize: 20 }} />
        Reset Password
      </MenuItem>
      
      <MenuItem onClick={onClose} sx={{ py: 1 }}>
        <Settings sx={{ mr: 2, fontSize: 20 }} />
        Settings
      </MenuItem>
      
      <Divider />
      
      <MenuItem onClick={onLogout} sx={{ py: 1, color: "error.main" }}>
        <Logout sx={{ mr: 2, fontSize: 20 }} />
        Logout
      </MenuItem>
    </Menu>
  );
};

export default ProfileMenuContent;