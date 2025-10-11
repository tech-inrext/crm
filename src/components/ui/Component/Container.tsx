import React from 'react';
import { Container as MuiContainer } from '@mui/material';
import { ContainerProps as MuiContainerProps } from '@mui/material/Container';

export interface ContainerProps extends MuiContainerProps {}

const Container: React.FC<ContainerProps> = (props) => {
  return <MuiContainer {...props} />;
};

export default Container;