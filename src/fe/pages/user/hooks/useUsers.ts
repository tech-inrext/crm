"use client";

import { useEffect, useState, useCallback } from "react";
import { userService } from "@/fe/pages/user/user.service";
import { uploadFile } from "@/fe/pages/user/utils/uploadFile";
import { DEFAULT_PAGE_SIZE } from "@/fe/pages/user/constants/users";
import type { Employee, FetchUsersParams, UserFormData } from "@/fe/pages/user/types";

// Files that need to be uploaded before sending to the API
type FileKeys = "aadharFile" | "panFile" | "bankProofFile" | "signatureFile" | "photoFile";
type UrlKeys = "aadharUrl" | "panUrl" | "bankProofUrl" | "signatureUrl" | "photo";

const FILE_TO_URL_MAP: Record<FileKeys, UrlKeys> = {
  aadharFile: "aadharUrl",
  panFile: "panUrl",
  bankProofFile: "bankProofUrl",
  signatureFile: "signatureUrl",
  photoFile: "photo",
};

/**
 * Uploads any File fields in the form and returns a clean payload
 * (file objects removed, URLs populated).
 */
async function resolveFileUploads(
  formData: UserFormData,
): Promise<Omit<UserFormData, FileKeys>> {
  const payload = { ...formData } as Record<string, unknown>;

  await Promise.all(
    (Object.entries(FILE_TO_URL_MAP) as [FileKeys, UrlKeys][]).map(
      async ([fileKey, urlKey]) => {
        const file = formData[fileKey];
        if (file instanceof File) {
          payload[urlKey] = await uploadFile(file);
        }
        delete payload[fileKey];
      },
    ),
  );

  return payload as Omit<UserFormData, FileKeys>;
}

export function useUsers(debouncedSearch: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UserFormData>>({});

  const loadEmployees = useCallback(
    async (params: FetchUsersParams = {}) => {
      setLoading(true);
      try {
        const response = await userService.getUsers({
          page: params.page ?? 1,
          limit: params.limit ?? DEFAULT_PAGE_SIZE,
          search: params.search?.trim() || undefined,
          isCabVendor: params.isCabVendor ?? false,
        });
        setEmployees(response.data ?? []);
        setTotalItems(response.pagination?.totalItems ?? 0);
      } catch (error) {
        console.error("[useUsers] Failed to load employees:", error);
        setEmployees([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadEmployees({ page, limit: rowsPerPage, search: debouncedSearch });
  }, [page, rowsPerPage, debouncedSearch, loadEmployees]);

  const reload = useCallback(
    () => loadEmployees({ page, limit: rowsPerPage, search: debouncedSearch }),
    [page, rowsPerPage, debouncedSearch, loadEmployees],
  );

  const addUser = useCallback(
    async (formData: UserFormData) => {
      setSaving(true);
      try {
        const payload = await resolveFileUploads(formData);
        await userService.createUser(payload);
        await reload();
      } catch (error) {
        console.error("[useUsers] Failed to create user:", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [reload],
  );

  const updateUser = useCallback(
    async (id: string, formData: UserFormData) => {
      setSaving(true);
      try {
        const payload = await resolveFileUploads(formData);
        await userService.updateUser(id, payload);
        await reload();
      } catch (error) {
        console.error("[useUsers] Failed to update user:", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [reload],
  );

  const getUserById = useCallback(async (id: string): Promise<Employee | null> => {
    try {
      return await userService.getUserById(id);
    } catch (error) {
      console.error("[useUsers] Failed to fetch user by id:", error);
      return null;
    }
  }, []);

  return {
    employees,
    loading,
    saving,
    page, setPage,
    rowsPerPage, setRowsPerPage,
    totalItems,
    open, setOpen,
    editId, setEditId,
    form, setForm,
    addUser,
    updateUser,
    getUserById,
    loadEmployees: reload,
    reload,
  };
}
