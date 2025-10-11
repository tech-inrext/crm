import React from "react";
import Divider, { DividerProps } from "@mui/material/Divider";

interface DividerComponentProps extends DividerProps {}

const DividerComponent: React.FC<DividerComponentProps> = (props) => {
  return <Divider {...props} />;
};

export default DividerComponent;
