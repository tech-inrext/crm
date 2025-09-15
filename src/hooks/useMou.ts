import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { EMPLOYEE_API_BASE } from "@/constants/leads";
import { useAuth } from "@/contexts/AuthContext";

export function useMou(initialStatus = "Pending") {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(initialStatus);

  const load = useCallback(
    async (p = page, limit = rowsPerPage, s = search, st = status) => {
      setLoading(true);
      try {
        // Determine if current user is system admin by checking their currentRole
        let isSystemAdmin = false;
        if (user) {
          const cur = user.currentRole;
          if (cur && typeof cur !== "string") {
            isSystemAdmin = Boolean((cur as any).isSystemAdmin);
          } else if (user.roles && Array.isArray(user.roles)) {
            // If currentRole is an id string, find that role object in user.roles
            const roleObj = user.roles.find((r: any) => r._id === cur);
            if (roleObj) isSystemAdmin = Boolean(roleObj.isSystemAdmin);
          }
        }

        const params: any = {
          page: p,
          limit,
          search: s?.trim() || undefined,
          mouStatus: st || undefined,
        };

        // Only include managerId when user is present and NOT a system admin
        if (user && user._id && !isSystemAdmin) {
          params.managerId = user._id;
        }

        const resp = await axios.get(EMPLOYEE_API_BASE, { params });
        const { data, pagination } = resp.data || {};
        setItems(data || []);
        setTotalItems(pagination?.totalItems || (data ? data.length : 0));
      } catch (e) {
        console.error("useMou: failed to load", e);
        setItems([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [page, rowsPerPage, search, status, user]
  );

  useEffect(() => {
    load(page, rowsPerPage, search, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, status]);

  const markStatus = useCallback(async (id: string, newStatus: string) => {
    try {
      const payload: any = {};
      payload.mouStatus = newStatus;
      const resp = await axios.patch(`${EMPLOYEE_API_BASE}/${id}`, payload);
      // optimistically update local item
      setItems((prev) => prev.map((it) => (it._id === id ? resp.data.data : it)));
      return resp.data.data;
    } catch (e) {
      console.error("useMou: failed to update status", e);
      throw e;
    }
  }, []);

  return {
    items,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    search,
    setSearch,
    status,
    setStatus,
    load,
    markStatus,
  };
}
