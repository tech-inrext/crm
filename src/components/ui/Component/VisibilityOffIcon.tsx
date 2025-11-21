import React from "react";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface VisibilityOffIconComponentProps extends SvgIconProps {}

const VisibilityOffIconComponent: React.FC<VisibilityOffIconComponentProps> = ({
  ...props
}) => {
  return <VisibilityOff {...props} />;
};

export default VisibilityOffIconComponent;