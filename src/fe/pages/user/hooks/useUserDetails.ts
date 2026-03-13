"use client";
import { useEffect, useState, useMemo } from "react";
import { useUserDialogData } from "@/fe/pages/user/hooks/useUserDialogData";
import { mapRolesToNameMap } from "@/fe/pages/user/utils";

export const useUserDetails = (open: boolean, user: any) => {
  const { roles, managers, departments } = useUserDialogData(open);
  const [imageError, setImageError] = useState(false);

  // useMemo instead of useEffect+setState — avoids infinite loop caused by
  // roles being a new array reference on every render from createApi
  const roleMap = useMemo(() => mapRolesToNameMap(roles), [roles]);

  // Map manager and department IDs to their names
  const managerName = useMemo(() => {
    if (!user?.managerId) return "N/A";
    const manager = managers.find((m) => m._id === user.managerId);
    return manager?.name || "N/A";
  }, [user?.managerId, managers]);

  const departmentName = useMemo(() => {
    if (!user?.departmentId) return "N/A";
    const dept = departments.find((d) => d._id === user.departmentId);
    return dept?.name || "N/A";
  }, [user?.departmentId, departments]);

  useEffect(() => {
    setImageError(false);
  }, [user?.photo]);

  const hasPhoto = Boolean(
    user?.photo && user.photo.trim() !== "" && !imageError,
  );

  return {
    roleMap,
    imageError,
    setImageError,
    hasPhoto,
    managerName,
    departmentName,
  } as const;
};

export default useUserDetails;
