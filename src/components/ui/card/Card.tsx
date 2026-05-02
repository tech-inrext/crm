import React from "react";
import Card from "@/components/ui/Component/Card";
import CardContent from "@/components/ui/Component/CardContent";
import CardActions from "@/components/ui/Component/CardActions";
import Typography from "@/components/ui/Component/Typography";

interface CardComponentProps {
  title?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  contentSx?: any;
}

const CardComponent: React.FC<CardComponentProps> = ({
  title,
  content,
  actions,
  contentSx,
}) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: 2,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 24px -10px rgba(0,0,0,0.15)",
      },
    }}
  >
    {title && (
      <CardContent>
        <Typography variant="h5">{title}</Typography>
      </CardContent>
    )}
    {content && (
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 }, ...contentSx }}>
        {content}
      </CardContent>
    )}
    {actions && <CardActions>{actions}</CardActions>}
  </Card>
);

export default CardComponent;
