import React from "react";
import CardContent, { CardContentProps } from "@mui/material/CardContent";

const CardContentComponent: React.FC<CardContentProps> = (props) => {
  return <CardContent {...props} />;
};

export default CardContentComponent;