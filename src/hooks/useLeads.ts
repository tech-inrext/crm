import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  transformAPILead,
  transformFormToAPI,
  transformAPILeadToForm,
  calculateLeadStats,
  getDefaultLeadFormData,
} from "@/utils/leadUtils";
import { API_BASE } from "@/constants/leads";
import type { Lead as APILead, LeadDisplay as Lead, LeadFormData } from "@/types/lead";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [apiLeads, setApiLeads] = useState<APILead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0); // 0-based for UI
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadFormData>(getDefaultLeadFormData());

  const stats = useMemo(() => calculateLeadStats(leads), [leads]);

  const loadLeads = useCallback(
    async (page = 1, limit = 5, search = "") => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}`, {
          params: {
            page,
            limit,
            search,
          },
        });

        const apiLeadsData = response.data.data || [];
        const transformedLeads = apiLeadsData.map(transformAPILead);

        setApiLeads(apiLeadsData);
        setLeads(transformedLeads);
        setTotal(response.data.pagination?.totalItems || 0);
      } catch (error) {
        setApiLeads([]);
        setLeads([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const saveLead = useCallback(
    async (formData: LeadFormData, editId?: string | null) => {
      setSaving(true);
      try {
        let payload = transformFormToAPI(formData);
        if (editId) {
          const { phone, ...rest } = payload;
          payload = rest;
          await axios.patch(`${API_BASE}/${editId}`, payload);
        } else {
          await axios.post(API_BASE, payload);
        }
        await loadLeads(page + 1, rowsPerPage, search);
      } catch (error) {
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [loadLeads, page, rowsPerPage, search]
  );

  useEffect(() => {
    loadLeads(page + 1, rowsPerPage, search); // API expects 1-based page
  }, [loadLeads, page, rowsPerPage, search]);

  return {
    leads,
    apiLeads,
    total,
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
    loadLeads,
    saveLead,
  };
}
