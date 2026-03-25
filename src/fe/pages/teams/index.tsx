"use client";

import React from "react";
import { Box, Paper, Typography } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import {
  HierarchyTree,
  LoadingState,
  EmptyState,
  TeamsActionBar,
} from "./components";
import PageHeader from "@/fe/components/PageHeader";
import useTeamsPage from "@/fe/pages/teams/hooks/useTeamsPage";
import { TEAMS_PERMISSION_MODULE } from "@/fe/pages/teams/constants/teams";
import { mainBoxSx } from "./styles";

const TeamsPage: React.FC = () => {
  const {
    filteredHierarchy,
    hierarchy,
    loading,
    expanded,
    selectedNode,
    totalCount,
    search,
    managerName,
    handleSearchChange,
    setSearch,
    toggleNode,
    setSelectedNode,
    handleExpandAll,
    handleCollapseAll,
    handleRefresh,
    debouncedSearch,
    // Admin search
    isAdmin,
    managersData,
    handleEmployeeSelect,
    selectedManager,
    isEmployeeLoading,
    hierarchyOptions,
    contextManager,
    handleHierarchySelect,
  } = useTeamsPage();

  return (
    <PermissionGuard
      module={TEAMS_PERMISSION_MODULE}
      action="read"
    >
      <Box
        sx={mainBoxSx}
      >
        <TeamsActionBar
          totalCount={totalCount}
          search={search}
          loading={loading}
          managerName={managerName}
          hierarchy={hierarchy}
          onSearchChange={handleSearchChange}
          onRefresh={handleRefresh}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          onClearSearch={() => setSearch("")}
          // Admin search props
          isAdmin={isAdmin}
          employeeOptions={managersData}
          onEmployeeSelect={handleEmployeeSelect}
          isEmployeeLoading={isEmployeeLoading}
          selectedEmployeeId={contextManager}
          hierarchyOptions={hierarchyOptions}
          selectedHierarchyId={selectedNode}
          onHierarchySelect={handleHierarchySelect}
        />

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
