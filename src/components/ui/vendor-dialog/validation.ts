import * as Yup from "yup";
import { VALIDATION_RULES } from "@/constants/vendors";

export const vendorValidationSchema = Yup.object({
	name: Yup.string()
		.min(VALIDATION_RULES.NAME.min)
		.max(VALIDATION_RULES.NAME.max)
		.required("Name is required"),
	email: Yup.string().email().required("Email is required"),
	phone: Yup.string().required("Phone is required"),
	address: Yup.string()
		.min(VALIDATION_RULES.ADDRESS.min)
		.required("Address is required"),
	// (gender intentionally omitted)
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
	managerId: Yup.string().required("Manager is required"),
	departmentId: Yup.string().required("Department is required"),
	roles: Yup.array().of(Yup.string()).min(1, "At least one role required"),
});

// Validation schema for add (create) vendor flow: only need basic contact fields
export const vendorAddValidationSchema = Yup.object({
	name: Yup.string()
		.min(VALIDATION_RULES.NAME.min)
		.max(VALIDATION_RULES.NAME.max)
		.required("Name is required"),
	email: Yup.string().email().required("Email is required"),
	phone: Yup.string().required("Phone is required"),
	address: Yup.string()
		.min(VALIDATION_RULES.ADDRESS.min)
		.required("Address is required"),
});
// Copied from user-dialog/validation.ts, replaced 'user' with 'vendor'
// ...existing code...
