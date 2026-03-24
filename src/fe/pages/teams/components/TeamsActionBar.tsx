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
  actionBarBoxSx,
  searchBarWrapperSx,
  rightActionsStackSx,
  actionButtonSx,
  textActionButtonSx,
} from "./styles";

export const TeamsActionBar: React.FC<TeamsActionBarProps> = ({
  totalCount,
  search,
  loading,
  managerName,
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
      <Box sx={actionBarBoxSx}>
        {/* Row 1: Search and Global Actions */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={controlsStackSx}
        >
          <Box sx={searchBarWrapperSx}>
            <SearchBar
              value={search}
              onChange={onSearchChange}
              placeholder="Search team member or role"
            />
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" sx={rightActionsStackSx}>
            {managerName && (
              <Tooltip title="Your Direct Manager">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PersonIcon fontSize="small" />}
                  sx={actionButtonSx}
                >
                  {`Manager: ${managerName}`}
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Total members in this hierarchy">
              <Button
                variant="outlined"
                startIcon={<PeopleIcon fontSize="small" />}
                sx={actionButtonSx}
              >
                {`${totalCount} Members`}
              </Button>
            </Tooltip>

            <Button
              size="small"
              variant="text"
              startIcon={<ExpandMore />}
              onClick={onExpandAll}
              sx={textActionButtonSx}
            >
              Expand All
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<ChevronRight />}
              onClick={onCollapseAll}
              sx={textActionButtonSx}
            >
              Collapse All
            </Button>

            <Tooltip title="Refresh hierarchy">
              <IconButton color="primary" onClick={onRefresh} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
    </PageHeader>
  );
};
