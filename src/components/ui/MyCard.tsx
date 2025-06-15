import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';

interface MyCardProps {
  title?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

const MyCard: React.FC<MyCardProps> = ({ title, content, actions }) => (
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

export default MyCard;
