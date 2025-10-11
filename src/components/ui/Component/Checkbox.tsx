import React from "react";
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";

const CheckboxComponent: React.FC<CheckboxProps> = (props) => {
  return <Checkbox {...props} />;
};

export default CheckboxComponent;
