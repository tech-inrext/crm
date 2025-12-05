import React from "react";
import SwapHoriz from "@mui/icons-material/SwapHoriz";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface SwapHorizIconComponentProps extends SvgIconProps {}

const SwapHorizIconComponent: React.FC<SwapHorizIconComponentProps> = ({
  ...props
}) => {
  return <SwapHoriz {...props} />;
};

export default SwapHorizIconComponent;