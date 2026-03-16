"use client";
import React  from 'react'
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
import type { Employee } from "@/fe/pages/teams/types";
import { useAuth } from "@/contexts/AuthContext";

export function useTeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // ─── Manager selection (synced with URL) ──────────────────────────────────
  const [selectedManager, setSelectedManager] = useState<string | null>(
    searchParams.get("managerId"),
  );
  
  // Track if we have set the initial default user
  const hasSetDefaultUser = React.useRef(!!searchParams.get("managerId"));

  // ─── Search ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // ─── Expanded/selected nodes ──────────────────────────────────────────────
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNodeState] = useState<string | null>(null);

  // ─── Query hooks ─────────────────────────────────────────────────────────
  const {
    data: hierarchyData,
    loading: hierarchyLoading,
    error: hierarchyError,
    refetch: refetchHierarchy,
  } = useGetHierarchyQuery({ 
    managerId: selectedManager 
  });

  const { data: employeesData } =
    useGetAllEmployeesQuery({});

  // ─── Hierarchy ────────────────────────────────────────────────────────────
  const hierarchy = hierarchyData?.data as Employee | undefined;

  // Auto-expand root when hierarchy changes
  useEffect(() => {
    if (hierarchy?._id && !expanded.has(hierarchy._id)) {
      setExpanded(new Set([hierarchy._id]));
    }
  }, [hierarchy?._id]);

  // ─── Sync selectedManager from URL & handle default user ────────────────
  useEffect(() => {
    const managerFromUrl = searchParams.get("managerId");
    
    // Prioritize URL parameter
    if (managerFromUrl) {
      setSelectedManager(managerFromUrl);
      hasSetDefaultUser.current = true;
    } 
    // Otherwise default once when user profile is ready
    else if (!hasSetDefaultUser.current && user?._id) {
      setSelectedManager(user._id);
      hasSetDefaultUser.current = true;
    }
  }, [searchParams, user?._id]);

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
    if (selectedManager) {
      refetchHierarchy();
    }
  }, [refetchHierarchy, selectedManager]);

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

  // We are loading if the query is loading, OR if we haven't even tried to set the default user yet
  const isLoading = hierarchyLoading || (!hasSetDefaultUser.current && !selectedManager);

  return {
    // Hierarchy state
    loading: isLoading,
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
    setSelectedNode,
    handleExpandAll,
    handleCollapseAll,
    handleRefresh,
  } as const;
}

export default useTeamsPage;
