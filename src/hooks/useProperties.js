import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { PROPERTY_API_BASE } from "@/constants/property";

export function useProperties(page, rowsPerPage, search) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(PROPERTY_API_BASE, {
        withCredentials: true,
        params: { page, limit: rowsPerPage, search },
      });
      setProperties(response.data.data || []);
      setTotal(response.data.pagination?.totalItems || 0);
    } catch (error) {
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  return { properties, loading, total, loadProperties };
}