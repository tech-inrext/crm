"use client";

import React from "react";
import { Box, Paper, Typography } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import {
  HierarchyHeader,
  HierarchyControls,
  HierarchyTree,
  LoadingState,
  EmptyState,
} from "./components";
import useTeamsPage from "@/fe/pages/teams/hooks/useTeamsPage";
import { TEAMS_PERMISSION_MODULE } from "@/fe/pages/teams/constants/teams";
import { mainBoxSx } from "./components/styles";

const TeamsPage: React.FC = () => {
  const {
    filteredHierarchy,
    loading,
    expanded,
    selectedNode,
    totalCount,
    employees,
    selectedManager,
    handleManagerChange,
    search,
    setSearch,
    toggleNode,
    setSelectedNode,
    handleExpandAll,
    handleCollapseAll,
    handleRefresh,
    debouncedSearch,
  } = useTeamsPage();

  return (
    <PermissionGuard
      module={TEAMS_PERMISSION_MODULE}
      action="read"
    >
      <Box
        sx={mainBoxSx}
      >
        <HierarchyHeader>
          <HierarchyControls
            employees={employees}
            selectedManager={selectedManager}
            totalCount={totalCount}
            search={search}
            loading={loading}
            onManagerChange={handleManagerChange}
            onSearchChange={setSearch}
            onRefresh={handleRefresh}
          />
        </HierarchyHeader>

        <Paper sx={{ p: 3 }} elevation={1}>
          {loading ? (
            <LoadingState />
          ) : !filteredHierarchy ? (
            <EmptyState isSearchEmpty={!!debouncedSearch} />
          ) : (
            <HierarchyTree
              hierarchy={filteredHierarchy}
              expanded={expanded}
              selectedNode={selectedNode}
              searchQuery={debouncedSearch}
              onToggle={toggleNode}
              onSelect={setSelectedNode}
              onExpandAll={handleExpandAll}
              onCollapseAll={handleCollapseAll}
              onClearSearch={() => setSearch("")}
            />
          )}
        </Paper>
      </Box>
    </PermissionGuard>
  );
};

export default TeamsPage;
