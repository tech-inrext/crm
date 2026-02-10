import React from 'react';
import { Search as MuiSearch } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface SearchIconProps extends SvgIconProps {}

const SearchIcon: React.FC<SearchIconProps> = (props) => {
  return <MuiSearch {...props} />;
};

export default SearchIcon;