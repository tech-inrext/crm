"use client";

import { useMemo } from "react";
import {
  useGetRolesQuery,
  useGetManagersQuery,
  useGetDepartmentsQuery,
} from "@/fe/pages/user/userApi";
import type {
  RoleItem,
  ManagerItem,
  DepartmentItem,
} from "@/fe/pages/user/types";

// Stable empty arrays — reused across renders so array references never change
const EMPTY_ROLES: RoleItem[] = [];
const EMPTY_MANAGERS: ManagerItem[] = [];
const EMPTY_DEPTS: DepartmentItem[] = [];

export const useUserDialogData = (_open: boolean) => {
  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery();
  const { data: managersData, loading: managersLoading } = useGetManagersQuery({
    isCabVendor: false,
    limit: 1000,
    page: 1,
  });
  const { data: departmentsData, loading: departmentsLoading } =
    useGetDepartmentsQuery();

  // useMemo so derived arrays only get a new reference when the raw data changes
  const roles = useMemo<RoleItem[]>(
    () => (rolesData as any)?.data ?? rolesData ?? EMPTY_ROLES,
    [rolesData],
  );
  const managers = useMemo<ManagerItem[]>(
    () => (managersData as any)?.data ?? managersData ?? EMPTY_MANAGERS,
    [managersData],
  );
  const departments = useMemo<DepartmentItem[]>(
    () => (departmentsData as any)?.data ?? departmentsData ?? EMPTY_DEPTS,
    [departmentsData],
  );

  const loading = rolesLoading || managersLoading || departmentsLoading;

  return { roles, managers, departments, loading };
};
