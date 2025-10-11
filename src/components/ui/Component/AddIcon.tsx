import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface AddIconComponentProps extends SvgIconProps {}

const AddIconComponent: React.FC<AddIconComponentProps> = (props) => {
  return <AddIcon {...props} />;
};

export default AddIconComponent;