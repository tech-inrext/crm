"use client";
import { useEffect, useState } from "react";
import { useUserDialogData } from "@/fe/pages/user/hooks/useUserDialogData";
import { mapRolesToNameMap } from "@/fe/pages/user/utils";

export const useUserDetails = (open: boolean, user: any) => {
  const { roles } = useUserDialogData(open);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setRoleMap(mapRolesToNameMap(roles));
  }, [roles]);

  useEffect(() => {
    setImageError(false);
  }, [user?.photo]);

  const hasPhoto = Boolean(
    user?.photo && user.photo.trim() !== "" && !imageError,
  );

  return { roleMap, imageError, setImageError, hasPhoto } as const;
};

export default useUserDetails;
