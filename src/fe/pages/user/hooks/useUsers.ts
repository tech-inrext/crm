"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { uploadFile } from "@/fe/pages/user/utils/uploadFile";
import {
  USERS_API_BASE,
  USER_CACHE_KEYS,
} from "@/fe/pages/user/constants/users";
import useMutation from "@/fe/hooks/useMutation";
import { useGetUsersQuery } from "@/fe/pages/user/userApi";
import type { Employee, UserFormData } from "@/fe/pages/user/types";

// ─── Internal types ────────────────────────────────────────────────────────

type FileKeys =
  | "aadharFile"
  | "panFile"
  | "bankProofFile"
  | "signatureFile"
  | "photoFile";

type UrlKeys =
  | "aadharUrl"
  | "panUrl"
  | "bankProofUrl"
  | "signatureUrl"
  | "photo";

export type UserPayload = Omit<UserFormData, FileKeys>;

// ─── File → URL map ────────────────────────────────────────────────────────

const FILE_TO_URL_MAP: Record<FileKeys, UrlKeys> = {
  aadharFile: "aadharUrl",
  panFile: "panUrl",
  bankProofFile: "bankProofUrl",
  signatureFile: "signatureUrl",
  photoFile: "photo",
};

// ─── Shared hook config ────────────────────────────────────────────────────

const MUTATION_CONFIG = {
  maxRetries: 2,
  retryDelayMs: 300,
} as const;

// ─── File upload resolver ──────────────────────────────────────────────────

/**
 * Converts any File fields in the form data to S3 URLs in parallel.
 * Non-file fields are passed through unchanged.
 */
async function resolveFileUploads(
  formData: UserFormData,
): Promise<UserPayload> {
  const payload: Record<string, unknown> = {};
  const uploads: Promise<void>[] = [];

  for (const [key, value] of Object.entries(formData) as [
    keyof UserFormData,
    unknown,
  ][]) {
    const urlKey = FILE_TO_URL_MAP[key as FileKeys];

    if (urlKey && value instanceof File) {
      // Fan out all uploads in parallel — resolved below with Promise.all
      uploads.push(
        uploadFile(value).then((url) => {
          if (url) payload[urlKey] = url;
        }),
      );
    } else {
      payload[key as string] = value;
    }
  }

  await Promise.all(uploads);
  return payload as UserPayload;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useUsers(debouncedSearch: string) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UserFormData>>({});

  // ── READ: paginated employee list ────────────────────────────────────────
  const queryState = useGetUsersQuery({ search: debouncedSearch });
  const {
    items: employees,
    loading,
    refetch: loadEmployees,
    setPage,
    setPageSize: setRowsPerPage,
  } = queryState;
  // ── CREATE mutation ──────────────────────────────────────────────────────
  const {
    mutate: createMutate,
    loading: createLoading,
    error: createError,
    abort: abortCreate,
    retryCount: createRetryCount,
  } = useMutation<UserPayload, Employee>(
    USERS_API_BASE,
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
    retryCount: updateRetryCount,
  } = useMutation<Partial<UserPayload>, Employee>(
    USERS_API_BASE,
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
    USERS_API_BASE,
    "delete",
    undefined,
    MUTATION_CONFIG,
  );

  const saving = createLoading || updateLoading;

  // ── addUser ────────────────────────────────────────────────────────────
  const addUser = useCallback(
    async (
      formData: UserFormData,
      options?: { onSuccess?: (employee: Employee) => void },
    ) => {
      const payload = await resolveFileUploads(formData);
      return createMutate(payload, {
        onSuccess: options?.onSuccess,
      });
    },
    [createMutate, loadEmployees],
  );

  // ── updateUser ─────────────────────────────────────────────────────────
  const updateUser = useCallback(
    async (
      id: string,
      formData: UserFormData,
      options?: { onSuccess?: (employee: Employee) => void },
    ) => {
      const payload = await resolveFileUploads(formData);
      return updateMutate(payload, {
        url: `${USERS_API_BASE}/${id}`,
        onSuccess: options?.onSuccess,
      });
    },
    [updateMutate, loadEmployees],
  );

  // ── deleteUser ─────────────────────────────────────────────────────────
  const deleteUser = useCallback(
    async (id: string, options?: { onSuccess?: () => void }) => {
      return deleteMutate({} as Record<string, never>, {
        url: `${USERS_API_BASE}/${id}`,
        onSuccess: options?.onSuccess,
      });
    },
    [deleteMutate, loadEmployees],
  );

  // ── getUserById ────────────────────────────────────────────────────────
  // Fetches a single employee, checking the local list first before hitting
  // the network. Falls back gracefully and never throws to the caller.
  const getUserById = useCallback(
    async (id: string): Promise<Employee | null> => {
      // Fast path: avoid network round-trip if already in the loaded list
      const local = employees.find((e) => e.id === id || e._id === id);
      if (local) return local;
      try {
        const resp = await axios.get<{ data?: Employee } | Employee>(
          `${USERS_API_BASE}/${id}`,
          { withCredentials: true },
        );
        const d = resp.data as any;
        return d?.data ?? d ?? null;
      } catch (err) {
        console.error("[useUsers] getUserById failed:", err);
        return null;
      }
    },
    [employees],
  );

  // ── Convenience abort-all ──────────────────────────────────────────────
  const abortAll = useCallback(() => {
    abortCreate();
    abortUpdate();
    abortDelete();
  }, [abortCreate, abortUpdate, abortDelete]);

  return {
    // Query state from createApi
    queryState: {
      loading,
      page: queryState.page,
      rowsPerPage: queryState.rowsPerPage,
      totalItems: queryState.totalItems,
      setPage,
      setPageSize: setRowsPerPage,
    },
    employees,
    loadEmployees,
    // Dialog state
    open,
    setOpen,
    editId,
    setEditId,
    form,
    setForm,
    // Mutation state
    saving,
    createError,
    updateError,
    deleteError,
    // Actions
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    abortAll,
  };
}
