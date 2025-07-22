import * as Yup from "yup";

export const leadValidationSchema = Yup.object({
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits only")
    .trim(),
  fullName: Yup.string()
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: Yup.string()
    .email("Invalid email format")
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format")
    .trim()
    .max(100, "Email must be less than 100 characters"),
  propertyType: Yup.string().oneOf(
    ["Rent", "Buy", "Sell", ""],
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
    ["New", "Contacted", "Site Visit", "Closed", "Dropped", ""],
    "Invalid status"
  ),
  source: Yup.string()
    .max(100, "Source must be less than 100 characters")
    .trim(),
  assignedTo: Yup.string().max(
    50,
    "Assigned to must be less than 50 characters"
  ),
  nextFollowUp: Yup.date().nullable(),
  followUpNotes: Yup.array()
    .of(
      Yup.object().shape({
        note: Yup.string()
          .max(500, "Note must be less than 500 characters")
          .trim(),
        date: Yup.date(),
      })
    )
    .default([]),
});
