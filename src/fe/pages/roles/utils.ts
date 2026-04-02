import type { RoleFormData } from "@/fe/pages/roles/types";

// ─── Module name mapping ───────────────────────────────────────────────────────

const FRONTEND_TO_BACKEND_MODULE: Record<string, string> = {
  User: "employee",
  CabVendor: "cab-vendor",
  CabBooking: "cab-booking",
  Property: "property",
  BookingLogin: "booking-login",
  TrainingVideos: "training-videos",
  Pillar: "pillar",
  Role: "role",
  Lead: "lead",
  Department: "department",
  Vendor: "vendor",
  Team: "team",
  MOU: "mou",
  Branch: "branch",
  Analytics: "analytics",
};

const BACKEND_MODULES = [
  "employee",
  "lead",
  "mou",
  "team",
  "role",
  "department",
  "cab-booking",
  "cab-vendor",
  "vendor",
  "property",
  "booking-login",
  "training-videos",
  "pillar",
  "analytics",
];

export const transformModuleNameToBackend = (name: string): string =>
  FRONTEND_TO_BACKEND_MODULE[name] ?? name.toLowerCase();

/**
 * Converts frontend modulePerms map to backend { read, write, delete } arrays.
 */
export const buildPermissionsPayload = (
  modulePerms: Record<string, Record<string, boolean>>,
): { read: string[]; write: string[]; delete: string[] } => {
  const result: { read: string[]; write: string[]; delete: string[] } = {
    read: [],
    write: [],
    delete: [],
  };

  Object.entries(modulePerms).forEach(([frontendModule, actions]) => {
    const backendModule = transformModuleNameToBackend(frontendModule);
    if (!BACKEND_MODULES.includes(backendModule)) return;

    (["read", "write", "delete"] as const).forEach((action) => {
      if (actions[action]) result[action].push(backendModule);
    });
  });

  return result;
};

/**
 * Builds the full payload for creating a role.
 */
export const buildCreateRolePayload = (data: RoleFormData) => {
  const permissions = buildPermissionsPayload(data.modulePerms);
  return {
    name: data.name,
    ...permissions,
    isSystemAdmin: !!data.isSystemAdmin,
    showTotalUsers: !!data.showTotalUsers,
    showTotalVendorsBilling: !!data.showTotalVendorsBilling,
    showCabBookingAnalytics: !!data.showCabBookingAnalytics,
    showScheduleThisWeek: !!data.showScheduleThisWeek,
    isAVP: !!data.isAVP,
    rank: Number(data.rank) || 0,
  };
};

/**
 * Builds the payload for updating a role (no name field).
 */
export const buildUpdateRolePayload = (data: RoleFormData) => {
  const permissions = buildPermissionsPayload(data.modulePerms);
  return {
    id: data.editId!,
    ...permissions,
    isSystemAdmin: !!data.isSystemAdmin,
    showTotalUsers: !!data.showTotalUsers,
    showTotalVendorsBilling: !!data.showTotalVendorsBilling,
    showCabBookingAnalytics: !!data.showCabBookingAnalytics,
    showScheduleThisWeek: !!data.showScheduleThisWeek,
    isAVP: !!data.isAVP,
    rank: Number(data.rank) || 0,
  };
};


/**
 * Parses a role's read/write/delete arrays (or permissions[] legacy format)
 * back into a frontend modulePerms map so the dialog can be pre-filled.
 */
export const parseRoleToModulePerms = (
  role: any,
  modules: string[],
): Record<string, Record<string, boolean>> => {
  const perms = Object.fromEntries(
    modules.map((m) => [m, { read: false, write: false, delete: false }]),
  );

  let read: string[] = role.read ?? [];
  let write: string[] = role.write ?? [];
  let del: string[] = role.delete ?? [];

  // Fallback: parse from legacy permissions[] array
  if (!read.length && !write.length && Array.isArray(role.permissions)) {
    role.permissions.forEach((perm: string) => {
      const [mod, action] = perm.split(":");
      if (action === "read") read.push(mod);
      if (action === "write") write.push(mod);
      if (action === "delete") del.push(mod);
    });
  }

  // Build a map: backend module name -> frontend module label
  const backendToFrontend = Object.fromEntries(
    modules.map((m) => [transformModuleNameToBackend(m), m]),
  );

  const apply = (arr: string[], key: "read" | "write" | "delete") => {
    arr.forEach((mod) => {
      const frontendKey = backendToFrontend[mod];
      if (frontendKey) perms[frontendKey][key] = true;
    });
  };

  apply(read, "read");
  apply(write, "write");
  apply(del, "delete");

  return perms;
};

export const capitalizeFriendly = (str: string): string => {
  if (str === "CabBooking") return "Cab Booking";
  if (str === "CabVendor") return "Vendor Booking";
  if (str === "BookingLogin") return "Booking Login";
  if (str === "TrainingVideos") return "Training Videos";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Builds a map of { [module]: string[] } listing which actions (read/write/delete)
 * are granted for each module. Supports both the current read/write/delete arrays
 * and the legacy permissions[] "module:action" format.
 */
export const buildGroupedPermissions = (
  role: any,
): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};

  const add = (arr: string[] | undefined, action: string) =>
    arr?.forEach((mod) => {
      if (!grouped[mod]) grouped[mod] = [];
      grouped[mod].push(action);
    });

  const hasRWD =
    (role.read && role.read.length > 0) ||
    (role.write && role.write.length > 0) ||
    (role.delete && role.delete.length > 0);

  if (hasRWD) {
    add(role.read, "read");
    add(role.write, "write");
    add(role.delete, "delete");
  } else {
    (role.permissions ?? []).forEach((perm: string) => {
      const [module, action] = perm.split(":");
      if (!grouped[module]) grouped[module] = [];
      grouped[module].push(action);
    });
  }

  return grouped;
};
