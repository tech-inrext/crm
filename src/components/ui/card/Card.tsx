import React from "react";
import Card from "@/components/ui/Component/Card";
import CardContent from "@/components/ui/Component/CardContent";
import CardActions from "@/components/ui/Component/CardActions";
import Typography from "@/components/ui/Component/Typography";

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
