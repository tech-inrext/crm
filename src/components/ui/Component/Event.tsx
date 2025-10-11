import React from 'react';
import { Event as MuiEvent } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface EventProps extends SvgIconProps {}

const Event: React.FC<EventProps> = (props) => {
  return <MuiEvent {...props} />;
};

export default Event;