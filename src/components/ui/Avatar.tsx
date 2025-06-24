import React from "react";
import Avatar from "@mui/material/Avatar";
import { SxProps, Theme } from "@mui/material/styles";

interface AvatarProps {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  borderRadius?: number | string;
  sx?: SxProps<Theme>;
}

const AvatarComponent: React.FC<AvatarProps> = ({
  src,
  alt,
  children,
  borderRadius,
  sx,
}) => (
  <Avatar
    src={src}
    alt={alt}
    sx={{
      ...(borderRadius ? { borderRadius } : {}),
      ...sx,
    }}
  >
    {children}
  </Avatar>
);

export default AvatarComponent;
