import React from 'react';
import { LocationOn as MuiLocationOn } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface LocationOnProps extends SvgIconProps {}

const LocationOn: React.FC<LocationOnProps> = (props) => {
  return <MuiLocationOn {...props} />;
};

export default LocationOn;