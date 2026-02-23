import * as Yup from "yup";
import {
  GENDER_OPTIONS,
  VALIDATION_RULES,
} from "@/fe/pages/user/constants/users";

export const userValidationSchema = Yup.object({
  name: Yup.string()
    .min(VALIDATION_RULES.NAME.min)
    .max(VALIDATION_RULES.NAME.max)
    .required("Name is required")
    .matches(/^[\p{L}\s'-]+$/u, "Name must not contain special characters")
    .test(
      "no-leading-digit",
      "Full name must not start with a digit",
      (value) => {
        if (!value) return true;
        return !/^\d/.test(String(value).trim());
      },
    ),
  fatherName: Yup.string()
    .min(3, "Father's Name must be at least 3 characters")
    .max(50, "Father's Name must be at most 50 characters")
    .required("Father's Name is required")
    .matches(
      /^[\p{L}\s'.-]+$/u,
      "Father's name must not contain special characters",
    )
    .test(
      "father-no-leading-digit",
      "Father's name must not start with a digit",
      (value) => {
        if (!value) return true;
        return !/^\d/.test(String(value).trim());
      },
    ),
  email: Yup.string().email().required("Email is required"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^\d{10}$/, "Phone must contain only digits and 10 digits long"),
  address: Yup.string()
    .min(VALIDATION_RULES.ADDRESS.min)
    .required("Address is required"),
  gender: Yup.string().oneOf(GENDER_OPTIONS).required("Gender is required"),
  altPhone: Yup.string()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .test(
      "alt-phone-format",
      "Phone must contain only digits and 10 digits long",
      (val) => {
        if (val === null || val === undefined || val === "") return true;
        return /^\d{10}$/.test(String(val));
      },
    ),
  dateOfBirth: Yup.string()
    .nullable()
    .required("Date of Birth is required")
    .test("age-restriction", "Age should be atleast 21 years", (val) => {
      if (!val) return false;
      const dob = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      if (
        age > 21 ||
        (age === 21 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
      ) {
        return true;
      }
      return false;
    }),
  joiningDate: Yup.string()
    .nullable()
    .test("not-in-future", "Joining date cannot be a future date", (val) => {
      if (!val) return true;
      const d = new Date(val);
      if (isNaN(d.getTime())) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      return d <= today;
    }),
  designation: Yup.string()
    .min(VALIDATION_RULES.DESIGNATION.min)
    .max(VALIDATION_RULES.DESIGNATION.max)
    .required("Designation is required"),
  roles: Yup.array().test(
    "roles-required",
    "At least one role required",
    (val) => Array.isArray(val) && val.filter(Boolean).length > 0,
  ),
  nominee: Yup.object()
    .shape({
      name: Yup.string()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable()
        .matches(
          /^[\p{L}\s'-]+$/u,
          "Nominee name must not contain special characters",
        )
        .test(
          "nominee-name-min",
          "Nominee name must be at least 3 characters",
          function (value) {
            if (value === null || value === undefined) return true;
            return String(value).trim().length >= 3;
          },
        )
        .test(
          "nominee-no-leading-digit",
          "Nominee name must not start with a digit",
          (value) => {
            if (!value) return true;
            return !/^\d/.test(String(value).trim());
          },
        ),
      phone: Yup.string()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable()
        .test(
          "nominee-phone-format",
          "Phone must contain only digits and 10 digits long",
          (val) => {
            if (val === null || val === undefined || val === "") return true;
            return /^\d{10}$/.test(String(val));
          },
        ),
      occupation: Yup.string()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable(),
      relation: Yup.string()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable(),
      gender: Yup.string()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable()
        .test("nominee-gender-valid", "Invalid gender", function (value) {
          if (value === null || value === undefined) return true;
          return GENDER_OPTIONS.includes(value);
        }),
    })
    .nullable(),
  aadharFile: Yup.mixed()
    .nullable()
    .test("aadhar-size", "Aadhar file must be less than 1MB", function (value) {
      const { aadharUrl } = this.parent || {};
      if (value && typeof value === "object" && value.size !== undefined) {
        return value.size <= 1024 * 1024;
      }
      if (typeof aadharUrl === "string" && aadharUrl.trim() !== "") return true;
      return true;
    }),
  panFile: Yup.mixed()
    .nullable()
    .test("pan-size", "PAN file must be less than 1MB", function (value) {
      const { panUrl } = this.parent || {};
      if (value && typeof value === "object" && value.size !== undefined) {
        return value.size <= 1024 * 1024;
      }
      if (typeof panUrl === "string" && panUrl.trim() !== "") return true;
      return true;
    }),
  bankProofFile: Yup.mixed()
    .nullable()
    .test(
      "bank-size",
      "Bank proof file must be less than 1MB",
      function (value) {
        const { bankProofUrl } = this.parent || {};
        if (value && typeof value === "object" && value.size !== undefined) {
          return value.size <= 1024 * 1024;
        }
        if (typeof bankProofUrl === "string" && bankProofUrl.trim() !== "")
          return true;
        return true;
      },
    ),
  signatureFile: Yup.mixed()
    .nullable()
    .test(
      "signature-size",
      "Signature file must be less than 1MB",
      function (value) {
        const { signatureUrl } = this.parent || {};
        if (value && typeof value === "object" && value.size !== undefined) {
          return value.size <= 1024 * 1024;
        }
        if (typeof signatureUrl === "string" && signatureUrl.trim() !== "")
          return true;
        return true;
      },
    ),
  photoFile: Yup.mixed()
    .nullable()
    .test("photo-size", "Photo file must be less than 1MB", function (value) {
      const { photo } = this.parent || {};
      if (value && typeof value === "object" && value.size !== undefined) {
        return value.size <= 1024 * 1024;
      }
      if (typeof photo === "string" && photo.trim() !== "") return true;
      return true;
    }),
  panNumber: Yup.string()
    .required("PAN Number is required")
    .matches(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Invalid PAN card number. Must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)",
    )
    .transform((value) => (value ? value.toUpperCase().trim() : value)),
});
