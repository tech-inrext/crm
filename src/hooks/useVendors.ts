import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { VENDORS_API_BASE, DEFAULT_PAGE_SIZE } from "@/constants/vendors";

export interface Vendor {
  _id?: string;
  name: string;
  email: string;
  designation?: string;
  roles?: Array<{ _id: string; name: string }>;
  [key: string]: any;
}

export function useVendors(debouncedSearch: string) {
  const [employees, setEmployees] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1); // 1-based indexing
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState(""); // raw vendor input
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({});

  const loadVendors = useCallback(
    async (page = 1, limit = DEFAULT_PAGE_SIZE, search = "") => {
      setLoading(true);
      try {
        const response = await axios.get(VENDORS_API_BASE, {
          params: {
            page,
            limit,
            search: search.trim() || undefined,
          },
        });

        const { data, pagination } = response.data;
        setEmployees(data || []);
        setTotalItems(pagination?.totalItems || 0);
      } catch (error) {
        console.error("Failed to load vendors:", error);
        setEmployees([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadVendors(page, rowsPerPage, debouncedSearch);
  }, [page, rowsPerPage, debouncedSearch, loadVendors]);

  const addVendor = useCallback(async (vendorData: any) => {
    setSaving(true);
    try {
      await axios.post(VENDORS_API_BASE, vendorData);
      await loadVendors(page, rowsPerPage, debouncedSearch);
    } catch (error) {
      console.error("Failed to add vendor:", error);
    } finally {
      setSaving(false);
    }
  }, [loadVendors, page, rowsPerPage, debouncedSearch]);

  const updateVendor = useCallback(async (vendorId: string, vendorData: any) => {
    setSaving(true);
    try {
      await axios.put(`${VENDORS_API_BASE}/${vendorId}`, vendorData);
      await loadVendors(page, rowsPerPage, debouncedSearch);
    } catch (error) {
      console.error("Failed to update vendor:", error);
    } finally {
      setSaving(false);
    }
  }, [loadVendors, page, rowsPerPage, debouncedSearch]);

  return {
    employees,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    saving,
    setOpen,
    open,
    editId,
    setEditId,
    addVendor,
    updateVendor,
    setForm,
    form,
    search,
    setSearch,
  };
}
