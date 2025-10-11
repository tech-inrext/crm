import React from 'react';
import { History as MuiHistory } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface HistoryProps extends SvgIconProps {}

const History: React.FC<HistoryProps> = (props) => {
  return <MuiHistory {...props} />;
};

export default History;