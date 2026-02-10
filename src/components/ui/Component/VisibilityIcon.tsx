import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface VisibilityIconComponentProps extends SvgIconProps {}

const VisibilityIconComponent: React.FC<VisibilityIconComponentProps> = (props) => {
  return <VisibilityIcon {...props} />;
};

export default VisibilityIconComponent;