"use client";

import { useEffect, useState } from "react";
import { userService } from "@/fe/pages/user/user.service";
import type { RoleItem, ManagerItem, DepartmentItem } from "@/fe/pages/user/types";

export const useUserDialogData = (open: boolean) => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [managers, setManagers] = useState<ManagerItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        userService.getRoles(),
        userService.getManagers({ isCabVendor: false, limit: 1000, page: 1 }),
        userService.getDepartments(),
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
