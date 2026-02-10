import React from 'react';
import { Person as MuiPerson } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface PersonProps extends SvgIconProps {}

const Person: React.FC<PersonProps> = (props) => {
  return <MuiPerson {...props} />;
};

export default Person;