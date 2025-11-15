import React from "react";
import Close from "@mui/icons-material/Close";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface CloseIconComponentProps extends SvgIconProps {}

const CloseIconComponent: React.FC<CloseIconComponentProps> = ({
  ...props
}) => {
  return <Close {...props} />;
};

export default CloseIconComponent;