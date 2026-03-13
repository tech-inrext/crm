// src/fe/pages/roles/hooks/useRoleDialog.ts
import { useState, useEffect } from "react";
import {
  ROLE_MODULES,
  ROLE_PERMISSIONS,
} from "@/fe/pages/roles/constants/roles";
import { parseRoleToModulePerms } from "@/fe/pages/roles/utils";
import type { Role, RoleFormData, UseRoleDialogOptions } from "@/fe/pages/roles/types";


const modules = [...ROLE_MODULES];
const permissions = [...ROLE_PERMISSIONS];



export function useRoleDialog({ open, role, onSubmit }: UseRoleDialogOptions) {
  const [roleName, setRoleName] = useState("");
  const [modulePerms, setModulePerms] = useState(() =>
    Object.fromEntries(
      modules.map((m) => [m, { read: false, write: false, delete: false }]),
    ),
  );
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [showTotalUsers, setShowTotalUsers] = useState(false);
  const [showTotalVendorsBilling, setShowTotalVendorsBilling] = useState(false);
  const [showCabBookingAnalytics, setShowCabBookingAnalytics] = useState(false);
  const [showScheduleThisWeek, setShowScheduleThisWeek] = useState(false);
  const [isAVP, setIsAVP] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const coerceBool = (val: any): boolean =>
    typeof val === "string" ? val.toLowerCase() === "true" : Boolean(val);

  useEffect(() => {
    if (!open) return;

    if (role) {
      setRoleName(role.name || "");
      setIsSystemAdmin(coerceBool(role.isSystemAdmin));
      setShowTotalUsers(coerceBool(role.showTotalUsers));
      setShowTotalVendorsBilling(coerceBool(role.showTotalVendorsBilling));
      setShowCabBookingAnalytics(coerceBool(role.showCabBookingAnalytics));
      setShowScheduleThisWeek(coerceBool(role.showScheduleThisWeek));
      setIsAVP(coerceBool(role.isAVP));
      setModulePerms(parseRoleToModulePerms(role, modules));
    } else {
      setRoleName("");
      setIsSystemAdmin(false);
      setShowTotalUsers(false);
      setShowTotalVendorsBilling(false);
      setShowCabBookingAnalytics(false);
      setShowScheduleThisWeek(false);
      setIsAVP(false);
      setModulePerms(
        Object.fromEntries(
          modules.map((m) => [m, { read: false, write: false, delete: false }]),
        ),
      );
    }
  }, [open, role]);

  const gridTemplateColumns = `minmax(90px, 170px) repeat(${permissions.length}, 1fr)`;

  const handlePermChange = (mod: string, perm: string, checked: boolean) => {
    setModulePerms((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [perm]: checked },
    }));
  };

  const handleSubmit = () => {
    if (!roleName.trim()) return;
    onSubmit({
      name: roleName,
      modulePerms,
      editId: role?._id,
      isSystemAdmin,
      showTotalUsers,
      showTotalVendorsBilling,
      showCabBookingAnalytics,
      showScheduleThisWeek,
      isAVP,
    });
  };

  return {
    roleName,
    setRoleName,
    modulePerms,
    isSystemAdmin,
    setIsSystemAdmin,
    showTotalUsers,
    setShowTotalUsers,
    showTotalVendorsBilling,
    setShowTotalVendorsBilling,
    showCabBookingAnalytics,
    setShowCabBookingAnalytics,
    showScheduleThisWeek,
    setShowScheduleThisWeek,
    isAVP,
    setIsAVP,
    isClient,
    windowWidth,
    gridTemplateColumns,
    handlePermChange,
    handleSubmit,
    modules,
    permissions,
  };
}
