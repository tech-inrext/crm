import * as Yup from "yup";
import {
  GENDER_OPTIONS,
  VALIDATION_RULES,
} from "@/fe/pages/user/constants/users";

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

const fileField = (label: string) =>
  Yup.mixed()
    .nullable()
    .test("file-size", `${label} must be less than 1MB`, (value) => {
      if (value instanceof File) return value.size <= MAX_FILE_SIZE;
      return true;
    });

const noLeadingDigit = (msg: string) =>
  Yup.string().test("no-leading-digit", msg, (value) =>
    value ? !/^\d/.test(value.trim()) : true,
  );

export const userValidationSchema = Yup.object({
  name: noLeadingDigit("Full name must not start with a digit")
    .min(VALIDATION_RULES.NAME.min)
    .max(VALIDATION_RULES.NAME.max)
    .required("Name is required")
    .matches(/^[\p{L}\s'-]+$/u, "Name must not contain special characters"),

  fatherName: noLeadingDigit("Father's name must not start with a digit")
    .min(3, "Father's Name must be at least 3 characters")
    .max(50, "Father's Name must be at most 50 characters")
    .required("Father's Name is required")
    .matches(
      /^[\p{L}\s'.-]+$/u,
      "Father's name must not contain special characters",
    ),

  email: Yup.string().email().required("Email is required"),

  phone: Yup.string()
    .required("Phone is required")
    .matches(/^\d{10}$/, "Phone must contain only digits and 10 digits long"),

  address: Yup.string()
    .min(VALIDATION_RULES.ADDRESS.min)
    .required("Address is required"),

  gender: Yup.string().oneOf(GENDER_OPTIONS).required("Gender is required"),

  whatsapp: Yup.string()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .test(
      "whatsapp-format",
      "Phone must contain only digits and 10 digits long",
      (val) => val == null || /^\d{10}$/.test(String(val)),
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
      return (
        age > 21 ||
        (age === 21 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
      );
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
      name: noLeadingDigit("Nominee name must not start with a digit")
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
          (value) => (value == null ? true : String(value).trim().length >= 3),
        ),
      phone: Yup.string()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable()
        .test(
          "nominee-phone-format",
          "Phone must contain only digits and 10 digits long",
          (val) => val == null || /^\d{10}$/.test(String(val)),
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
        .test(
          "nominee-gender-valid",
          "Invalid gender",
          (value) =>
            value == null ||
            GENDER_OPTIONS.includes(value as (typeof GENDER_OPTIONS)[number]),
        ),
    })
    .nullable(),

  aadharFile: fileField("Aadhar file"),
  panFile: fileField("PAN file"),
  bankProofFile: fileField("Bank proof file"),
  signatureFile: fileField("Signature file"),
  photoFile: fileField("Photo file"),

  panNumber: Yup.string()
    .transform((value) => (value ? value.toUpperCase().trim() : value))
    .required("PAN Number is required")
    .matches(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Invalid PAN card number. Must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)",
    ),
});
