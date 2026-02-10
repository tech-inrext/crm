 import React from "react";
import Chip, { ChipProps } from "@mui/material/Chip";

interface ChipComponentProps extends ChipProps {
  label?: React.ReactNode;
}

const ChipComponent: React.FC<ChipComponentProps> = (props) => {
  return <Chip {...props} />;
};

export default ChipComponent;