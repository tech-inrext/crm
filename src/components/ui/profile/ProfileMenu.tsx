// src/components/ui/profile/Profile.tsx
"use client";

import React from "react";
import IconButton from "@/components/ui/Component/IconButton";
import Menu from "@/components/ui/Component/Menu";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProfileDialog from "./ProfileDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";
import ProfileMenuContent from "./ProfileMenuContent";
import UserAvatar from "./UserAvatar";

const ProfileMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const open = Boolean(anchorEl);
  const { user, logout, setChangeRole } = useAuth();
  const router = useRouter();

  if (!user) return null;

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

  const handleProfileOpen = () => {
    handleClose();
    setTimeout(() => setProfileOpen(true), 150);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
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

  const handleResetPassword = () => {
    setResetPasswordOpen(true);
    handleClose();
  };

  const handleCloseResetPassword = () => {
    setResetPasswordOpen(false);
  };

  return (
    <>
      <UserAvatar
        user={user}
        onClick={handleMenu}
        ariaLabel="profile menu"
        ariaControls={open ? "profile-menu" : undefined}
        ariaExpanded={open ? "true" : undefined}
      />
      
      <ProfileMenuContent
        anchorEl={anchorEl}
        open={open}
        user={user}
        onClose={handleClose}
        onProfileOpen={handleProfileOpen}
        onRoleSwitch={handleRoleSwitchClick}
        onResetPassword={handleResetPassword}
        onLogout={handleLogout}
      />

      <ResetPasswordDialog
        open={resetPasswordOpen}
        onClose={handleCloseResetPassword}
        userEmail={user.email}
      />

      <ProfileDialog
        open={profileOpen}
        onClose={handleProfileClose}
        user={{
          ...user,
          currentRole: typeof user?.currentRole === 'string' 
            ? user.currentRole 
            : user?.currentRole?._id || '',
          photo: user?.photo || '',
        }}
      />
    </>
  );
};

export default ProfileMenu;
