import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface UseUserDialogProps {
  employees: any[];
  loading: boolean;
  getUserById: (id: string) => Promise<any>;
  setEditId: (id: string | null) => void;
  setOpen: (open: boolean) => void;
  setForm: (form: any) => void;
  defaultForm: any;
}

export const useUserDialog = ({
  employees,
  loading,
  getUserById,
  setEditId,
  setOpen,
  setForm,
  defaultForm,
}: UseUserDialogProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Open dialog from URL params
  useEffect(() => {
    if (loading) return;

    const openDialogParam = searchParams.get("openDialog");
    const userIdParam = searchParams.get("userId");
    const modeParam = searchParams.get("mode");

    if (openDialogParam === "true" && userIdParam) {
      const mode = modeParam === "view" ? "view" : "edit";
      setDialogMode(mode);

      const userToEdit = employees.find(
        (u: any) => u.id === userIdParam || u._id === userIdParam
      );

      if (userToEdit) {
        setSelectedUser(userToEdit);
        setEditId(userToEdit.id || userToEdit._id);
        setOpen(true);
      } else {
        getUserById(userIdParam).then((fetchedUser: any) => {
          if (fetchedUser) {
            setSelectedUser(fetchedUser);
            setEditId(fetchedUser.id || fetchedUser._id);
            setOpen(true);
          }
        });
      }
    }
  }, [searchParams, employees, loading, getUserById, setEditId, setOpen]);

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedUser(null);
    setEditId(null);
    setForm(defaultForm);
    setDialogMode("add");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("openDialog");
    params.delete("userId");
    params.delete("mode");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const openViewDialog = (user: any) => {
    setSelectedUser(user);
    setEditId(user.id || user._id);
    setDialogMode("view");
    setOpen(true);

    const params = new URLSearchParams(searchParams.toString());
    params.set("openDialog", "true");
    params.set("userId", user.id || user._id);
    params.set("mode", "view");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setEditId(user.id || user._id);
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
};
