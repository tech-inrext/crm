import React from 'react';
import { ListItemAvatar as MuiListItemAvatar } from '@mui/material';
import { ListItemAvatarProps as MuiListItemAvatarProps } from '@mui/material/ListItemAvatar';

export interface ListItemAvatarProps extends MuiListItemAvatarProps {}

const ListItemAvatar: React.FC<ListItemAvatarProps> = (props) => {
  return <MuiListItemAvatar {...props} />;
};

export default ListItemAvatar;