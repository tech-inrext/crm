import React from 'react';
import { People as MuiPeople } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface PeopleProps extends SvgIconProps {}

const People: React.FC<PeopleProps> = (props) => {
  return <MuiPeople {...props} />;
};

export default People;