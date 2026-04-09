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
  Autocomplete,
  Typography,
  CircularProgress,
} from "@/components/ui/Component";
import AllEmployeeSearchBar from "./AllEmployeeSearchBar";
import { TeamsActionBarProps } from "../types";
import {
  controlsStackSx,
  actionBarBoxSx,
  searchBarWrapperSx,
  rightActionsStackSx,
  actionButtonSx,
  textActionButtonSx,
  searchTextFieldSx,
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
  isAdmin,
  employeeOptions,
  hierarchyOptions,
  onEmployeeSelect,
  isEmployeeLoading,
  selectedEmployeeId,
  // New props
  selectedHierarchyId,
  onHierarchySelect,
}) => {
  return (
    <PageHeader 
      title="Team Hierarchy"
      subtitle="Visualize reporting lines and explore team members."
    >
      <Box sx={actionBarBoxSx}>
        {/* Row 1: Search and Global Actions */}
        <Stack
          sx={controlsStackSx}
        >
          {isAdmin && employeeOptions && onEmployeeSelect && (
            <AllEmployeeSearchBar
              options={employeeOptions}
              onSelect={onEmployeeSelect}
              loading={isEmployeeLoading}
              selectedId={selectedEmployeeId}
            />
          )}

          <Box sx={searchBarWrapperSx}>
            <AllEmployeeSearchBar
              options={hierarchyOptions || []}
              onSelect={onHierarchySelect || (() => {})}
              placeholder="Search in this team..."
              selectedId={selectedHierarchyId}
            />
          </Box>

          <Stack
            sx={rightActionsStackSx}
          >
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
