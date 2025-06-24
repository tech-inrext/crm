import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";

interface CardComponentProps {
  title?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

const CardComponent: React.FC<CardComponentProps> = ({
  title,
  content,
  actions,
}) => (
  <Card>
    {title && (
      <CardContent>
        <Typography variant="h5">{title}</Typography>
      </CardContent>
    )}
    {content && <CardContent>{content}</CardContent>}
    {actions && <CardActions>{actions}</CardActions>}
  </Card>
);

export default CardComponent;
