import { Box, Typography } from "@mui/material";

export const ValueChip = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "old" | "new";
}) => (
  <Typography
    component="span"
    variant="body2"
    sx={{
      px: 0.8,
      py: 0.15,
      borderRadius: 1,
      fontWeight: 500,
      fontSize: "0.8rem",
      lineHeight: 1.6,
      ...(color === "old"
        ? {
            bgcolor: "action.hover",
            color: "text.secondary",
            textDecoration: "line-through",
            textDecorationColor: (theme) => theme.palette.text.secondary,
          }
        : {
            bgcolor: "success.light",
            color: "success.contrastText",
          }),
    }}
  >
    {children}
  </Typography>
);

const LeadActivity = (change: any) => {
  return (
    <Box>
      {Object.entries(change.change).map(([field, vals]: any) => (
        <Box
          key={field}
          sx={{
            mb: 0.5,
            display: "flex",
            gap: 0.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            component="span"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            Updated
          </Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{ fontWeight: 600, fontSize: "0.8rem", color: "text.primary" }}
          >
            {field.trim().charAt(0).toUpperCase() + field.trim().slice(1)}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            from
          </Typography>
          <ValueChip color="old">{vals.prev || "None"}</ValueChip>
          <Typography
            variant="body2"
            component="span"
            sx={{ color: "text.secondary", fontSize: "0.8rem" }}
          >
            to
          </Typography>
          <ValueChip color="new">{vals.new || "None"}</ValueChip>
        </Box>
      ))}
    </Box>
  );
};

export default LeadActivity;
