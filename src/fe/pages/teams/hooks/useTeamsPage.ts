"use client";
import React  from 'react'
import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  countNodes,
  filterHierarchy,
  expandAllNodes,
  flattenHierarchy,
  findPathToNode,
} from "@/fe/pages/teams/utils";
import { SEARCH_DEBOUNCE_DELAY } from "@/fe/pages/teams/constants/teams";
import {
  useGetHierarchyQuery,
} from "@/fe/pages/teams/teamsApi";
import { useGetManagersQuery } from "@/fe/pages/user/userApi";
import type { Employee } from "@/fe/pages/teams/types";
import { useAuth } from "@/contexts/AuthContext";

export function useTeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // ─── Manager selection (defaults to current user) ──────────────────────────
  const [selectedManager, setSelectedManager] = useState<string | null>(
    user?._id || null,
  );
  
  // Context manager (stable value for Bar 1)
  const [contextManager, setContextManager] = useState<string | null>(
    user?._id || null,
  );
  
  // Track if we have set the initial default user
  const hasSetDefaultUser = React.useRef(!!user?._id);

  // ─── Search ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // ─── Expanded/selected nodes ──────────────────────────────────────────────
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNodeState] = useState<string | null>(null);

  const {
    data: hierarchyData,
    loading: hierarchyLoading,
    error: hierarchyError,
    refetch: refetchHierarchy,
  } = useGetHierarchyQuery({ 
    managerId: selectedManager 
  });
  
  // ─── Manager info for logged in user (Admin can see all) ───────────────────────
  const { data: managersData, loading: managersLoading } = useGetManagersQuery({
    limit: 5000, // Fetch more to be safe, though BE currently ignores it
    page: 1,
  });

  // ─── Hierarchy ────────────────────────────────────────────────────────────
  const hierarchy = hierarchyData?.data as Employee | undefined;

  const managerName = useMemo(() => {
    const managers = (managersData as any)?.data ?? managersData ?? [];
    const currentManagerId = hierarchy?.managerId || user?.managerId;
    const manager = managers.find((m: any) => m._id === currentManagerId);
    return manager?.name;
  }, [managersData, user?.managerId, hierarchy?.managerId]);

  // Auto-expand root when hierarchy changes
  useEffect(() => {
    if (hierarchy?._id) {
      setExpanded(new Set([hierarchy._id]));
    }
  }, [hierarchy?._id]);

  // Auto-expand path to selected node
  useEffect(() => {
    if (selectedNode && hierarchy) {
      const path = findPathToNode(hierarchy, selectedNode);
      if (path && path.length > 0) {
        setExpanded((prev) => {
          const newSet = new Set(prev);
          path.forEach((id) => newSet.add(id));
          return newSet;
        });
      }
    }
  }, [selectedNode, hierarchy]);

  // ─── Initialize with current user ──────────────────────────────────────────
  useEffect(() => {
    if (!hasSetDefaultUser.current && user?._id) {
      setSelectedManager(user._id);
      setContextManager(user._id);
      hasSetDefaultUser.current = true;
    }
  }, [user?._id]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

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

  const hierarchyOptions = useMemo(() => flattenHierarchy(hierarchy), [hierarchy]);

  const filteredHierarchy = filterHierarchy(hierarchy, debouncedSearch);

  // We are loading if the query is loading, OR if we haven't even tried to set the default user yet
  const isLoading = hierarchyLoading || (!hasSetDefaultUser.current && !selectedManager);

  return {
    // Hierarchy state
    loading: isLoading,
    hierarchy,
    expanded,
    selectedNode,
    totalCount: hierarchy ? countNodes(hierarchy) : 0,
    filteredHierarchy,
    hierarchyOptions,
    managerName,

    // Manager selection
    selectedManager,

    // Search
    search,
    debouncedSearch,
    handleSearchChange,
    setSearch,

    // Tree controls
    toggleNode,
    setSelectedNode,
    handleExpandAll,
    handleCollapseAll,
    handleRefresh,

    // Admin employee search
    isAdmin: user?.isSystemAdmin,
    managersData: (managersData as any)?.data ?? managersData ?? [],
    isEmployeeLoading: managersLoading,
    contextManager,
    handleEmployeeSelect: (employeeId: string | null) => {
      hasSetDefaultUser.current = true; // Stop auto-selecting logged in user
      const targetId = employeeId || user?._id || null;
      setSelectedManager(targetId);
      setContextManager(targetId);
      setSelectedNodeState(null); // Clear highlight when context changes
    },
    handleHierarchySelect: (employeeId: string | null) => {
      // Drill-down: only update the actual root, not the context
      setSelectedManager(employeeId || contextManager || user?._id || null);
      if (employeeId) {
        setSelectedNodeState(employeeId);
      }
    },
  } as const;
}

export default useTeamsPage;
