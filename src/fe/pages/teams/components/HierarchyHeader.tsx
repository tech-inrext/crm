import React from "react";
import { Paper, Box, Stack, Typography } from "@/components/ui/Component";
import { People as PeopleIcon } from "@/components/ui/Component";

interface HierarchyHeaderProps {
  children: React.ReactNode;
}

export const HierarchyHeader: React.FC<HierarchyHeaderProps> = ({
  children,
}) => (
  <Paper
    sx={{
      p: 2,
      mb: 2,
      display: "flex",
      alignItems: "center",
      gap: 2,
      justifyContent: "space-between",
      flexWrap: "wrap",
    }}
    elevation={3}
  >
    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
      <PeopleIcon sx={{ color: "#3f51b5", fontSize: 32 }} />
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Team Hierarchy
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Visualize reporting lines and explore team members.
        </Typography>
      </Box>
    </Stack>
    {children}
  </Paper>
);
