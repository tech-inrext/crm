import React from "react";
import Stack, { StackProps } from "@mui/material/Stack";

interface StackComponentProps extends StackProps {
  children?: React.ReactNode;
}

const StackComponent: React.FC<StackComponentProps> = ({
  children,
  ...props
}) => {
  return <Stack {...props}>{children}</Stack>;
};

export default StackComponent;
