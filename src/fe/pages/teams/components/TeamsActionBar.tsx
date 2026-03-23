"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import {
  Box,
  Stack,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Refresh,
  Person as PersonIcon,
  People as PeopleIcon,
  ExpandMore,
  ChevronRight,
} from "@/components/ui/Component";
import SearchBar from "@/components/ui/search/SearchBar";
import { TeamsActionBarProps } from "../types";
import {
  controlsStackSx,
  totalMembersChipSx,
} from "./styles";

export const TeamsActionBar: React.FC<TeamsActionBarProps> = ({
  totalCount,
  search,
  loading,
  hierarchy,
  onSearchChange,
  onRefresh,
  onExpandAll,
  onCollapseAll,
}) => {
  return (
    <PageHeader 
      title="Team Hierarchy"
      subtitle="Visualize reporting lines and explore team members."
    >
      <Box sx={{ width: "100%" }}>
        {/* Row 1: Search and Global Actions */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ ...controlsStackSx, mb: 1.5 }}
        >
          <Box sx={{ flexGrow: 1, maxWidth: "600px" }}>
            <SearchBar
              value={search}
              onChange={onSearchChange}
              placeholder="Search team member or role"
            />
          </Box>

          <Tooltip title="Refresh hierarchy">
            <IconButton color="primary" onClick={onRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title="Total members in this hierarchy">
            <Chip
              icon={<PeopleIcon />}
              label={`${totalCount} Members`}
              color="success"
              variant="filled"
              sx={totalMembersChipSx}
            />
          </Tooltip>

          <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
            <Button
              size="small"
              variant="text"
              startIcon={<ExpandMore />}
              onClick={onExpandAll}
              sx={{ fontWeight: 600 }}
            >
              Expand All
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<ChevronRight />}
              onClick={onCollapseAll}
              sx={{ fontWeight: 600 }}
            >
              Collapse All
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageHeader>
  );
};
