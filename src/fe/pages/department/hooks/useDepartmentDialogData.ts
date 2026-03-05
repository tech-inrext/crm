"use client";

import { useMemo } from "react";
import { useGetManagersQuery } from "@/fe/pages/department/departmentApi";
import type { ManagerItem } from "@/fe/pages/department/types";

const EMPTY_MANAGERS: ManagerItem[] = [];

export const useDepartmentDialogData = (_open: boolean) => {
  const { data: managersData, loading: managersLoading } = useGetManagersQuery({
    isCabVendor: false,
    limit: 1000,
    page: 1,
  });

  const managers = useMemo<ManagerItem[]>(
    () => (managersData as any)?.data ?? managersData ?? EMPTY_MANAGERS,
    [managersData],
  );

  return { managers, loading: managersLoading };
};
