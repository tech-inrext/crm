"use client";
import { useEffect, useState, useMemo } from "react";
import { useUserDialogData } from "@/fe/pages/user/hooks/useUserDialogData";
import { mapRolesToNameMap } from "@/fe/pages/user/utils";

export const useUserDetails = (open: boolean, user: any) => {
  const { roles } = useUserDialogData(open);
  const [imageError, setImageError] = useState(false);

  // useMemo instead of useEffect+setState — avoids infinite loop caused by
  // roles being a new array reference on every render from createApi
  const roleMap = useMemo(() => mapRolesToNameMap(roles), [roles]);

  useEffect(() => {
    setImageError(false);
  }, [user?.photo]);

  const hasPhoto = Boolean(
    user?.photo && user.photo.trim() !== "" && !imageError,
  );

  return { roleMap, imageError, setImageError, hasPhoto } as const;
};

export default useUserDetails;
