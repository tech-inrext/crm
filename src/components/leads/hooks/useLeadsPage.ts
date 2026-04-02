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
import axios from "axios";


export function useLeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the logged-in user to fetch their hierarchy
  const { user } = useAuth();

  // Initialize filters from URL search parameters
  const initialFilters = useMemo(() => {
    const assignedToParam = searchParams.get("assignedTo");
    // If no assignedTo in URL, default to the current user (Assigned to me)
    const defaultAssignedTo = assignedToParam
      ? assignedToParam.split(",").filter(Boolean).slice(0, 1)
      : (user?._id ? [user._id] : []);

    return {
      status: searchParams.get("status")?.split(",").filter(Boolean) || [],
      leadType: searchParams.get("leadType")?.split(",").filter(Boolean) || [],
      propertyName: searchParams.get("propertyName")?.split(",").filter(Boolean) || [],
      budgetRange: searchParams.get("budgetRange")?.split(",").filter(Boolean) || [],
      assignedTo: defaultAssignedTo,
      assignedToMode: (searchParams.get("assignedToMode") as "direct" | "hierarchy") || "direct",
      search: searchParams.get("search") || "",
    };
  }, [searchParams, user?._id]);

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
    assignedToMode,
    setAssignedToMode,
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

  const { hierarchy, loading: hierarchyLoading } = useTeamHierarchy(user?._id || null);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllEmployees = async () => {
      if (!user?.isSystemAdmin) return;
      try {
        const res = await axios.get("/api/v0/employee/getAllEmployeeList", { params: { isCabVendor: false } });
        if (res.data.success) {
          setAllEmployees(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch all employees for admin", err);
      }
    };
    fetchAllEmployees();
  }, [user?.isSystemAdmin]);


  // Flatten hierarchy for the filter dropdown
  const teamMembers = useMemo(() => {
    // always offer an "Unassigned" option at the top of the filters
    const unassignedEntry = { _id: "unassigned", name: "Unassigned" };
    const meEntry = user?._id ? { _id: user._id, name: "Assigned to me", designation: null } : null;

    if (user?.isSystemAdmin) {
      const others = allEmployees
        .filter(emp => emp._id !== user?._id)
        .map(emp => ({
          _id: emp._id,
          name: emp.name,
          designation: emp.designation,
        }));

      const result = [unassignedEntry];
      if (meEntry) result.push(meEntry);
      return [...result, ...others];
    }

    if (!hierarchy) return meEntry ? [unassignedEntry, meEntry] : [unassignedEntry];

    const members: any[] = [];
    const flatten = (node: any) => {
      // Don't push me here, we handle it explicitly to ensure order
      if (node._id !== user?._id) {
        members.push({
          _id: node._id,
          name: node.name,
          designation: node.designation,
        });
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => flatten(child));
      }
    };

    flatten(hierarchy);

    const result = [unassignedEntry];
    if (meEntry) result.push(meEntry);
    return [...result, ...members];
  }, [hierarchy, allEmployees, user]);



  // Sync with URL for back/forward navigation or initial load after mount
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const newStatuses = statusParam ? statusParam.split(",").filter(Boolean) : [];
    setSelectedStatuses((prev) => prev.join(",") === newStatuses.join(",") ? prev : newStatuses);

    const leadTypeParam = searchParams.get("leadType");
    const newLeadTypes = leadTypeParam ? leadTypeParam.split(",").filter(Boolean) : [];
    setSelectedLeadTypes((prev) => prev.join(",") === newLeadTypes.join(",") ? prev : newLeadTypes);

    const propertyParam = searchParams.get("propertyName");
    const newProperties = propertyParam ? propertyParam.split(",").filter(Boolean) : [];
    setSelectedProperties((prev) => prev.join(",") === newProperties.join(",") ? prev : newProperties);

    const budgetParam = searchParams.get("budgetRange");
    const newBudgets = budgetParam ? budgetParam.split(",").filter(Boolean) : [];
    setSelectedBudgets((prev) => prev.join(",") === newBudgets.join(",") ? prev : newBudgets);

    const assignedToParam = searchParams.get("assignedTo");
    // If the URL has an explicitly empty assignedTo or lacks it, default to the current user 
    // to maintain 'Assigned to me' default scoping naturally, mirroring the initialFilters fallback.
    const newAssignedTo = assignedToParam 
      ? assignedToParam.split(",").filter(Boolean).slice(0, 1) 
      : (user?._id ? [user._id] : []);
    setSelectedAssignedTo((prev) => prev.join(",") === newAssignedTo.join(",") ? prev : newAssignedTo);

    const assignedToModeParam = searchParams.get("assignedToMode") as "direct" | "hierarchy" | null;
    if (assignedToModeParam) {
      setAssignedToMode((prev) => prev === assignedToModeParam ? prev : assignedToModeParam);
    } else {
      setAssignedToMode((prev) => prev === "direct" ? prev : "direct");
    }

    // Check for openDialog param
    const openDialog = searchParams.get("openDialog");
    const leadId = searchParams.get("leadId");
    const mode = searchParams.get("mode") as "view" | "edit" | null;

    if (openDialog === "true" && leadId) {
      setEditId(prev => prev === leadId ? prev : leadId);
      setDialogMode(prev => prev === (mode || "view") ? prev : (mode || "view"));
      setOpen(prev => prev === true ? prev : true);
    }
  }, [searchParams, setSelectedStatuses, setSelectedLeadTypes, setSelectedProperties, setSelectedBudgets, setSelectedAssignedTo, setAssignedToMode, setEditId, setDialogMode, setOpen]);

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
        params.delete("assignedToMode"); // Clear mode if no one is selected
        setAssignedToMode("direct");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, setSelectedAssignedTo, setAssignedToMode, setPage]
  );

  const handleAssignedToModeChange = useCallback(
    (mode: "direct" | "hierarchy") => {
      setAssignedToMode(mode);
      setPage(0);

      const params = new URLSearchParams(searchParams.toString());
      params.set("assignedToMode", mode);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, setAssignedToMode, setPage]
  );

  const handleClearAllFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedLeadTypes([]);
    setSelectedProperties([]);
    setSelectedBudgets([]);
    const defaultAssignedTo = user?._id ? [user._id] : [];
    setSelectedAssignedTo(defaultAssignedTo);
    setAssignedToMode("direct");
    setSearchInput("");
    setPage(0);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("leadType");
    params.delete("propertyName");
    params.delete("budgetRange");
    if (user?._id) {
      params.set("assignedTo", user._id);
    } else {
      params.delete("assignedTo");
    }
    params.delete("assignedToMode");
    params.delete("search");

    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router, user?._id, setSelectedStatuses, setSelectedLeadTypes, setSelectedProperties, setSelectedBudgets, setSelectedAssignedTo, setAssignedToMode, setSearchInput, setPage]);

  const handleClearPanelFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedLeadTypes([]);
    setSelectedProperties([]);
    setSelectedBudgets([]);
    setPage(0);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("leadType");
    params.delete("propertyName");
    params.delete("budgetRange");

    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router, setSelectedStatuses, setSelectedLeadTypes, setSelectedProperties, setSelectedBudgets, setPage]);

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

  const refreshLeads = useCallback(() => {
    loadLeads(
      page + 1,
      rowsPerPage,
      searchInput,
      selectedStatuses,
      selectedLeadTypes,
      selectedProperties,
      selectedBudgets,
      selectedAssignedTo,
      assignedToMode
    );
  }, [
    loadLeads,
    page,
    rowsPerPage,
    searchInput,
    selectedStatuses,
    selectedLeadTypes,
    selectedProperties,
    selectedBudgets,
    selectedAssignedTo,
    assignedToMode,
  ]);

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
    assignedToMode,
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
    handleAssignedToModeChange,
    handleClearAllFilters,
    handleClearPanelFilters,
    handleEdit,
    handleCloseDialog,
    saveLead,
    updateLeadStatus,
    updateLeadType,
    loadLeads,
    refreshLeads,
    dialogMode,
  };
}
