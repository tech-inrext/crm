
import * as Yup from "yup";

export const leadValidationSchema = Yup.object({
  phone: Yup.string()
    .required("Phone number is required")
    .test("is-valid-phone", "Invalid phone format", (value) => {
      if (!value) return false;
      // Allow masked phone (e.g., 73******21)
      if (value.includes("*")) return true;
      // standard 10 digit regex
      return /^[0-9]{10}$/.test(value);
    })
    .trim(),
  fullName: Yup.string()
    .min(3, "name must be at least 3 characters")
    .max(50, "name must be at most 50 characters")
    // .required("Full Name is required")
    .trim(),
  email: Yup.string()
    .test("is-valid-email", "Invalid email format", (value) => {
      if (!value) return true;
      // Allow masked email (e.g., mo******v@gmail.com)
      if (value.includes("*")) return true;
      // standard regex
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    })
    .trim()
    .max(100, "Email must be less than 100 characters"),
  propertyType: Yup.string().oneOf(
    // ["Rent", "Buy", "Sell", ""],
    ["residential", "commercial", "plot", ""],
    "Invalid property type"
  ),
  location: Yup.string()
    .max(200, "Location must be less than 200 characters")
    .trim(),
  budgetRange: Yup.string()
    .oneOf(
      [
        "<1 Lakh",
        "1 Lakh to 10 Lakh",
        "10 Lakh to 20 Lakh",
        "20 Lakh to 30 Lakh",
        "30 Lakh to 50 Lakh",
        "50 Lakh to 1 Crore",
        ">1 Crore",
        "",
      ],
      "Invalid budget range"
    )
    .trim(),
  status: Yup.string().oneOf(
    // ["New", "Contacted", "Site Visit", "Closed", "Dropped", ""],
    ["new", "in progress", "details shared", "closed", "not interested", ""],
    "Invalid status"
  ),
  source: Yup.string()
    .max(100, "Source must be less than 100 characters")
    .trim(),
  assignedTo: Yup.string().max(
    50,
    "Assigned to must be less than 50 characters"
  ),
  // Removed nextFollowUp and followUpNotes fields from validation
});
