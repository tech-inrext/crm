import React from 'react';
import { FilterAlt as MuiFilterAlt } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface FilterAltIconProps extends SvgIconProps {}

const FilterAltIcon: React.FC<FilterAltIconProps> = (props) => {
  return <MuiFilterAlt {...props} />;
};

export default FilterAltIcon;