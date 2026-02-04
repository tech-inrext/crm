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
import type {
  Lead as APILead,
  LeadDisplay as Lead,
  LeadFormData,
} from "@/types/lead";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [apiLeads, setApiLeads] = useState<APILead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [page, setPage] = useState(0); // 0-based for UI
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadFormData>(
    getDefaultLeadFormData()
  );

  // Add date filter state
  const [dateFilter, setDateFilter] = useState<{
    startDate?: Date | null;
    endDate?: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const stats = useMemo(() => calculateLeadStats(leads), [leads]);

  const loadLeads = useCallback(
  async (
    pageNum = 1,
    limit = 5,
    searchQuery = "",
    statusParams: string[] = []
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit,
        search: searchQuery,
        ...(statusParams.length > 0 ? { status: statusParams.join(",") } : {}),
      };

      console.log("Loading leads with params:", params);

      const response = await axios.get(`${API_BASE}`, {
        params,
      });

      let apiLeadsData = response.data.data || [];
      
      // Client-side date filtering if API doesn't support it
      if (dateFilter?.startDate || dateFilter?.endDate) {
        apiLeadsData = apiLeadsData.filter((lead: any) => {
          if (!lead.createdAt) return true;
          
          const leadDate = new Date(lead.createdAt);
          let passesFilter = true;
          
          if (dateFilter.startDate) {
            passesFilter = passesFilter && leadDate >= dateFilter.startDate;
          }
          
          if (dateFilter.endDate) {
            // End date ko inclusive banane ke liye
            const endOfDay = new Date(dateFilter.endDate);
            endOfDay.setHours(23, 59, 59, 999);
            passesFilter = passesFilter && leadDate <= endOfDay;
          }
          
          return passesFilter;
        });
        
        console.log("Filtered leads count:", apiLeadsData.length);
      }

      const transformedLeads = apiLeadsData.map(transformAPILead);

      setApiLeads(apiLeadsData);
      setLeads(transformedLeads);
      setTotal(apiLeadsData.length); // Client-side filtering ke liye total update karein
    } catch (error) {
      console.error("Error loading leads:", error);
      setApiLeads([]);
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  },
  [dateFilter]
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
        await loadLeads(page + 1, rowsPerPage, search, selectedStatuses);
      } catch (error) {
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [loadLeads, page, rowsPerPage, search, selectedStatuses]
  );

  const updateLeadStatus = useCallback(
    async (leadId: string, newStatus: string) => {
      try {
        await axios.patch(`${API_BASE}/${leadId}`, { status: newStatus });

        // Update local state immediately for better UX
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === leadId || lead._id === leadId || lead.leadId === leadId
              ? { ...lead, status: newStatus }
              : lead
          )
        );
        setApiLeads((prevApiLeads) =>
          prevApiLeads.map((lead) =>
            lead.id === leadId || lead._id === leadId || lead.leadId === leadId
              ? { ...lead, status: newStatus }
              : lead
          )
        );
      } catch (error) {
        console.error("Failed to update lead status:", error);
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    loadLeads(page + 1, rowsPerPage, search, selectedStatuses);
  }, [loadLeads, page, rowsPerPage, search, selectedStatuses]);

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
    updateLeadStatus,
    selectedStatuses,
    setSelectedStatuses,
    dateFilter, // Return dateFilter
    setDateFilter, // Return setDateFilter
  };
}