"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  countNodes,
  filterHierarchy,
  expandAllNodes,
} from "@/utils/hierarchy.utils";
import {
  API_ENDPOINTS,
  SEARCH_DEBOUNCE_DELAY,
} from "@/fe/pages/teams/constants/teams";
import type { Employee, HierarchyState } from "@/fe/pages/teams/types";

export function useTeamsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ─── Manager selection (synced with URL) ──────────────────────────────────
  const [selectedManager, setSelectedManager] = useState<string | null>(
    searchParams.get("managerId"),
  );

  // ─── Employee list for autocomplete ───────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>([]);

  // ─── Search ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // ─── Hierarchy state ──────────────────────────────────────────────────────
  const [state, setState] = useState<HierarchyState>({
    hierarchy: null,
    loading: false,
    error: null,
    expanded: new Set<string>(),
    selectedNode: null,
    totalCount: 0,
  });

  // ─── Fetch hierarchy ──────────────────────────────────────────────────────
  const fetchHierarchy = useCallback(async (managerId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.HIERARCHY}?managerId=${managerId}`,
        { withCredentials: true },
      );
      const data: Employee = response.data?.data;
      setState((prev) => ({
        ...prev,
        hierarchy: data,
        loading: false,
        expanded: new Set([data._id]),
        totalCount: countNodes(data),
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err?.response?.data?.message ||
          err.message ||
          "Failed to load hierarchy",
        hierarchy: null,
        totalCount: 0,
      }));
    }
  }, []);

  // ─── Fetch employee list for autocomplete ─────────────────────────────────
  useEffect(() => {
    axios
      .get(`${API_ENDPOINTS.EMPLOYEE_LIST}?limit=1000&page=1`, {
        withCredentials: true,
      })
      .then((res) => setEmployees(res.data?.data || []))
      .catch(() => setEmployees([]));
  }, []);

  // ─── Sync selectedManager from URL ────────────────────────────────────────
  useEffect(() => {
    const managerFromUrl = searchParams.get("managerId");
    setSelectedManager(managerFromUrl);
  }, [searchParams]);

  // ─── Auto-fetch hierarchy when manager changes ────────────────────────────
  useEffect(() => {
    if (selectedManager) fetchHierarchy(selectedManager);
  }, [selectedManager, fetchHierarchy]);

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
    if (selectedManager) fetchHierarchy(selectedManager);
  }, [selectedManager, fetchHierarchy]);

  const toggleNode = useCallback((id: string) => {
    setState((prev) => {
      const newExpanded = new Set(prev.expanded);
      if (newExpanded.has(id)) newExpanded.delete(id);
      else newExpanded.add(id);
      return { ...prev, expanded: newExpanded };
    });
  }, []);

  const setExpanded = useCallback((expanded: Set<string>) => {
    setState((prev) => ({ ...prev, expanded }));
  }, []);

  const setSelectedNode = useCallback((nodeId: string | null) => {
    setState((prev) => ({ ...prev, selectedNode: nodeId }));
  }, []);

  const handleExpandAll = useCallback(() => {
    if (state.hierarchy) setExpanded(expandAllNodes(state.hierarchy));
  }, [state.hierarchy, setExpanded]);

  const handleCollapseAll = useCallback(() => {
    if (state.hierarchy) setExpanded(new Set([state.hierarchy._id]));
  }, [state.hierarchy, setExpanded]);

  const filteredHierarchy = filterHierarchy(state.hierarchy, debouncedSearch);

  return {
    // Hierarchy state
    ...state,
    filteredHierarchy,

    // Employee list
    employees,

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
