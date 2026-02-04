import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useLeads } from "@/hooks/useLeads";
import {
  getDefaultLeadFormData,
  transformAPILeadToForm,
} from "@/utils/leadUtils";

export function useLeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    leads,
    loading,
    saving,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    total,
    loadLeads,
    saveLead,
    updateLeadStatus,
    selectedStatuses,
    setSelectedStatuses,
    stats,
    dateFilter, // Get dateFilter from useLeads
    setDateFilter, // Get setDateFilter from useLeads
  } = useLeads();

  const [dialogMode, setDialogMode] = useState<"edit" | "view">("edit");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState(getDefaultLeadFormData());
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Initialize status filter from query params
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      const statuses = statusParam.split(",").filter(Boolean);
      setSelectedStatuses(statuses);
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
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleDateFilterChange = useCallback((dateRange: { startDate?: Date | null; endDate?: Date | null }) => {
    console.log("Setting date filter:", dateRange); // Debug log
    setDateFilter(dateRange);
    setPage(0);
  }, [setDateFilter]);

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
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    total,
    stats,
    dateFilter, // Add dateFilter to return
    // Handlers
    handleSearchChange,
    handleStatusChange,
    handleEdit,
    handleCloseDialog,
    handleDateFilterChange, // Add date filter handler to return
    saveLead,
    updateLeadStatus,
    loadLeads,
    dialogMode,
  };
}