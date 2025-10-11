import React from "react";
import Tooltip, { TooltipProps } from "@mui/material/Tooltip";

const TooltipComponent: React.FC<TooltipProps> = (props) => {
  return <Tooltip {...props} />;
};

export default TooltipComponent;