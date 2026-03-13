"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  countNodes,
  filterHierarchy,
  expandAllNodes,
} from "@/utils/hierarchy.utils";
import { SEARCH_DEBOUNCE_DELAY } from "@/fe/pages/teams/constants/teams";
import {
  useGetHierarchyQuery,
  useGetAllEmployeesQuery,
} from "@/fe/pages/teams/teamsApi";
import type { Employee, HierarchyState } from "@/fe/pages/teams/types";

export function useTeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── Manager selection (synced with URL) ──────────────────────────────────
  const [selectedManager, setSelectedManager] = useState<string | null>(
    searchParams.get("managerId"),
  );

  // ─── Search ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // ─── Expanded/selected nodes ──────────────────────────────────────────────
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNodeState] = useState<string | null>(null);

  // ─── RTK Query hooks ─────────────────────────────────────────────────────
  const {
    data: hierarchyData,
    isLoading: hierarchyLoading,
    error: hierarchyError,
  } = useGetHierarchyQuery(
    { managerId: selectedManager || "" },
    { skip: !selectedManager },
  );

  const { data: employeesData, isLoading: employeesLoading } =
    useGetAllEmployeesQuery();

  // ─── Hierarchy ────────────────────────────────────────────────────────────
  const hierarchy = hierarchyData?.data as Employee | undefined;

  // Auto-expand root when hierarchy changes
  useEffect(() => {
    if (hierarchy?._id && !expanded.has(hierarchy._id)) {
      setExpanded(new Set([hierarchy._id]));
    }
  }, [hierarchy?._id]);

  // ─── Sync selectedManager from URL ────────────────────────────────────────
  useEffect(() => {
    const managerFromUrl = searchParams.get("managerId");
    setSelectedManager(managerFromUrl);
  }, [searchParams]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleManagerChange = useCallback(
    (managerId: string | null) => {
      setSelectedManager(managerId);
      if (managerId) {
        router.push(`/dashboard/teams?managerId=${managerId}`);
      } else {
        router.push("/dashboard/teams");
      }
    },
    [router],
  );

  const handleRefresh = useCallback(() => {
    // Refresh is handled automatically by RTK Query
    // Optionally, you can trigger a re-fetch by changing selectedManager
  }, []);

  const toggleNode = useCallback(
    (id: string) => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(id)) newExpanded.delete(id);
      else newExpanded.add(id);
      setExpanded(newExpanded);
    },
    [expanded],
  );

  const setSelectedNode = useCallback((nodeId: string | null) => {
    setSelectedNodeState(nodeId);
  }, []);

  const handleExpandAll = useCallback(() => {
    if (hierarchy) setExpanded(expandAllNodes(hierarchy));
  }, [hierarchy]);

  const handleCollapseAll = useCallback(() => {
    if (hierarchy) setExpanded(new Set([hierarchy._id]));
  }, [hierarchy]);

  const filteredHierarchy = filterHierarchy(hierarchy, debouncedSearch);

  // Error message from API
  const errorMessage = hierarchyError
    ? (hierarchyError as any)?.data?.message ||
      (hierarchyError as any)?.message ||
      "Failed to load hierarchy"
    : null;

  return {
    // Hierarchy state
    hierarchy,
    loading: hierarchyLoading,
    error: errorMessage,
    expanded,
    selectedNode,
    totalCount: hierarchy ? countNodes(hierarchy) : 0,
    filteredHierarchy,

    // Employee list
    employees: employeesData?.data || [],

    // Manager selection
    selectedManager,
    handleManagerChange,

    // Search
    search,
    debouncedSearch,
    setSearch,

    // Tree controls
    toggleNode,
    setExpanded,
    setSelectedNode,
    handleExpandAll,
    handleCollapseAll,
    handleRefresh,
  } as const;
}

export default useTeamsPage;
