import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { USERS_API_BASE, DEFAULT_PAGE_SIZE } from "@/constants/users";

export interface Vendor {
  _id?: string;
  name: string;
  email: string;
  designation?: string;
  roles?: Array<{ _id: string; name: string }>;
  isCabVendor?: boolean;
  [key: string]: any;
}

/**
 * Controlled hook: parent passes debouncedSearch, page (1-based), and rowsPerPage.
 * The hook fetches vendors with server-side pagination and search, filtering by isCabVendor=true.
 */
export function useVendors(
  debouncedSearch: string,
  page: number,
  rowsPerPage: number = DEFAULT_PAGE_SIZE
) {
  const [employees, setEmployees] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState<string | null>(null);

  const loadVendors = useCallback(
    async (_page = page, _limit = rowsPerPage, _search = debouncedSearch) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(USERS_API_BASE, {
          params: {
            page: _page,
            limit: _limit,
            search: _search.trim() || undefined,
            isCabVendor: true, // ✅ ask server for vendors only
          },
          withCredentials: true,
        });

        const { data, pagination } = res.data || {};
        setEmployees((data as Vendor[]) || []);
        setTotalItems(pagination?.totalItems || 0);
      } catch (err: any) {
        console.error("Failed to load vendors:", err);
        setEmployees([]);
        setTotalItems(0);
        setError(err?.message || "Failed to load vendors. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [page, rowsPerPage, debouncedSearch]
  );

  useEffect(() => {
    loadVendors(page, rowsPerPage, debouncedSearch);
  }, [page, rowsPerPage, debouncedSearch, loadVendors]);

  const addVendor = useCallback(
    async (vendorData: any) => {
      setSaving(true);
      try {
        await axios.post(
          USERS_API_BASE,
          { ...vendorData, isCabVendor: true },
          { withCredentials: true }
        );
        await loadVendors(page, rowsPerPage, debouncedSearch);
      } catch (err) {
        console.error("Failed to add vendor:", err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [loadVendors, page, rowsPerPage, debouncedSearch]
  );

  const updateVendor = useCallback(
    async (vendorId: string, vendorData: any) => {
      setSaving(true);
      try {
        await axios.patch(
          `${USERS_API_BASE}/${vendorId}`,
          { ...vendorData, isCabVendor: true }, // ensure it remains a vendor
          { withCredentials: true }
        );
        await loadVendors(page, rowsPerPage, debouncedSearch);
      } catch (err) {
        console.error("Failed to update vendor:", err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [loadVendors, page, rowsPerPage, debouncedSearch]
  );

  return {
    employees,
    loading,
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
    error,
    loadVendors,
    reload: loadVendors,
  };
}
