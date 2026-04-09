import * as Yup from "yup";
import { VALIDATION_RULES } from "@/fe/pages/vendor/constants/vendors";

const coreSchema = {
  name: Yup.string()
    .min(
      VALIDATION_RULES.NAME.min,
      `Name must be at least ${VALIDATION_RULES.NAME.min} characters`,
    )
    .max(
      VALIDATION_RULES.NAME.max,
      `Name can't exceed ${VALIDATION_RULES.NAME.max} characters`,
    )
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
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .required("Phone is required")
    .matches(/^\d{10}$/, "Phone must be exactly 10 digits"),
  address: Yup.string()
    .min(
      VALIDATION_RULES.ADDRESS.min,
      `Address must be at least ${VALIDATION_RULES.ADDRESS.min} characters`,
    )
    .required("Address is required"),
  panNumber: Yup.string()
    .transform((value) => (value ? value.toUpperCase().trim() : value))
    .required("PAN Number is required")
    .matches(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Invalid PAN card number. Must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)",
    ),
};

// Both add and edit use the same 4-field schema — isCabVendor is set server-side
export const vendorValidationSchema = Yup.object(coreSchema);
export const vendorAddValidationSchema = Yup.object(coreSchema);
