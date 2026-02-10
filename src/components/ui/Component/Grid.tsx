import React from "react";
import { Grid as MuiGrid } from "@mui/material";
import { GridProps as MuiGridProps } from "@mui/material/Grid";

export interface GridComponentProps extends MuiGridProps {
  children?: React.ReactNode;
  item?: boolean;
}

const GridComponent: React.FC<GridComponentProps> = (props) => {
  return <MuiGrid {...props} />;
};

export default GridComponent;