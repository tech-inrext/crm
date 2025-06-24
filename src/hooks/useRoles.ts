import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ROLE_API_BASE } from "@/constants/leads";
import { transformAPIRole } from "@/utils/leadUtils";

export function useRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(ROLE_API_BASE, { withCredentials: true });
      const apiRoles = response.data.data || response.data;
      const transformedRoles = apiRoles.map(transformAPIRole);
      setRoles(transformedRoles);
    } catch (error) {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return { roles, loading, loadRoles };
}
