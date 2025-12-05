import React from "react";
import Fab, { FabProps } from "@mui/material/Fab";

interface FabComponentProps extends FabProps {
  children?: React.ReactNode;
}

const FabComponent: React.FC<FabComponentProps> = ({
  children,
  ...props
}) => {
  return <Fab {...props}>{children}</Fab>;
};

export default FabComponent;