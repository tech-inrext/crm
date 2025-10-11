import React from "react";
import Typography, { TypographyProps } from "@mui/material/Typography";

interface TypographyComponentProps extends TypographyProps {
  children?: React.ReactNode;
}

const TypographyComponent: React.FC<TypographyComponentProps> = ({
  children,
  ...props
}) => {
  return <Typography {...props}>{children}</Typography>;
};

export default TypographyComponent;