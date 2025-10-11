import React from "react";
import PhoneIcon from "@mui/icons-material/Phone";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface PhoneIconComponentProps extends SvgIconProps {}

const PhoneIconComponent: React.FC<PhoneIconComponentProps> = (props) => {
  return <PhoneIcon {...props} />;
};

export default PhoneIconComponent;