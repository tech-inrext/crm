import React from "react";
import Card, { CardProps } from "@mui/material/Card";

const CardComponent: React.FC<CardProps> = (props) => {
  return <Card {...props} />;
};

export default CardComponent;