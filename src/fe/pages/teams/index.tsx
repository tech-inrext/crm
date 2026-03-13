"use client";

import React from "react";
import { Box, Paper, Typography } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import {
  HierarchyHeader,
  HierarchyControls,
  HierarchyTree,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/team-hierarchy";
import useTeamsPage from "@/fe/pages/teams/hooks/useTeamsPage";
import { TEAMS_PERMISSION_MODULE } from "@/fe/pages/teams/constants/teams";

const TeamsPage: React.FC = () => {
  const {
    filteredHierarchy,
    loading,
    error,
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
      fallback={<Unauthorized />}
    >
      <Box
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          pt: { xs: 2, sm: 3, md: 4 },
          minHeight: "100vh",
          bgcolor: "background.default",
          width: "100%",
          overflow: "hidden",
        }}
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
          ) : error ? (
            <ErrorState error={error} onRetry={handleRefresh} />
          ) : !filteredHierarchy ? (
            <EmptyState />
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
