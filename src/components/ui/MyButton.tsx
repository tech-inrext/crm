import React, { ReactNode } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';

// Custom Button wrapper for easy migration
interface MyButtonProps extends ButtonProps {
  children?: ReactNode;
}

const MyButton: React.FC<MyButtonProps> = ({ children, ...props }) => {
  return <Button {...props}>{children}</Button>;
};

export default MyButton;
