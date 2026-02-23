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

export default {};

export const extractMessage = (err: any) => {
  if (!err) return "Failed to save user";
  const r = err.response?.data ?? err.data ?? err;
  if (typeof r === "string") return r;
  if (r) {
    if (r.message) return r.message;
    if (r.msg) return r.msg;
    if (r.error) return r.error;
    if (r.data && typeof r.data === "string") return r.data;
    if (r.data && r.data.message) return r.data.message;
  }
  if (err.message) return err.message;
  try {
    return JSON.stringify(err);
  } catch (_) {
    return "Failed to save user";
  }
};

export const makeAllTouched = (obj: any): any => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj !== "object") return true;
  if (Array.isArray(obj)) return obj.map(() => true);
  const out: any = {};
  Object.keys(obj).forEach((k) => {
    out[k] = makeAllTouched(obj[k]);
  });
  return out;
};

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  try {
    // Keep output consistent with previous formatting
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
};

export const previewIsImage = (v: string) =>
  /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(v);

export const getSlabLabel = (opt: string) =>
  opt === ""
    ? "Select a slab"
    : `${opt}%` +
      (opt === "100"
        ? " President"
        : opt === "95"
          ? " V.P."
          : opt === "90"
            ? " A.V.P. (Core Member)"
            : opt === "80"
              ? " General Manager"
              : opt === "70"
                ? " Senior Manager"
                : opt === "60"
                  ? " Manager"
                  : " (Sales Executive)");

export const formatBranchForMenu = (label: string) =>
  label.split(", ").join(",\n");

export const mapRolesToNameMap = (roles: any[] | undefined) => {
  const map: Record<string, string> = {};
  if (!Array.isArray(roles)) return map;
  roles.forEach((r: any) => {
    const id = r?._id || r?.id;
    if (id) map[id] = r?.name || r?.label || "";
  });
  return map;
};

export const formatRoleDisplayName = (
  role: any,
  roleMap: Record<string, string>,
) => {
  if (!role) return "";
  if (typeof role === "string") return roleMap[role] || role;
  return role.name || role.label || role._id || JSON.stringify(role);
};

export const toDateInputString = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export const formatPhoneValue = (value: string | null | undefined): string => {
  return value ?? "";
};

export const formatPanNumber = (value: string | null | undefined): string => {
  return (value ?? "").toUpperCase();
};
