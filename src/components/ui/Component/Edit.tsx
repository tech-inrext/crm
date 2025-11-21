import React from 'react';
import { Edit as MuiEdit } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface EditProps extends SvgIconProps {}

const Edit: React.FC<EditProps> = (props) => {
  return <MuiEdit {...props} />;
};

export default Edit;