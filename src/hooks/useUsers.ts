import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { USERS_API_BASE, DEFAULT_PAGE_SIZE } from "@/constants/users";

export interface Employee {
  _id?: string;
  name: string;
  email: string;
  designation?: string;
  roles?: Array<{ _id: string; name: string }>;
  isCabVendor?: boolean;
  [key: string]: any;
}

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
      isCabVendor: boolean | undefined = false // ← only non-vendors by default
    ) => {
      setLoading(true);
      try {
        const response = await axios.get(USERS_API_BASE, {
          params: {
            page,
            limit,
            search: search.trim() || undefined,
            ...(typeof isCabVendor === "boolean" ? { isCabVendor } : {}), // ← sends ?isCabVendor=false
          },
        });

        const { data, pagination } = response.data;
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
    []
  );

  useEffect(() => {
    // pass isCabVendor=false explicitly
    loadEmployees(page, rowsPerPage, debouncedSearch, false);
  }, [page, rowsPerPage, debouncedSearch, loadEmployees]);

  const addUser = useCallback(
    async (userData: any) => {
      setSaving(true);
      try {
        // If files are present, upload them to S3 first using presigned URL
        const uploadFile = async (file: File | null) => {
          if (!file) return null;
          const presignRes = await axios.post(
            "/api/v0/s3/upload-url",
            { fileName: file.name, fileType: file.type },
            { headers: { "Content-Type": "application/json" } }
          );
          const { uploadUrl, fileUrl } = presignRes.data;
          // PUT to uploadUrl
          await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
          return fileUrl;
        };

        const payload = { ...userData };
  console.debug("[addUser] payload before uploads:", payload);
        if (userData.aadharFile) payload.aadharUrl = await uploadFile(userData.aadharFile);
        if (userData.panFile) payload.panUrl = await uploadFile(userData.panFile);
        if (userData.bankProofFile) payload.bankProofUrl = await uploadFile(userData.bankProofFile);
  if (userData.signatureFile) payload.signatureUrl = await uploadFile(userData.signatureFile);

        // Remove file objects before sending
        delete payload.aadharFile;
        delete payload.panFile;
        delete payload.bankProofFile;
  delete payload.signatureFile;

        await axios.post(USERS_API_BASE, payload);
  console.debug("[addUser] POST completed");
        await loadEmployees(page, rowsPerPage, debouncedSearch, false);
      } catch (error) {
        // Normalize axios errors so caller can show friendly messages
        console.error("Failed to add user:", error);
        // If axios error with response, include status and message
        if (error && error.response) {
          const { status, data } = error.response;
          const message = (data && data.message) || error.message || "Request failed";
          const err = new Error(message);
          // @ts-ignore attach status for callers that want to inspect it
          err.status = status;
          throw err;
        }
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [page, rowsPerPage, debouncedSearch, loadEmployees]
  );

  const updateUser = useCallback(
    async (id: string, userData: any) => {
      setSaving(true);
      try {
        // handle file uploads same as addUser
        const uploadFile = async (file: File | null) => {
          if (!file) return null;
          const presignRes = await axios.post(
            "/api/v0/s3/upload-url",
            { fileName: file.name, fileType: file.type },
            { headers: { "Content-Type": "application/json" } }
          );
          const { uploadUrl, fileUrl } = presignRes.data;
          await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
          return fileUrl;
        };

        const payload = { ...userData };
        if (userData.aadharFile) payload.aadharUrl = await uploadFile(userData.aadharFile);
        if (userData.panFile) payload.panUrl = await uploadFile(userData.panFile);
        if (userData.bankProofFile) payload.bankProofUrl = await uploadFile(userData.bankProofFile);
  if (userData.signatureFile) payload.signatureUrl = await uploadFile(userData.signatureFile);
        delete payload.aadharFile;
        delete payload.panFile;
        delete payload.bankProofFile;
  delete payload.signatureFile;

        await axios.patch(`${USERS_API_BASE}/${id}`, payload);
        await loadEmployees(page, rowsPerPage, debouncedSearch, false);
      } catch (error) {
        console.error("Failed to update user:", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [page, rowsPerPage, debouncedSearch, loadEmployees]
  );

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
    reload: loadEmployees,
  };
}

