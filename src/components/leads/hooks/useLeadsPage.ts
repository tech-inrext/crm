import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useLeads } from "@/hooks/useLeads";
import {
  getDefaultLeadFormData,
  transformAPILeadToForm,
} from "@/utils/leadUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamHierarchy } from "@/hooks/useTeamHierarchy";

export function useLeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL search parameters
  const initialFilters = useMemo(() => {
    return {
      status: searchParams.get("status")?.split(",").filter(Boolean) || [],
      leadType: searchParams.get("leadType")?.split(",").filter(Boolean) || [],
      propertyName: searchParams.get("propertyName")?.split(",").filter(Boolean) || [],
      budgetRange: searchParams.get("budgetRange")?.split(",").filter(Boolean) || [],
      assignedTo: searchParams.get("assignedTo")?.split(",").filter(Boolean) || [],
      search: searchParams.get("search") || "",
    };
  }, [searchParams]);

  const {
    leads,
    loading,
    saving,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    total,
    loadLeads,
    saveLead,
    updateLeadStatus,
    updateLeadType,
    stats,
    search,
    setSearch,
    selectedStatuses,
    setSelectedStatuses,
    selectedLeadTypes,
    setSelectedLeadTypes,
    selectedProperties,
    setSelectedProperties,
    selectedBudgets,
    setSelectedBudgets,
    selectedAssignedTo,
    setSelectedAssignedTo,
    open: internalOpen,
    setOpen: setInternalOpen,
    editId: internalEditId,
    setEditId: setInternalEditId,
    formData: internalFormData,
    setFormData: setInternalFormData,
  } = useLeads(initialFilters);

  const [dialogMode, setDialogMode] = useState<"edit" | "view">("edit");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState(getDefaultLeadFormData());
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Get the logged-in user to fetch their hierarchy
  const { user } = useAuth();
  const { hierarchy, loading: hierarchyLoading } = useTeamHierarchy(user?._id || null);

  // Flatten hierarchy for the filter dropdown
  const teamMembers = useMemo(() => {
    if (!hierarchy) return [];

    const members: any[] = [];
    const flatten = (node: any) => {
      members.push({ _id: node._id, name: node.name, designation: node.designation });
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => flatten(child));
      }
    };

    flatten(hierarchy);
    // Exclude the manager themselves if you want only subordinates, 
    // but usually include them to allow filtering "my own leads"
    return members;
  }, [hierarchy]);

  // Sync with URL for back/forward navigation or initial load after mount
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      const statuses = statusParam.split(",").filter(Boolean);
      setSelectedStatuses(statuses);
    }

    const leadTypeParam = searchParams.get("leadType");
    if (leadTypeParam) {
      const types = leadTypeParam.split(",").filter(Boolean);
      setSelectedLeadTypes(types);
    }

    const propertyParam = searchParams.get("propertyName");
    if (propertyParam) {
      const properties = propertyParam.split(",").filter(Boolean);
      setSelectedProperties(properties);
    }

    const budgetParam = searchParams.get("budgetRange");
    if (budgetParam) {
      const budgets = budgetParam.split(",").filter(Boolean);
      setSelectedBudgets(budgets);
    }

    const assignedToParam = searchParams.get("assignedTo");
    if (assignedToParam) {
      const ids = assignedToParam.split(",").filter(Boolean);
      setSelectedAssignedTo(ids);
    }

    // Check for openDialog param
    const openDialog = searchParams.get("openDialog");
    const leadId = searchParams.get("leadId");
    const mode = searchParams.get("mode") as "view" | "edit" | null;

    if (openDialog === "true" && leadId) {
      setEditId(leadId);
      setDialogMode(mode || "view");
      setOpen(true);
    }
  }, [searchParams, setSelectedStatuses, setSelectedLeadTypes, setSelectedProperties, setSelectedBudgets, setSelectedAssignedTo]);

  // Sync debounced search
  useEffect(() => {
    setSearch(debouncedSearch);
    setPage(0);
  }, [debouncedSearch, setSearch, setPage]);

  // Sync form data with selected lead
  useEffect(() => {
    if (editId) {
      const lead = leads.find(
        (l) => l.id === editId || l._id === editId || l.leadId === editId
      );
      if (lead) {
        setFormData(transformAPILeadToForm(lead));
      }
    } else {
      setFormData(getDefaultLeadFormData());
    }
  }, [editId, leads]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleStatusChange = useCallback(
    (statuses: string[]) => {
      setSelectedStatuses(statuses);
      setPage(0);

      const params = new URLSearchParams(searchParams.toString());
      if (statuses.length > 0) {
        params.set("status", statuses.join(","));
      } else {
        params.delete("status");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, setSelectedStatuses, setPage]
  );

  const handleLeadTypeChange = useCallback(
    (types: string[]) => {
      setSelectedLeadTypes(types);
      setPage(0);

      const params = new URLSearchParams(searchParams.toString());
      if (types.length > 0) {
        params.set("leadType", types.join(","));
      } else {
        params.delete("leadType");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, setSelectedLeadTypes, setPage]
  );

  const handlePropertyChange = useCallback(
    (properties: string[]) => {
      setSelectedProperties(properties);
      setPage(0);

      const params = new URLSearchParams(searchParams.toString());
      if (properties.length > 0) {
        params.set("propertyName", properties.join(","));
      } else {
        params.delete("propertyName");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, setSelectedProperties, setPage]
  );

  const handleBudgetChange = useCallback(
    (budgets: string[]) => {
      setSelectedBudgets(budgets);
      setPage(0);

      const params = new URLSearchParams(searchParams.toString());
      if (budgets.length > 0) {
        params.set("budgetRange", budgets.join(","));
      } else {
        params.delete("budgetRange");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, setSelectedBudgets, setPage]
  );

  const handleAssignedToChange = useCallback(
    (ids: string[]) => {
      setSelectedAssignedTo(ids);
      setPage(0);

      const params = new URLSearchParams(searchParams.toString());
      if (ids.length > 0) {
        params.set("assignedTo", ids.join(","));
      } else {
        params.delete("assignedTo");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, setSelectedAssignedTo, setPage]
  );

  const handleClearAllFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedLeadTypes([]);
    setSelectedProperties([]);
    setSelectedBudgets([]);
    setSelectedAssignedTo([]);
    setSearchInput("");
    setPage(0);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("leadType");
    params.delete("propertyName");
    params.delete("budgetRange");
    params.delete("assignedTo");
    params.delete("search");

    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router, setSelectedStatuses, setSelectedLeadTypes, setSelectedProperties, setSelectedBudgets, setSelectedAssignedTo, setSearchInput, setPage]);

  const handleEdit = useCallback((leadId: string, mode: "edit" | "view" = "edit") => {
    setEditId(leadId);
    setDialogMode(mode);
    setOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setDialogMode("edit");

    // Remove query params
    const params = new URLSearchParams(searchParams.toString());
    params.delete("openDialog");
    params.delete("leadId");
    params.delete("mode");

    // Use replace to avoid adding to history stack, or push if navigation history is desired. 
    // Usually replacing is better for closing dialogs to avoid "back button re-opens dialog" loop if not desired, 
    // but here push might be safer if we want to preserve state? 
    // Actually, usually users expect back button to go back to previous page, not re-open dialog.
    // Let's use push to be consistent with other navigation, but replace is often cleaner for state changes.
    // The user just said "remove the params from url".
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  return {
    // State
    leads,
    loading,
    saving,
    open,
    setOpen,
    editId,
    setEditId,
    formData,
    viewMode,
    setViewMode,
    searchInput,
    selectedStatuses,
    selectedLeadTypes,
    selectedProperties,
    selectedBudgets,
    selectedAssignedTo,
    teamMembers,
    hierarchyLoading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    total,
    stats,
    // Handlers
    handleSearchChange,
    handleStatusChange,
    handleLeadTypeChange,
    handlePropertyChange,
    handleBudgetChange,
    handleAssignedToChange,
    handleClearAllFilters,
    handleEdit,
    handleCloseDialog,
    saveLead,
    updateLeadStatus,
    updateLeadType,
    loadLeads,
    dialogMode,
  };
}
