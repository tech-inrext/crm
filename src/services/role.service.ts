import axios from "axios";

interface RoleSubmissionData {
  name: string;
  modulePerms: Record<string, Record<string, boolean>>;
  editId?: string;
  isSystemAdmin?: boolean;
  showTotalUsers?: boolean;
  showTotalVendorsBilling?: boolean;
  showCabBookingAnalytics?: boolean;
  showScheduleThisWeek?: boolean;
}

interface RolePermissions {
  read: string[];
  write: string[];
  delete: string[];
}

/**
 * Transforms frontend module names to backend module names
 */
const transformModuleNameToBackend = (frontendModuleName: string): string => {
  const moduleMap: Record<string, string> = {
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
  };

  return moduleMap[frontendModuleName] || frontendModuleName.toLowerCase();
};

/**
 * Converts frontend module permissions to backend format
 */
const transformModulePermissions = (
  modulePerms: Record<string, Record<string, boolean>>
): RolePermissions => {
  const backendModules = [
    "employee",
    "lead",
    "mou",
    "team",
    "role",
    "department",
    "cab-booking",
    "cab-vendor",
    "vendor",
    "branch",
    "property",
    "booking-login",
    "training-videos",
    "pillar",
    "analytics",
  ];

  const permissions: RolePermissions = { read: [], write: [], delete: [] };

  Object.entries(modulePerms).forEach(([frontendModule, actions]) => {
    const backendModule = transformModuleNameToBackend(frontendModule);

    // Only include modules that are supported by the backend
    if (!backendModules.includes(backendModule)) {
      return;
    }

    Object.entries(actions).forEach(([action, isChecked]) => {
      if (
        isChecked &&
        (action === "read" || action === "write" || action === "delete")
      ) {
        permissions[action as keyof RolePermissions].push(backendModule);
      }
    });
  });

  return permissions;
};

/**
 * Creates a new role
 */
export const createRole = async (
  roleData: RoleSubmissionData
): Promise<void> => {
  const permissions = transformModulePermissions(roleData.modulePerms);

  const payload = {
    name: roleData.name,
    ...permissions,
    isSystemAdmin: !!roleData.isSystemAdmin,
    showTotalUsers: !!roleData.showTotalUsers,
    showTotalVendorsBilling: !!roleData.showTotalVendorsBilling,
    showCabBookingAnalytics: !!roleData.showCabBookingAnalytics,
    showScheduleThisWeek: !!roleData.showScheduleThisWeek,
  };

  try {
    await axios.post("/api/v0/role", payload);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverMsg =
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        error.message;
      throw new Error(`Failed to create role: ${serverMsg}`);
    }
    throw new Error(
      `Failed to create role: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Updates an existing role
 */
export const updateRole = async (
  roleData: RoleSubmissionData
): Promise<void> => {
  if (!roleData.editId) {
    throw new Error("Role ID is required for updating");
  }

  const permissions = transformModulePermissions(roleData.modulePerms);

  const payload = {
    ...permissions,
    isSystemAdmin: !!roleData.isSystemAdmin,
    showTotalUsers: !!roleData.showTotalUsers,
    showTotalVendorsBilling: !!roleData.showTotalVendorsBilling,
    showCabBookingAnalytics: !!roleData.showCabBookingAnalytics,
    showScheduleThisWeek: !!roleData.showScheduleThisWeek,
  };

  try {
    await axios.patch(`/api/v0/role/${roleData.editId}`, payload);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverMsg =
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        error.message;
      throw new Error(`Failed to update role: ${serverMsg}`);
    }
    throw new Error(
      `Failed to update role: ${error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Creates or updates a role based on whether editId is provided
 */
export const submitRole = async (
  roleData: RoleSubmissionData
): Promise<void> => {
  if (roleData.editId) {
    await updateRole(roleData);
  } else {
    await createRole(roleData);
  }
};
