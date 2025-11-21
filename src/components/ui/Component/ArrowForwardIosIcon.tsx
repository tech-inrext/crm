import React from "react";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface ArrowForwardIosIconComponentProps extends SvgIconProps {}

const ArrowForwardIosIconComponent: React.FC<ArrowForwardIosIconComponentProps> = (props) => {
  return <ArrowForwardIosIcon {...props} />;
};

export default ArrowForwardIosIconComponent;
