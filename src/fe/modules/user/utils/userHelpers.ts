import { DEFAULT_USER_FORM } from "@/fe/modules/user/constants/users";

/**
 * Check if current user can edit a specific employee
 * System admins can edit everyone, managers can only edit their direct reports
 */
export const canEditEmployee = (currentUser: any, employee: any): boolean => {
  if (!currentUser || !employee) return false;
  if (currentUser.isSystemAdmin) return true;

  const currentUserId = currentUser._id;
  const employeeManagerId = employee.managerId;

  if (!currentUserId || !employeeManagerId) return false;

  return String(currentUserId).trim() === String(employeeManagerId).trim();
};

/**
 * Transform user data to form-compatible format
 */
export const getInitialUserForm = (form: any) => {
  const safeForm = Object.fromEntries(
    Object.entries(form || {}).filter(
      ([_, v]) => v !== undefined && v !== null,
    ),
  );

  let joiningDate = safeForm.joiningDate || "";
  if (joiningDate) {
    const dateObj = new Date(joiningDate as string);
    if (!isNaN(dateObj.getTime())) {
      joiningDate = dateObj.toISOString().slice(0, 10);
    }
  }

  return {
    ...DEFAULT_USER_FORM,
    ...safeForm,
    gender: safeForm.gender ?? DEFAULT_USER_FORM.gender,
    managerId: safeForm.managerId || "",
    departmentId: safeForm.departmentId || "",
    roles: Array.isArray(safeForm.roles)
      ? safeForm.roles.map((r: any) =>
          typeof r === "string" ? r : r._id || r.id || "",
        )
      : [],
    joiningDate,
    aadharUrl: safeForm.aadharUrl || "",
    panUrl: safeForm.panUrl || "",
    bankProofUrl: safeForm.bankProofUrl || "",
    panNumber: safeForm.panNumber || "",
    nominee: safeForm.nominee ?? DEFAULT_USER_FORM.nominee,
    slabPercentage: safeForm.slabPercentage || "",
    branch: safeForm.branch || "",
  };
};
