import React from 'react';
import { PersonAdd as MuiPersonAdd } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface PersonAddProps extends SvgIconProps {}

const PersonAdd: React.FC<PersonAddProps> = (props) => {
  return <MuiPersonAdd {...props} />;
};

export default PersonAdd;