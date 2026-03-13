import React from "react";
import { Paper, Box, Stack, Typography, People } from "@/components/ui/Component";
import { HierarchyHeaderProps } from "../types";
import {
  hierarchyHeaderSx,
  headerStackSx,
  headerIconSx,
  headerTitleSx,
  headerSubtitleSx,
} from "./styles";

export const HierarchyHeader: React.FC<HierarchyHeaderProps> = ({
  children,
}) => (
  <Paper sx={hierarchyHeaderSx} elevation={3}>
    <Stack direction="row" spacing={2} alignItems="center" sx={headerStackSx}>
      <People sx={headerIconSx} />
      <Box>
        <Typography variant="h5" sx={headerTitleSx}>
          Team Hierarchy
        </Typography>
        <Typography variant="body2" sx={headerSubtitleSx}>
          Visualize reporting lines and explore team members.
        </Typography>
      </Box>
    </Stack>
    {children}
  </Paper>
);
