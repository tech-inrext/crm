import * as Yup from "yup";
import dayjs from "dayjs";

/* ---------------- CONSTANTS ---------------- */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/* ---------------- FILE VALIDATION ---------------- */

const attachmentFile = Yup.mixed()
  .test("file-size", "File must be less than 5MB", (value: any) => {
    if (!value) return true;
    return value.file?.size <= MAX_FILE_SIZE;
  })
  .test("file-type", "Unsupported file format", (value: any) => {
    if (!value) return true;
    return ALLOWED_FILE_TYPES.includes(value.file?.type);
  });

/* ---------------- SCHEMA ---------------- */

export const noticeValidationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be at most 120 characters")
    .required("Notice title is required")
    .matches(/^[a-zA-Z0-9\s.,()\-_/]+$/, "Title contains invalid characters"),

  description: Yup.string()
    .trim()
    .required("Notice description is required")
    .test("not-empty-html", "Notice description is required", (value) => {
      if (!value) return false;
      const stripped = value.replace(/<(.|\n)*?>/g, "").trim();
      return stripped.length > 0;
    }),

  category: Yup.string().required("Category is required"),

  priority: Yup.string()
    .oneOf(["Urgent", "Important", "Info"])
    .required("Priority is required"),

  departments: Yup.string().required("Department is required"),

  expiry: Yup.mixed()
    .nullable()
    .test("not-past-date", "Expiry date cannot be in the past", (value) => {
      if (!value) return true;
      return dayjs(value).isAfter(dayjs().subtract(1, "day"));
    }),

  pinned: Yup.boolean(),

  attachments: Yup.array().of(attachmentFile).max(5, "Maximum 5 files allowed"),
});
