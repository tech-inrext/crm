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

  const [dialogMode, setDialogMode] = useState<"edit" | "view">("edit");
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
      // We need to wait for leads to be loaded potentially, but if we have the ID we can try to find it
      // or just set the ID and let the other effect handle form data population
      setEditId(leadId);
      setDialogMode(mode || "view"); // Default to view if coming from notification/url without explicit mode, or use query param
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

  const handleEdit = useCallback((leadId: string, mode: "edit" | "view" = "edit") => {
    setEditId(leadId);
    setDialogMode(mode);
    setOpen(true);
  }, []);

<<<<<<< HEAD
  const handleClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);
=======
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
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa

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
    setFormData,
    viewMode,
    setViewMode,
    searchInput,
    selectedStatuses,
    setSelectedStatuses,
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
<<<<<<< HEAD
    handleClose,
=======
    handleCloseDialog,
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
    saveLead,
    updateLeadStatus,
    loadLeads,
    dialogMode,
  };
}
