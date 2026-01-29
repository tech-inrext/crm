import React from "react";
import { Pin as MuiPin } from "@mui/icons-material";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface PinIconComponentProps extends SvgIconProps {}

const PinIconComponent: React.FC<PinIconComponentProps> = ({ ...props }) => {
  return <MuiPin {...props} />;
};

export default PinIconComponent;
