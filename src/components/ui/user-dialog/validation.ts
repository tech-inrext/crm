import * as Yup from "yup";
import { GENDER_OPTIONS, VALIDATION_RULES } from "@/constants/users";

export const userValidationSchema = Yup.object({
  name: Yup.string()
    .min(VALIDATION_RULES.NAME.min)
    .max(VALIDATION_RULES.NAME.max)
    .required("Name is required"),
  fatherName: Yup.string()
    .min(2, "Father's Name must be at least 2 characters")
    .max(50, "Father's Name must be at most 50 characters")
    .required("Father's Name is required"),
  email: Yup.string().email().required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  address: Yup.string()
    .min(VALIDATION_RULES.ADDRESS.min)
    .required("Address is required"),
  gender: Yup.string()
    .oneOf(GENDER_OPTIONS)
    .required("Gender is required"),
  age: Yup.number()
    .transform((value, originalValue) => {
      // treat empty string as null so it's optional in the form
      return originalValue === "" || originalValue === null ? null : value;
    })
    .min(VALIDATION_RULES.AGE.min)
    .max(VALIDATION_RULES.AGE.max)
    .nullable(),
  altPhone: Yup.string().nullable(),
  joiningDate: Yup.string().nullable(),
  designation: Yup.string()
    .min(VALIDATION_RULES.DESIGNATION.min)
    .max(VALIDATION_RULES.DESIGNATION.max)
    .required("Designation is required"),
  // managerId: Yup.string().required("Manager is required"),
  // departmentId: Yup.string().required("Department is required"),
  roles: Yup.array().test(
    "roles-required",
    "At least one role required",
    (val) => Array.isArray(val) && val.filter(Boolean).length > 0
  ),
  // nominee validation: only validate fields when a value is provided
  nominee: Yup.object()
    .shape({
      name: Yup.string()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .nullable()
        .test("nominee-name-min", "Nominee name must be at least 2 characters", function (value) {
          if (value === null || value === undefined) return true;
          return String(value).trim().length >= 2;
        }),
      phone: Yup.string()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .nullable(),
      occupation: Yup.string()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .nullable(),
      relation: Yup.string()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .nullable(),
      gender: Yup.string()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .nullable()
        .test("nominee-gender-valid", "Invalid gender", function (value) {
          if (value === null || value === undefined) return true;
          return GENDER_OPTIONS.includes(value);
        }),
    })
    .nullable(),
  // file placeholders - accept either a File object (new upload) or a non-empty URL (existing upload)
  // Documents are optional now; when provided as File enforce size < 1MB
  aadharFile: Yup.mixed().nullable().test(
    "aadhar-size",
    "Aadhar file must be less than 1MB",
    function (value) {
      const { aadharUrl } = this.parent || {};
      // If a File is present, enforce size limit
      if (value && typeof value === "object" && value.size !== undefined) {
        return value.size <= 1024 * 1024;
      }
      // If URL present, accept
      if (typeof aadharUrl === "string" && aadharUrl.trim() !== "") return true;
      // No file/url -> allowed (optional)
      return true;
    }
  ),
  panFile: Yup.mixed().nullable().test("pan-size", "PAN file must be less than 1MB", function (value) {
    const { panUrl } = this.parent || {};
    if (value && typeof value === "object" && value.size !== undefined) {
      return value.size <= 1024 * 1024;
    }
    if (typeof panUrl === "string" && panUrl.trim() !== "") return true;
    return true;
  }),
  bankProofFile: Yup.mixed().nullable().test("bank-size", "Bank proof file must be less than 1MB", function (value) {
    const { bankProofUrl } = this.parent || {};
    if (value && typeof value === "object" && value.size !== undefined) {
      return value.size <= 1024 * 1024;
    }
    if (typeof bankProofUrl === "string" && bankProofUrl.trim() !== "") return true;
    return true;
  }),
  signatureFile: Yup.mixed().nullable().test("signature-size", "Signature file must be less than 1MB", function (value) {
    const { signatureUrl } = this.parent || {};
    if (value && typeof value === "object" && value.size !== undefined) {
      return value.size <= 1024 * 1024;
    }
    if (typeof signatureUrl === "string" && signatureUrl.trim() !== "") return true;
    return true;
  }),
});
