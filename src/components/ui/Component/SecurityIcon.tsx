import React from "react";
import Security from "@mui/icons-material/Security";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface SecurityIconComponentProps extends SvgIconProps {}

const SecurityIconComponent: React.FC<SecurityIconComponentProps> = ({
  ...props
}) => {
  return <Security {...props} />;
};

export default SecurityIconComponent;