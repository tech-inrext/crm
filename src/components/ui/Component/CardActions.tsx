import React from "react";
import CardActions, { CardActionsProps } from "@mui/material/CardActions";

const CardActionsComponent: React.FC<CardActionsProps> = (props) => {
  return <CardActions {...props} />;
};

export default CardActionsComponent;