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
  infoLabelSx,
} from "./styles";

 export const TeamsActionBar: React.FC<TeamsActionBarProps> = ({
  totalCount,
  search,
  loading,
  managerName,
  hierarchy,
  onSearchChange,
  onRefresh,
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
              <Box
                sx={infoLabelSx}
              >
                <PersonIcon color="inherit" />
                {`Manager: ${managerName}`}
              </Box>
            )}

            <Box
              sx={infoLabelSx}
            >
              <PeopleIcon color="inherit" />
              {`${totalCount} Members`}
            </Box>



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
