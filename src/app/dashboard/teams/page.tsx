"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import PermissionGuard from "@/components/PermissionGuard";
import { useDebounce } from "@/hooks/useDebounce";
import { useTeamHierarchy } from "@/hooks/useTeamHierarchy";
import { teamHierarchyService } from "@/services/team-hierarchy.service";
import { Employee } from "@/types/team-hierarchy";
import { STORAGE_KEYS } from "@/constants/team-hierarchy";
import { filterHierarchy, expandAllNodes } from "@/utils/hierarchy.utils";
import {
  HierarchyHeader,
  HierarchyControls,
  HierarchyTree,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/team-hierarchy";

export default function TeamsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedManager, setSelectedManager] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.SELECTED_MANAGER) || null;
    }
    return null;
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    hierarchy,
    loading,
    error,
    expanded,
    selectedNode,
    totalCount,
    fetchHierarchy,
    toggleNode,
    setExpanded,
    setSelectedNode,
  } = useTeamHierarchy(selectedManager);

  const filteredHierarchy = useMemo(
    () => filterHierarchy(hierarchy, debouncedSearch),
    [hierarchy, debouncedSearch]
  );

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const list = await teamHierarchyService.fetchEmployeeList();
        setEmployees(list);
      } catch (error) {
        console.warn("Could not fetch employees list", error);
      }
    };
    loadEmployees();
  }, []);

  const handleManagerChange = useCallback((managerId: string | null) => {
    setSelectedManager(managerId);
    if (managerId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MANAGER, managerId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_MANAGER);
    }
  }, []);

  const handleExpandAll = useCallback(() => {
    if (filteredHierarchy) {
      setExpanded(expandAllNodes(filteredHierarchy));
    }
  }, [filteredHierarchy, setExpanded]);

  const handleCollapseAll = useCallback(() => {
    if (filteredHierarchy) {
      setExpanded(new Set([filteredHierarchy._id]));
    }
  }, [filteredHierarchy, setExpanded]);

  const handleRefresh = useCallback(() => {
    if (selectedManager) {
      fetchHierarchy(selectedManager);
    }
  }, [selectedManager, fetchHierarchy]);

  return (
    <PermissionGuard module="team" action="read" fallback={<Unauthorized />}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
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
}

function Unauthorized() {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary" }}>
        You don't have permission to view the Team Hierarchy.
      </Typography>
    </Box>
  );
}
