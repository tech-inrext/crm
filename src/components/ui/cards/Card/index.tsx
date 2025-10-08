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
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: 2,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: 3,
      },
    }}
  >
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
