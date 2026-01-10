import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { useLeads } from "@/hooks/useLeads";
import { getDefaultLeadFormData, transformAPILeadToForm } from "@/utils/leadUtils";

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
    stats,
  } = useLeads();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState(getDefaultLeadFormData());
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchInput, setSearchInput] = useState(search);

 // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");

  const debouncedSearch = useDebounce(searchInput, 500);

  // Derive selectedStatuses from the URL param (source of truth)
  const selectedStatuses = useMemo(() => {
    const statusParam = searchParams.get("status");
    return statusParam ? statusParam.split(",").filter(Boolean) : [];
  }, [searchParams]);
    useEffect(() => {
      setPage(0);
      loadLeads(1, rowsPerPage, search, selectedStatuses);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowsPerPage, search, selectedStatuses.join(",")]);

//serarch

  useEffect(() => {
    setSearch(debouncedSearch);
    setPage(0);
   }, [debouncedSearch]);

  
  //EDIT FORM SYNC

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
      const params = new URLSearchParams(searchParams.toString());
      if (statuses.length > 0) {
        params.set("status", statuses.join(","));
      } else {
        params.delete("status");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleEdit = useCallback((leadId: string) => {
    setEditId(leadId);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  return {
    leads,
    loading,
    saving,
    open,
    setOpen,
    editId,
    setEditId,
    formData,
    setFormData,
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
    search,
    // Snackbar state
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
    // Handlers
    handleSearchChange,
    handleStatusChange,
    handleEdit,
    handleClose,
    saveLead,
    updateLeadStatus,
    loadLeads,
  };
}
