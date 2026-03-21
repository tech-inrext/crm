"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type {
  Department,
  DepartmentFormData,
} from "@/fe/pages/department/types";

type DialogMode = "add" | "edit";

interface UseDepartmentDialogProps {
  departments: Department[];
  loading: boolean;
  getDepartmentById: (id: string) => Promise<Department | null>;
  setEditId: (id: string | null) => void;
  setOpen: (open: boolean) => void;
  setForm: (form: Partial<DepartmentFormData>) => void;
  defaultForm: Partial<DepartmentFormData>;
}

export function useDepartmentDialog({
  departments,
  loading,
  getDepartmentById,
  setEditId,
  setOpen,
  setForm,
  defaultForm,
}: UseDepartmentDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dialogMode, setDialogMode] = useState<DialogMode>("add");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  // Handle URL-driven dialog opening (e.g. from notification redirects)
  useEffect(() => {
    if (loading) return;

    const openDialogParam = searchParams.get("openDialog");
    const deptIdParam = searchParams.get("deptId");
    const modeParam = searchParams.get("mode");

    if (openDialogParam !== "true" || !deptIdParam) return;

    const mode: DialogMode = "edit";
    void modeParam; // kept for URL compat but view mode removed

    const local = departments.find(
      (d) => d.id === deptIdParam || d._id === deptIdParam,
    );

    if (local) {
      setSelectedDepartment(local);
      setEditId(local.id ?? local._id ?? null);
      setDialogMode(mode);
      setOpen(true);
    } else {
      getDepartmentById(deptIdParam).then((fetched) => {
        if (!fetched) return;
        setSelectedDepartment(fetched);
        setEditId(fetched.id ?? fetched._id ?? null);
        setDialogMode(mode);
        setOpen(true);
      });
    }
  }, [
    searchParams,
    departments,
    loading,
    getDepartmentById,
    setEditId,
    setOpen,
  ]);

  const clearUrlParams = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("openDialog");
    params.delete("deptId");
    params.delete("mode");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedDepartment(null);
    setEditId(null);
    setForm(defaultForm);
    setDialogMode("add");
    clearUrlParams();
  };

  const openEditDialog = (dept: Department) => {
    setSelectedDepartment(dept);
    setEditId(dept.id ?? dept._id ?? null);
    setDialogMode("edit");
    setOpen(true);
  };

  return {
    dialogMode,
    selectedDepartment,
    handleCloseDialog,
    openEditDialog,
  };
}
