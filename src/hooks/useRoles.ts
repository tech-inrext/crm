// ✅ UPDATED useRoles hook with backend pagination + search
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ROLE_API_BASE } from "@/constants/leads";
import { transformAPIRole } from "@/utils/leadUtils";

export function useRoles(page, rowsPerPage, search) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(ROLE_API_BASE, {
        withCredentials: true,
        params: { page, limit: rowsPerPage, search },
      });
      const apiRoles = response.data.data || response.data;
      const transformedRoles = apiRoles.map(transformAPIRole);
      setRoles(transformedRoles);
      setTotal(response.data.pagination.totalItems || 0);
    } catch (error) {
      setRoles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return { roles, loading, total, loadRoles };
}
