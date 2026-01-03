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
  } = useLeads();

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleEdit = useCallback((leadId: string) => {
    setEditId(leadId);
    setOpen(true);
  }, []);

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
    // Handlers
    handleSearchChange,
    handleStatusChange,
    handleEdit,
    saveLead,
    updateLeadStatus,
    loadLeads,
  };
}
