import React from 'react';
import { Link as MuiLink } from '@mui/material';
import { LinkProps as MuiLinkProps } from '@mui/material/Link';

export interface LinkProps extends MuiLinkProps {}

const Link: React.FC<LinkProps> = (props) => {
  return <MuiLink {...props} />;
};

export default Link;