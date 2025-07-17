import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { EMPLOYEE_API_BASE } from "@/constants/leads";

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
  const [page, setPage] = useState(1); // 1-based indexing
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState(""); // raw user input

  const loadEmployees = useCallback(
    async (page = 1, limit = 5, search = "") => {
      setLoading(true);
      try {
        const response = await axios.get(EMPLOYEE_API_BASE, {
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

  return {
    employees,
    loading,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    reload: loadEmployees,
  };
}
