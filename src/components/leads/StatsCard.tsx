import { memo } from "react";
import { Card, Typography } from "@/components/ui/Component";

interface StatsCardProps {
  value: string | number;
  label: string;
  color: string;
}

const StatsCard = memo(({ value, label, color }: StatsCardProps) => (
  <Card
    elevation={3}
    sx={{
      textAlign: "center",
      p: { xs: 0.75, sm: 1.5, md: 2 }, // Much smaller padding on mobile
      borderRadius: { xs: 1.5, sm: 2, md: 3 }, // Smaller border radius on mobile
      minHeight: { xs: 60, sm: 80, md: 100 }, // Ensure minimum height but smaller on mobile
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <Typography
      variant="h4"
      fontWeight={700}
      color={color}
      sx={{
        fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.125rem" }, // Much smaller on mobile
        lineHeight: 1.2,
        mb: { xs: 0.25, sm: 0.5 }, // Reduced margin
      }}
    >
      {value}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" }, // Smaller text on mobile
        lineHeight: 1.3,
        fontWeight: 500,
      }}
    >
      {label}
    </Typography>
  </Card>
));

StatsCard.displayName = "StatsCard";

export default StatsCard;
