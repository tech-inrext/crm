import { DEFAULT_VENDOR_FORM } from "@/fe/pages/vendor/constants/vendors";
import type { VendorFormData } from "@/fe/pages/vendor/types";

export const getInitialVendorForm = (vendor: any): VendorFormData => {
  if (!vendor) return { ...DEFAULT_VENDOR_FORM };
  return {
    name: vendor.name ?? "",
    email: vendor.email ?? "",
    phone: vendor.phone ?? "",
    address: vendor.address ?? "",
    panNumber: vendor.panNumber ?? "",
  };
};

/**
 * Builds the API payload: only the 4 form fields + isCabVendor flag.
 * Strips the transient `id` key used only for URL construction.
 */
export const buildVendorPayload = (
  values: VendorFormData,
  extra: Record<string, unknown> = {},
): Record<string, unknown> => ({
  name: values.name,
  email: values.email,
  phone: values.phone,
  address: values.address,
  panNumber: values.panNumber,
  isCabVendor: true,
  ...extra,
});

export const extractMessage = (err: any): string => {
  if (!err) return "Failed to save vendor";
  const r = err.response?.data ?? err.data ?? err;
  if (typeof r === "string") return r;
  if (r) {
    if (r.message) return r.message;
    if (r.msg) return r.msg;
    if (r.error) return r.error;
    if (r.data && typeof r.data === "string") return r.data;
    if (r.data?.message) return r.data.message;
  }
  if (err.message) return err.message;
  try {
    return JSON.stringify(err);
  } catch (_) {
    return "Failed to save vendor";
  }
};

export const makeAllTouched = (values: Record<string, unknown>) => {
  const touched: Record<string, boolean> = {};
  Object.keys(values).forEach((key) => {
    touched[key] = true;
  });
  return touched;
};
