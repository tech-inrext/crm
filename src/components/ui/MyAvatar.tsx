import React from 'react';
import Avatar from '@mui/material/Avatar';

interface MyAvatarProps {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  borderRadius?: number | string; // Use borderRadius instead of radius
}

const MyAvatar: React.FC<MyAvatarProps> = ({ src, alt, children, borderRadius }) => (
  <Avatar src={src} alt={alt} sx={borderRadius ? { borderRadius } : undefined}>
    {children}
  </Avatar>
);

export default MyAvatar;
