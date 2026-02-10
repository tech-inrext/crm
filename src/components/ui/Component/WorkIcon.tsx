import React from "react";
import WorkIcon from "@mui/icons-material/Work";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface WorkIconComponentProps extends SvgIconProps {}

const WorkIconComponent: React.FC<WorkIconComponentProps> = (props) => {
  return <WorkIcon {...props} />;
};

export default WorkIconComponent;