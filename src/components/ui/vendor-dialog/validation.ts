import * as Yup from "yup";
import { VALIDATION_RULES } from "@/constants/vendors";

export const vendorValidationSchema = Yup.object({
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
			}
		),
	email: Yup.string().email().required("Email is required"),
	phone: Yup.string()
		.required("Phone is required")
		.matches(/^\d{10}$/, "Phone must contain only digits and 10 digits long"),
	address: Yup.string()
		.min(VALIDATION_RULES.ADDRESS.min)
		.required("Address is required"),
	age: Yup.number()
		.min(VALIDATION_RULES.AGE.min)
		.max(VALIDATION_RULES.AGE.max)
		.nullable(),
	altPhone: Yup.string()
		.transform((value, originalValue) => (originalValue === "" ? null : value))
		.nullable()
		.test("alt-phone-format", "Phone must contain only digits and 10 digits long", (val) => {
			if (val === null || val === undefined || val === "") return true;
			return /^\d{10}$/.test(String(val));
		}),
	joiningDate: Yup.string()
		.nullable()
		.test(
			"not-in-future",
			"Joining date cannot be a future date",
			(val) => {
				if (!val) return true;
				const d = new Date(val);
				if (isNaN(d.getTime())) return true;
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				d.setHours(0, 0, 0, 0);
				return d <= today;
			}
		),
	designation: Yup.string()
		.min(VALIDATION_RULES.DESIGNATION.min)
		.max(VALIDATION_RULES.DESIGNATION.max)
		.required("Designation is required"),
	managerId: Yup.string().required("Manager is required"),
	departmentId: Yup.string().required("Department is required"),
	roles: Yup.array().of(Yup.string()).min(1, "At least one role required"),
});

export const vendorAddValidationSchema = Yup.object({
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
			}
		),
	email: Yup.string().email().required("Email is required"),
	phone: Yup.string()
		.required("Phone is required")
		.matches(/^\d{10}$/, "Phone must contain only digits and 10 digits long"),
	address: Yup.string()
		.min(VALIDATION_RULES.ADDRESS.min)
		.required("Address is required"),
});
