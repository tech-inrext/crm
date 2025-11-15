import React from 'react';
import { Settings as MuiSettings } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface SettingsIconProps extends SvgIconProps {}

const Settings: React.FC<SettingsIconProps> = (props) => {
  return <MuiSettings {...props} />;
};

export default Settings;