import React from "react";
import Share from "@mui/icons-material/Share";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface ShareIconComponentProps extends SvgIconProps {}

const ShareIconComponent: React.FC<ShareIconComponentProps> = ({
  ...props
}) => {
  return <Share {...props} />;
};

export default ShareIconComponent;