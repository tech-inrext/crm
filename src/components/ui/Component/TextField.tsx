import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";

const TextFieldComponent: React.FC<TextFieldProps> = (props) => {
  return <TextField {...props} />;
};

export default TextFieldComponent;