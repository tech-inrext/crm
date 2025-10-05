import { useCallback, useEffect, useState } from "react";
import { Employee, HierarchyState } from "@/types/team-hierarchy";
import { teamHierarchyService } from "@/services/team-hierarchy.service";
import { countNodes } from "@/utils/hierarchy.utils";

export const useTeamHierarchy = (selectedManager: string | null) => {
  const [state, setState] = useState<HierarchyState>({
    hierarchy: null,
    loading: false,
    error: null,
    expanded: new Set<string>(),
    selectedNode: null,
    totalCount: 0,
  });

  const fetchHierarchy = useCallback(async (managerId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await teamHierarchyService.fetchHierarchy(managerId);
      const count = countNodes(data);

      setState((prev) => ({
        ...prev,
        hierarchy: data,
        loading: false,
        expanded: new Set([data._id]),
        totalCount: count,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
        hierarchy: null,
        totalCount: 0,
      }));
    }
  }, []);

  const toggleNode = useCallback((id: string) => {
    setState((prev) => {
      const newExpanded = new Set(prev.expanded);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return { ...prev, expanded: newExpanded };
    });
  }, []);

  const setExpanded = useCallback((expanded: Set<string>) => {
    setState((prev) => ({ ...prev, expanded }));
  }, []);

  const setSelectedNode = useCallback((nodeId: string | null) => {
    setState((prev) => ({ ...prev, selectedNode: nodeId }));
  }, []);

  useEffect(() => {
    if (selectedManager) {
      fetchHierarchy(selectedManager);
    }
  }, [selectedManager, fetchHierarchy]);

  return {
    ...state,
    fetchHierarchy,
    toggleNode,
    setExpanded,
    setSelectedNode,
  };
};
