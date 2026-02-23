"use client";

import { useEffect, useState } from "react";
import {
  fetchRoles,
  fetchManagers,
  fetchDepartments,
} from "@/fe/pages/user/user.service";

export const useUserDialogData = (open: boolean) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        fetchRoles(),
        fetchManagers({ isCabVendor: false, limit: 1000, page: 1 }),
        fetchDepartments(),
      ])
        .then(([r, m, d]) => {
          setRoles(r || []);
          setManagers(m || []);
          setDepartments(d || []);
        })
        .catch((err) => {
          console.error("Error loading dialog data:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  return { roles, managers, departments, loading };
};
