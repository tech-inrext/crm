import React from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface ArrowBackIosNewIconComponentProps extends SvgIconProps {}

const ArrowBackIosNewIconComponent: React.FC<ArrowBackIosNewIconComponentProps> = ({
  ...props
}) => {
  return <ArrowBackIosNewIcon {...props} />;
};

export default ArrowBackIosNewIconComponent;
