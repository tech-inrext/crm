import React from 'react';
import { Search as MuiSearch } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface SearchProps extends SvgIconProps {}

const Search: React.FC<SearchProps> = (props) => {
  return <MuiSearch {...props} />;
};

export default Search;