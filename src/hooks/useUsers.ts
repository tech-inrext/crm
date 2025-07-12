import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { EMPLOYEE_API_BASE } from "@/constants/leads";

// Minimal user/employee type for now
export interface Employee {
  _id?: string;
  name: string;
  email: string;
  designation?: string;
  roles?: Array<{ _id: string; name: string }>;
  role?: { _id: string; name: string } | string;
  [key: string]: any;
}

export function useUsers() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  // Only run data fetching on client to avoid SSR hydration mismatch
  useEffect(() => {
    if (typeof window === "undefined") return;
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!search) return employees;
    return employees.filter((e) =>
      [e.name, e.email, e.designation]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search.toLowerCase()))
    );
  }, [employees, search]);

  const rows = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(EMPLOYEE_API_BASE);
      setEmployees(response.data.data || response.data || []);
    } catch (error) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = async (id, values) => {
    setSaving(true);
    const allowedFields = [
      "name",
      "altPhone",
      "address",
      "gender",
      "age",
      "designation",
      "managerId",
      "departmentId",
      "roles",
    ];
    const payload = {};
    for (const key of allowedFields) {
      if (values[key] !== undefined && values[key] !== "") {
        payload[key] = values[key];
      }
    }
    try {
      await axios.patch(`/api/v0/employee/${id}`, payload);
    } catch (e) {
      console.error("Failed to update user", e);
    } finally {
      setSaving(false);
    }
  };

  const addUser = async (values) => {
    setSaving(true);
    // Backend-required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "designation",
      "managerId",
      "departmentId",
      "roles",
    ];
    const allowedFields = [
      ...requiredFields,
      "gender",
      "age",
      "altPhone",
      "joiningDate",
    ];
    const payload = {};
    for (const key of allowedFields) {
      if (key === "roles") {
        // Ensure roles is an array of string IDs
        if (Array.isArray(values.roles) && values.roles.length > 0) {
          payload.roles = values.roles
            .map((role) =>
              typeof role === "string"
                ? role
                : role?._id || role?.value || role?.name || ""
            )
            .filter((id) => typeof id === "string" && id.trim() !== "");
        }
      } else if (key === "managerId" || key === "departmentId") {
        // Ensure these are non-empty strings
        if (
          values[key] &&
          typeof values[key] === "string" &&
          values[key].trim() !== ""
        ) {
          payload[key] = values[key].trim();
        }
      } else if (key === "phone") {
        // Always send phone as string
        if (values[key] !== undefined && values[key] !== "") {
          payload[key] = String(values[key]);
        }
      } else {
        if (values[key] !== undefined && values[key] !== "") {
          payload[key] = values[key];
        }
      }
    }
    // Validate required fields
    const missingFields = requiredFields.filter((field) => {
      if (field === "roles") {
        return !Array.isArray(payload.roles) || payload.roles.length === 0;
      }
      return (
        !payload[field] ||
        (typeof payload[field] === "string" && payload[field].trim() === "")
      );
    });
    if (missingFields.length > 0) {
      setSaving(false);
      alert(`Please fill all required fields: ${missingFields.join(", ")}`);
      return;
    }
    console.log("AddUser payload:", payload);
    try {
      const response = await axios.post(EMPLOYEE_API_BASE, payload);
      console.log("AddUser response:", response.data);
      setOpen(false);
      setForm({});
      setEditId(null);
      loadEmployees();
    } catch (e) {
      console.error("Failed to add user", e);
      const msg = e?.response?.data?.message || e?.message || "Unknown error";
      alert(`Failed to add user: ${msg}`);
      throw e;
    } finally {
      setSaving(false);
    }
    // If you do not see the payload log or network request, check your dialog's onSubmit wiring and authentication/session.
  };

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
    open,
    setOpen,
    editId,
    setEditId,
    form,
    setForm,
    filtered,
    rows,
    loadEmployees,
    updateUser,
    addUser, // <-- Make addUser available to consumers
  };
}

export function useLiveRoles(): string[] {
  let lastRolesString: string | null = null;
  let lastRolesArray: string[] = [];

  function subscribeToRoles(callback: () => void) {
    const handler = (e: StorageEvent) => {
      if (e.key === "roleNames") {
        lastRolesString = null;
        lastRolesArray = [];
        callback();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }

  function getSnapshotForRoles(): string[] {
    try {
      const saved = localStorage.getItem("roleNames");
      if (!saved || saved === "null" || saved === "undefined") {
        if (lastRolesString !== null || lastRolesArray.length > 0) {
          lastRolesString = null;
          lastRolesArray = [];
        }
        return lastRolesArray;
      }
      if (saved === lastRolesString) {
        return lastRolesArray;
      }
      lastRolesString = saved;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        lastRolesArray = parsed
          .map((role) => {
            if (typeof role === "string") {
              return role.trim();
            } else if (role && typeof role === "object" && role.name) {
              return String(role.name).trim();
            } else if (role && typeof role === "object" && role.value) {
              return String(role.value).trim();
            } else {
              return String(role).trim();
            }
          })
          .filter((role) => role && role.length > 0);
      } else {
        lastRolesArray = [];
      }
      return lastRolesArray;
    } catch (error) {
      lastRolesString = null;
      lastRolesArray = [];
      return lastRolesArray;
    }
  }

  const [roles, setRoles] = useState<string[]>(getSnapshotForRoles());

  useEffect(() => {
    const unsubscribe = subscribeToRoles(() => {
      setRoles(getSnapshotForRoles());
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return roles;
}
