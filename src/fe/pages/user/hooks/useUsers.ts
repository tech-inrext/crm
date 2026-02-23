"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchUsers,
  createUser,
  updateUserById,
  fetchUserById,
  getUploadUrl,
  uploadFileToUrl,
} from "@/fe/pages/user/user.service";
import { DEFAULT_PAGE_SIZE } from "@/fe/pages/user/constants/users";

import type { Employee } from "@/fe/pages/user/types";

export function useUsers(debouncedSearch: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({});

  const loadEmployees = useCallback(
    async (
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
      search = "",
      isCabVendor: boolean | undefined = false,
    ) => {
      setLoading(true);
      try {
        const params: any = { page, limit };
        if (search && search.trim()) params.search = search.trim();
        if (typeof isCabVendor === "boolean") params.isCabVendor = isCabVendor;
        const response = await fetchUsers(params);
        const { data, pagination } = response;
        setEmployees(data || []);
        setTotalItems(pagination?.totalItems || 0);
      } catch (error) {
        console.error("Failed to load employees:", error);
        setEmployees([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadEmployees(page, rowsPerPage, debouncedSearch, false);
  }, [page, rowsPerPage, debouncedSearch, loadEmployees]);

  const addUser = useCallback(
    async (userData: any) => {
      setSaving(true);
      try {
        const uploadFile = async (file: File | null) => {
          if (!file) return null;
          const presign = await getUploadUrl(file.name, file.type);
          const { uploadUrl, fileUrl } = presign;
          await uploadFileToUrl(uploadUrl, file);
          return fileUrl;
        };

        const payload = { ...userData };
        if (userData.aadharFile)
          payload.aadharUrl = await uploadFile(userData.aadharFile);
        if (userData.panFile)
          payload.panUrl = await uploadFile(userData.panFile);
        if (userData.bankProofFile)
          payload.bankProofUrl = await uploadFile(userData.bankProofFile);
        if (userData.signatureFile)
          payload.signatureUrl = await uploadFile(userData.signatureFile);
        if (userData.photoFile)
          payload.photo = await uploadFile(userData.photoFile);

        delete payload.aadharFile;
        delete payload.panFile;
        delete payload.bankProofFile;
        delete payload.signatureFile;
        delete payload.photoFile;

        await createUser(payload);
        await loadEmployees(page, rowsPerPage, debouncedSearch, false);
      } catch (error) {
        console.error("Failed to add user:", error);
        // rethrow so callers can show errors
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [page, rowsPerPage, debouncedSearch, loadEmployees],
  );

  const updateUser = useCallback(
    async (id: string, userData: any) => {
      setSaving(true);
      try {
        const uploadFile = async (file: File | null) => {
          if (!file) return null;
          const presign = await getUploadUrl(file.name, file.type);
          const { uploadUrl, fileUrl } = presign;
          await uploadFileToUrl(uploadUrl, file);
          return fileUrl;
        };

        const payload = { ...userData };
        if (userData.aadharFile)
          payload.aadharUrl = await uploadFile(userData.aadharFile);
        if (userData.panFile)
          payload.panUrl = await uploadFile(userData.panFile);
        if (userData.bankProofFile)
          payload.bankProofUrl = await uploadFile(userData.bankProofFile);
        if (userData.signatureFile)
          payload.signatureUrl = await uploadFile(userData.signatureFile);
        if (userData.photoFile)
          payload.photo = await uploadFile(userData.photoFile);
        delete payload.aadharFile;
        delete payload.panFile;
        delete payload.bankProofFile;
        delete payload.signatureFile;
        delete payload.photoFile;

        await updateUserById(id, payload);
        await loadEmployees(page, rowsPerPage, debouncedSearch, false);
      } catch (error) {
        console.error("Failed to update user:", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [page, rowsPerPage, debouncedSearch, loadEmployees],
  );

  const getUserById = useCallback(async (id: string) => {
    try {
      return await fetchUserById(id);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }, []);

  return {
    employees,
    loading,
    saving,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    open,
    setOpen,
    editId,
    setEditId,
    form,
    setForm,
    addUser,
    updateUser,
    loadEmployees,
    getUserById,
    reload: loadEmployees,
  };
}
