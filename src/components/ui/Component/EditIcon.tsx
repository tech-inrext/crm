import React from "react";
import Edit from "@mui/icons-material/Edit";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface EditIconComponentProps extends SvgIconProps {}

const EditIconComponent: React.FC<EditIconComponentProps> = ({
  ...props
}) => {
  return <Edit {...props} />;
};

export default EditIconComponent;