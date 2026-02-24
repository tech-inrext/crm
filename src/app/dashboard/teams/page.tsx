"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography } from "@/components/ui/Component";
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
import { useSearchParams, useRouter } from "next/navigation";

export default function TeamsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
 const searchParams = useSearchParams();
const router = useRouter();

const initialManager = searchParams.get("managerId");

const [selectedManager, setSelectedManager] = useState<string | null>(
  initialManager
);
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
  const managerFromUrl = searchParams.get("managerId");
  setSelectedManager(managerFromUrl);
}, [searchParams]);
  useEffect(() => {
  if (selectedManager) {
    fetchHierarchy(selectedManager);
  }
}, [selectedManager, fetchHierarchy]);
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

 const handleManagerChange = useCallback(
  (managerId: string | null) => {
    setSelectedManager(managerId);

    if (managerId) {
      router.push(`/dashboard/teams?managerId=${managerId}`);
    } else {
      router.push(`/dashboard/teams`);
    }
  },
  [router]
);

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
}

function Unauthorized() {
  return (
    <Box
      sx={{
        p: 4,
        textAlign: "center",
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 2, color: "error.main" }}
      >
        Access Denied
      </Typography>
      <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
        You don't have permission to view the Team Hierarchy.
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Please contact your administrator to request access to the "team" module
        with "read" permissions.
      </Typography>
    </Box>
  );
}
