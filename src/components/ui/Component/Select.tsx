import React from "react";
import Select, { SelectProps } from "@mui/material/Select";

const SelectComponent: React.FC<SelectProps> = (props) => {
  return <Select {...props} />;
};

export default SelectComponent;
