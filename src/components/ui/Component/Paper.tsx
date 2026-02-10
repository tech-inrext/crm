import React from "react";
import Paper, { PaperProps } from "@mui/material/Paper";

interface PaperComponentProps extends PaperProps {
  children?: React.ReactNode;
}

const PaperComponent: React.FC<PaperComponentProps> = ({
  children,
  ...props
}) => {
  return <Paper {...props}>{children}</Paper>;
};

export default PaperComponent;
