import { useMemo } from "react";
import {
  useGetRolesQuery,
  useGetManagersQuery,
  useGetDepartmentsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/fe/pages/user/userApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/fe/components/Toast/ToastContext";
import { resolveFileUploads } from "@/fe/pages/user/utils";
import type {
  RoleItem,
  ManagerItem,
  DepartmentItem,
  UserFormData,
} from "@/fe/pages/user/types";

// Stable empty arrays — reused across renders so array references never change
const EMPTY_ROLES: RoleItem[] = [];
const EMPTY_MANAGERS: ManagerItem[] = [];
const EMPTY_DEPTS: DepartmentItem[] = [];

export const useUserDialogData = (open: boolean, editId?: string) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  // Queries (only run when open)
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery(undefined, {
    skip: !open,
  });
  const { data: managersData, isLoading: managersLoading } = useGetManagersQuery(
    { isCabVendor: false, limit: 1000, page: 1 },
    { skip: !open },
  );
  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetDepartmentsQuery(undefined, { skip: !open });

  // Mutations
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const { mutate: handleUserSave, loading: saving = false } = editId
    ? updateMutation
    : createMutation;

  // Data normalization
  const roles = useMemo<RoleItem[]>(
    () => (rolesData as any)?.data ?? rolesData ?? EMPTY_ROLES,
    [rolesData],
  );
  const managers = useMemo<ManagerItem[]>(
    () => (managersData as any)?.data ?? managersData ?? EMPTY_MANAGERS,
    [managersData],
  );
  const departments = useMemo<DepartmentItem[]>(
    () => (departmentsData as any)?.data ?? departmentsData ?? EMPTY_DEPTS,
    [departmentsData],
  );

  // 🛡️ Filter roles based on logged-in user's rank
  const filteredRoles = useMemo(() => {
    if (!open) return EMPTY_ROLES;
    if (currentUser?.isSystemAdmin) return roles;

    // Get current user's rank from their active role
    let activeUserRank = Infinity;
    if (currentUser?.currentRole) {
      const activeRoleId =
        typeof currentUser.currentRole === "string"
          ? currentUser.currentRole
          : currentUser.currentRole._id;

      const activeRoleObj = currentUser.roles?.find(
        (r) => r._id === activeRoleId,
      );
      // Fallback to the currentRole object itself if rank is present there
      const rankVal =
        activeRoleObj?.rank ?? (currentUser.currentRole as any).rank;

      activeUserRank =
        typeof rankVal === "number" && rankVal > 0 ? rankVal : Infinity;
    }

    return roles.filter((role) => {
      const targetRank = role.rank ?? 0;
      const normalizedTarget = targetRank > 0 ? targetRank : Infinity;
      return normalizedTarget >= activeUserRank;
    });
  }, [open, roles, currentUser]);

  const handleSubmit = async (
    values: UserFormData,
    onSave?: () => void,
    onClose?: () => void,
  ) => {
    try {
      const payload = await resolveFileUploads(values);
      if (editId) {
        await handleUserSave({ ...payload, id: editId }, onSave);
      } else {
        await handleUserSave(payload, onSave);
      }
      onClose?.();
    } catch (err: any) {
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save user.";
      showToast(backendMessage, "error");
    }
  };

  const loading = rolesLoading || managersLoading || departmentsLoading;

  return {
    roles: filteredRoles,
    managers,
    departments,
    loading,
    saving,
    handleSubmit,
  };
};
