import React from "react";
import Person from "@mui/icons-material/Person";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface PersonIconComponentProps extends SvgIconProps {}

const PersonIconComponent: React.FC<PersonIconComponentProps> = ({
  ...props
}) => {
  return <Person {...props} />;
};

export default PersonIconComponent;