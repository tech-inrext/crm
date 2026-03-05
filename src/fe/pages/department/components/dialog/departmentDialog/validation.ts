import * as Yup from "yup";
import { VALIDATION_RULES } from "@/fe/pages/department/constants/departments";

export const departmentValidationSchema = Yup.object({
  name: Yup.string()
    .min(
      VALIDATION_RULES.NAME.min,
      `Name must be at least ${VALIDATION_RULES.NAME.min} characters`,
    )
    .max(
      VALIDATION_RULES.NAME.max,
      `Name can't exceed ${VALIDATION_RULES.NAME.max} characters`,
    )
    .required("Department name is required"),

  description: Yup.string()
    .max(
      VALIDATION_RULES.DESCRIPTION.max,
      `Description can't exceed ${VALIDATION_RULES.DESCRIPTION.max} characters`,
    )
    .optional(),

  managerId: Yup.string().optional(),
});
