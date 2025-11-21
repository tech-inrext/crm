import React from 'react';
import { Badge as MuiBadge } from '@mui/material';
import { BadgeProps as MuiBadgeProps } from '@mui/material/Badge';

export interface BadgeProps extends MuiBadgeProps {}

const Badge: React.FC<BadgeProps> = (props) => {
  return <MuiBadge {...props} />;
};

export default Badge;