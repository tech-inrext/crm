"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Employee, UserFormData } from "@/fe/pages/user/types";

type DialogMode = "add" | "edit" | "view";

interface UseUserDialogProps {
  employees: Employee[];
  loading: boolean;
  getUserById: (id: string) => Promise<Employee | null>;
  setEditId: (id: string | null) => void;
  setOpen: (open: boolean) => void;
  setForm: (form: Partial<UserFormData>) => void;
  defaultForm: Partial<UserFormData>;
}

export function useUserDialog({
  employees,
  loading,
  getUserById,
  setEditId,
  setOpen,
  setForm,
  defaultForm,
}: UseUserDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dialogMode, setDialogMode] = useState<DialogMode>("add");
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);

  // Handle URL-driven dialog opening (e.g. from notification redirects)
  useEffect(() => {
    if (loading) return;

    const openDialogParam = searchParams.get("openDialog");
    const userIdParam = searchParams.get("userId");
    const modeParam = searchParams.get("mode");

    if (openDialogParam !== "true" || !userIdParam) return;

    const mode: DialogMode = modeParam === "view" ? "view" : "edit";

    const localUser = employees.find(
      (u) => u.id === userIdParam || u._id === userIdParam,
    );

    if (localUser) {
      setSelectedUser(localUser);
      setEditId(localUser.id ?? localUser._id ?? null);
      setDialogMode(mode);
      setOpen(true);
    } else {
      getUserById(userIdParam).then((fetched) => {
        if (!fetched) return;
        setSelectedUser(fetched);
        setEditId(fetched.id ?? fetched._id ?? null);
        setDialogMode(mode);
        setOpen(true);
      });
    }
  }, [searchParams, employees, loading, getUserById, setEditId, setOpen]);

  const clearUrlParams = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("openDialog");
    params.delete("userId");
    params.delete("mode");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedUser(null);
    setEditId(null);
    setForm(defaultForm);
    setDialogMode("add");
    clearUrlParams();
  };

  const openViewDialog = (user: Employee) => {
    setSelectedUser(user);
    setEditId(user.id ?? user._id ?? null);
    setDialogMode("view");
    setOpen(true);

    const params = new URLSearchParams(searchParams.toString());
    params.set("openDialog", "true");
    params.set("userId", user.id ?? user._id ?? "");
    params.set("mode", "view");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const openEditDialog = (user: Employee) => {
    setSelectedUser(user);
    setEditId(user.id ?? user._id ?? null);
    setDialogMode("edit");
    setOpen(true);
  };

  return {
    dialogMode,
    selectedUser,
    handleCloseDialog,
    openViewDialog,
    openEditDialog,
    setSelectedUser,
    setDialogMode,
  };
}

export default useUserDialog;
