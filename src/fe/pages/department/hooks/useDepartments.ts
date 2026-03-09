"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import {
  DEPARTMENTS_API_BASE,
  DEPARTMENT_CACHE_KEYS,
} from "@/fe/pages/department/constants/departments";
import useMutation from "@/fe/hooks/createMutation";
import { useGetDepartmentsQuery } from "@/fe/pages/department/departmentApi";
import type {
  Department,
  DepartmentFormData,
} from "@/fe/pages/department/types";

// ─── Shared hook config ────────────────────────────────────────────────────

const MUTATION_CONFIG = {
  maxRetries: 2,
  retryDelayMs: 300,
} as const;

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useDepartments(debouncedSearch: string) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<DepartmentFormData>>({});

  // ── READ: department list ────────────────────────────────────────────────
  const {
    data: departmentsData,
    loading,
    page,
    rowsPerPage,
    refetch: loadDepartments,
    goToPage: setPage,
    setPageSize: setRowsPerPage,
  } = useGetDepartmentsQuery({ search: debouncedSearch });

  const departments: Department[] = Array.isArray(
    (departmentsData as any)?.data,
  )
    ? (departmentsData as any).data
    : Array.isArray(departmentsData)
      ? (departmentsData as Department[])
      : [];

  // ── CREATE mutation ──────────────────────────────────────────────────────
  const {
    mutate: createMutate,
    loading: createLoading,
    error: createError,
    abort: abortCreate,
  } = useMutation<DepartmentFormData, Department>(
    DEPARTMENTS_API_BASE,
    "post",
    undefined,
    MUTATION_CONFIG,
  );

  // ── UPDATE mutation ──────────────────────────────────────────────────────
  const {
    mutate: updateMutate,
    loading: updateLoading,
    error: updateError,
    abort: abortUpdate,
  } = useMutation<Partial<DepartmentFormData>, Department>(
    DEPARTMENTS_API_BASE,
    "patch",
    undefined,
    MUTATION_CONFIG,
  );

  // ── DELETE mutation ──────────────────────────────────────────────────────
  const {
    mutate: deleteMutate,
    loading: deleteLoading,
    error: deleteError,
    abort: abortDelete,
  } = useMutation<Record<string, never>, void>(
    DEPARTMENTS_API_BASE,
    "delete",
    undefined,
    MUTATION_CONFIG,
  );

  const saving = createLoading || updateLoading;

  // ── addDepartment ─────────────────────────────────────────────────────
  const addDepartment = useCallback(
    async (
      formData: DepartmentFormData,
      options?: { onSuccess?: (dept: Department) => void },
    ) => {
      return createMutate(formData, {
        invalidateKeys: [DEPARTMENT_CACHE_KEYS.DEPARTMENTS],
        onSuccess: options?.onSuccess,
        refetch: loadDepartments,
      });
    },
    [createMutate, loadDepartments],
  );

  // ── updateDepartment ──────────────────────────────────────────────────
  const updateDepartment = useCallback(
    async (
      id: string,
      formData: DepartmentFormData,
      options?: { onSuccess?: (dept: Department) => void },
    ) => {
      return updateMutate(formData, {
        url: `${DEPARTMENTS_API_BASE}/${id}`,
        invalidateKeys: [
          DEPARTMENT_CACHE_KEYS.DEPARTMENTS,
          DEPARTMENT_CACHE_KEYS.DEPARTMENT_BY_ID(id),
        ],
        onSuccess: options?.onSuccess,
        refetch: loadDepartments,
      });
    },
    [updateMutate, loadDepartments],
  );

  // ── deleteDepartment ──────────────────────────────────────────────────
  const deleteDepartment = useCallback(
    async (id: string, options?: { onSuccess?: () => void }) => {
      return deleteMutate({} as Record<string, never>, {
        url: `${DEPARTMENTS_API_BASE}/${id}`,
        invalidateKeys: [
          DEPARTMENT_CACHE_KEYS.DEPARTMENTS,
          DEPARTMENT_CACHE_KEYS.DEPARTMENT_BY_ID(id),
        ],
        onSuccess: options?.onSuccess,
        refetch: loadDepartments,
      });
    },
    [deleteMutate, loadDepartments],
  );

  // ── getDepartmentById ──────────────────────────────────────────────────
  const getDepartmentById = useCallback(
    async (id: string): Promise<Department | null> => {
      const local = departments.find((d) => d.id === id || d._id === id);
      if (local) return local;
      try {
        const resp = await axios.get<{ data?: Department } | Department>(
          `${DEPARTMENTS_API_BASE}/${id}`,
          { withCredentials: true },
        );
        const d = resp.data as any;
        return d?.data ?? d ?? null;
      } catch (err) {
        console.error("[useDepartments] getDepartmentById failed:", err);
        return null;
      }
    },
    [departments],
  );

  // ── Convenience abort-all ──────────────────────────────────────────────
  const abortAll = useCallback(() => {
    abortCreate();
    abortUpdate();
    abortDelete();
  }, [abortCreate, abortUpdate, abortDelete]);

  return {
    departments,
    loading,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    loadDepartments,
    open,
    setOpen,
    editId,
    setEditId,
    form,
    setForm,
    saving,
    createError,
    updateError,
    deleteError,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    abortAll,
  };
}
