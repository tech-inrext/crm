import React from "react";
import IconButton from "@/components/ui/Component/IconButton";
import Avatar from "@/components/ui/Component/Avatar";

interface UserAvatarProps {
  user: {
    photo?: string;
    name?: string;
  };
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  ariaLabel: string;
  ariaControls?: string;
  ariaExpanded?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  onClick,
  ariaLabel,
  ariaControls,
  ariaExpanded,
}) => {
  const userPhoto = user.photo || "";
  const hasPhoto = userPhoto && userPhoto.trim() !== "";
  const userInitials = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <IconButton
      onClick={onClick}
      sx={{ ml: 1 }}
      aria-label={ariaLabel}
      aria-controls={ariaControls}
      aria-haspopup="true"
      aria-expanded={ariaExpanded}
    >
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
            border: "2px solid #1976d2",
          }}
        >
          {userInitials}
        </Avatar>
      )}
    </IconButton>
  );
};

export default UserAvatar;