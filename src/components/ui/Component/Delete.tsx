import React from 'react';
import { Delete as MuiDelete } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface DeleteProps extends SvgIconProps {}

const Delete: React.FC<DeleteProps> = (props) => {
  return <MuiDelete {...props} />;
};

export default Delete;