import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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

export interface LeadFilters {
  status?: string[];
  leadType?: string[];
  propertyName?: string[];
  budgetRange?: string[];
  assignedTo?: string[];
  search?: string;
}

export function useLeads(initialFilters: LeadFilters = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [apiLeads, setApiLeads] = useState<APILead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState(initialFilters.search || "");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialFilters.status || []);
  const [selectedLeadTypes, setSelectedLeadTypes] = useState<string[]>(initialFilters.leadType || []);
  const [selectedProperties, setSelectedProperties] = useState<string[]>(initialFilters.propertyName || []);
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>(initialFilters.budgetRange || []);
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<string[]>(initialFilters.assignedTo || []);
  const [page, setPage] = useState(0); // 0-based for UI
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadFormData>(
    getDefaultLeadFormData()
  );

  // To prevent race conditions
  const requestVersionRef = useRef(0);

  const stats = useMemo(() => calculateLeadStats(leads), [leads]);

  const loadLeads = useCallback(
    async (
      page = 1,
      limit = 8,
      search = "",
      statusParams: string[] = [],
      leadTypeParams: string[] = [],
      propertyParams: string[] = [],
      budgetParams: string[] = [],
      assignedToParams: string[] = []
    ) => {
      const currentVersion = ++requestVersionRef.current;
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}`, {
          params: {
            page,
            limit,
            search,
            ...(statusParams.length > 0 ? { status: statusParams.join(",") } : {}),
            ...(leadTypeParams.length > 0 ? { leadType: leadTypeParams.join(",") } : {}),
            ...(propertyParams.length > 0 ? { propertyName: propertyParams.join(",") } : {}),
            ...(budgetParams.length > 0 ? { budgetRange: budgetParams.join(",") } : {}),
            ...(assignedToParams.length > 0 ? { assignedTo: assignedToParams.join(",") } : {}),
          },
        });

        // Only update if this is still the latest request
        if (currentVersion === requestVersionRef.current) {
          const apiLeadsData = response.data.data || [];
          const transformedLeads = apiLeadsData.map(transformAPILead);

          setApiLeads(apiLeadsData);
          setLeads(transformedLeads);
          setTotal(response.data.pagination?.totalItems || 0);
        }
      } catch (error) {
        if (currentVersion === requestVersionRef.current) {
          console.error("Error loading leads:", error);
          setApiLeads([]);
          setLeads([]);
          setTotal(0);
        }
      } finally {
        if (currentVersion === requestVersionRef.current) {
          setLoading(false);
        }
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
        await loadLeads(page + 1, rowsPerPage, search, selectedStatuses, selectedLeadTypes, selectedProperties, selectedBudgets, selectedAssignedTo);
      } catch (error) {
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [loadLeads, page, rowsPerPage, search, selectedStatuses, selectedLeadTypes, selectedProperties, selectedBudgets, selectedAssignedTo]
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

  const updateLeadType = useCallback(
    async (leadId: string, newLeadType: string) => {
      try {
        await axios.patch(`${API_BASE}/${leadId}`, { leadType: newLeadType });

        // Update local state immediately for better UX
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.id === leadId || lead._id === leadId || lead.leadId === leadId
              ? { ...lead, leadType: newLeadType }
              : lead
          )
        );
        setApiLeads((prevApiLeads) =>
          prevApiLeads.map((lead) =>
            lead.id === leadId || lead._id === leadId || lead.leadId === leadId
              ? { ...lead, leadType: newLeadType }
              : lead
          )
        );
      } catch (error) {
        console.error("Failed to update lead type:", error);
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    loadLeads(page + 1, rowsPerPage, search, selectedStatuses, selectedLeadTypes, selectedProperties, selectedBudgets, selectedAssignedTo); // API expects 1-based page
  }, [loadLeads, page, rowsPerPage, search, selectedStatuses, selectedLeadTypes, selectedProperties, selectedBudgets, selectedAssignedTo]);

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
    updateLeadType,
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
  };
}
