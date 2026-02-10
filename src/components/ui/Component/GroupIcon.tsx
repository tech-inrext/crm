import React from "react";
import Group from "@mui/icons-material/Group";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface GroupIconComponentProps extends SvgIconProps {}

const GroupIconComponent: React.FC<GroupIconComponentProps> = ({
  ...props
}) => {
  return <Group {...props} />;
};

export default GroupIconComponent;