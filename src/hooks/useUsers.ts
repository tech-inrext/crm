import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { USERS_API_BASE } from "@/constants/users";

export interface Employee {
  _id?: string;
  name: string;
  email: string;
  designation?: string;
  roles?: Array<{ _id: string; name: string }>;
  [key: string]: any;
}

export function useUsers(debouncedSearch: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1); // 1-based indexing
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState(""); // raw user input
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({});

  const loadEmployees = useCallback(
    async (page = 1, limit = 5, search = "") => {
      setLoading(true);
      try {
        const response = await axios.get(USERS_API_BASE, {
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
        console.error("Failed to load employees:", error);
        setEmployees([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadEmployees(page, rowsPerPage, debouncedSearch);
  }, [page, rowsPerPage, debouncedSearch, loadEmployees]);

  const addUser = useCallback(async (userData: any) => {
    setSaving(true);
    try {
      await axios.post(USERS_API_BASE, userData);
      await loadEmployees(page, rowsPerPage, debouncedSearch);
    } catch (error) {
      console.error("Failed to add user:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [page, rowsPerPage, debouncedSearch, loadEmployees]);

  const updateUser = useCallback(async (id: string, userData: any) => {
    setSaving(true);
    try {
      await axios.patch(`${USERS_API_BASE}/${id}`, userData);
      await loadEmployees(page, rowsPerPage, debouncedSearch);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [page, rowsPerPage, debouncedSearch, loadEmployees]);

  return {
    employees,
    loading,
    saving,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    open,
    setOpen,
    editId,
    setEditId,
    form,
    setForm,
    addUser,
    updateUser,
    loadEmployees,
    reload: loadEmployees,
  };
}
