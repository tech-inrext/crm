import React from "react";
import Profile from "@/components/ui/profile/Profile";

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: {
    // Add proper user type based on your Profile component
    currentRole: string;
    photo: string;
    [key: string]: any;
  };
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ open, onClose, user }) => {
  return (
    <Profile 
      open={open} 
      onClose={onClose} 
      user={user}
    />
  );
};

export default ProfileDialog;