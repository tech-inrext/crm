import { memo } from "react";
import { Card, Typography } from "@mui/material";

interface StatsCardProps {
  value: string | number;
  label: string;
  color: string;
}

const StatsCard = memo(({ value, label, color }: StatsCardProps) => (
  <Card elevation={3} sx={{ textAlign: "center", p: 2, borderRadius: 3 }}>
    <Typography variant="h4" fontWeight={700} color={color}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Card>
));

StatsCard.displayName = "StatsCard";

export default StatsCard;
