import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { transformAPILead, transformAPILeadToForm, transformFormToAPI, calculateLeadStats, getDefaultLeadFormData, filterLeads } from "@/utils/leadUtils";
import { API_BASE } from "@/constants/leads";
import type { Lead as APILead, LeadDisplay as Lead, LeadFormData } from "@/types/lead";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [apiLeads, setApiLeads] = useState<APILead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadFormData>(getDefaultLeadFormData());

  const stats = useMemo(() => calculateLeadStats(leads), [leads]);
  const filtered = useMemo(() => filterLeads(leads, search), [leads, search]);
  const rows = useMemo(() => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filtered, page, rowsPerPage]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE);
      const apiLeadsData = response.data.data || response.data;
      const transformedLeads = apiLeadsData.map(transformAPILead);
      setApiLeads(apiLeadsData);
      setLeads(transformedLeads);
    } catch (error) {
      setApiLeads([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLead = useCallback(
    async (formData: LeadFormData, editId?: string | null) => {
      setSaving(true);
      try {
        let payload = transformFormToAPI(formData);
        if (editId) {
          // Remove phone from payload when editing (backend does not allow phone update)
          const { phone, ...rest } = payload;
          payload = rest;
          await axios.patch(`${API_BASE}/${editId}`, payload); // PATCH instead of PUT
        } else {
          // Create new lead (include phone)
          await axios.post(API_BASE, payload);
        }
        await loadLeads();
      } catch (error) {
        // Optionally handle error
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [loadLeads]
  );

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return {
    leads,
    apiLeads,
    loading,
    saving,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    open,
    setOpen,
    editId,
    setEditId,
    formData,
    setFormData,
    stats,
    filtered,
    rows,
    loadLeads,
    saveLead,
  };
}
