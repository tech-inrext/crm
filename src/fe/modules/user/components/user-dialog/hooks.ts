import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  USERS_API_BASE,
  ROLES_API_BASE,
  DEPARTMENTS_API_BASE,
} from "@/fe/modules/user/constants/users";

export const useUserDialogData = (open: boolean) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([
        axios.get(ROLES_API_BASE),
        axios.get(USERS_API_BASE),
        axios.get(DEPARTMENTS_API_BASE, { withCredentials: true }),
      ])
        .then(([rolesRes, managersRes, departmentsRes]) => {
          setRoles(rolesRes.data.data || []);
          setManagers(managersRes.data.data || []);
          setDepartments(departmentsRes.data.data || []);
        })
        .catch((error) => {
          console.error("Error loading dialog data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  return { roles, managers, departments, loading };
};
