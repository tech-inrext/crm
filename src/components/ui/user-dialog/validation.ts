import * as Yup from "yup";
import { GENDER_OPTIONS, VALIDATION_RULES } from "@/constants/users";

export const userValidationSchema = Yup.object({
  name: Yup.string()
    .min(VALIDATION_RULES.NAME.min)
    .max(VALIDATION_RULES.NAME.max)
    .required("Name is required"),
  email: Yup.string().email().required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  address: Yup.string()
    .min(VALIDATION_RULES.ADDRESS.min)
    .required("Address is required"),
  gender: Yup.string()
    .oneOf(GENDER_OPTIONS)
    .required("Gender is required"),
  age: Yup.number()
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
  roles: Yup.array().of(Yup.string()).min(1, "At least one role required"),
});
