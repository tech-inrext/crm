import { Email, Phone } from "@mui/icons-material";

export const getContactPersonalFields = () => [
  { label: "Email", dataKey: "email", icon: Email },
  { label: "Phone", dataKey: "phone", icon: Phone },
  { label: "WhatsApp", dataKey: "altPhone" },
  { label: "Gender", dataKey: "gender" },
  { label: "Date of Birth", dataKey: "dateOfBirth", isDate: true },
  { label: "Specialization", dataKey: "specialization" },
  { label: "Father's Name", dataKey: "fatherName" },
  { label: "Address", dataKey: "address" },
];

export const getOrganizationFields = (departmentName: string, managerName: string) => [
  { label: "Designation", dataKey: "designation" },
  { label: "Joining Date", dataKey: "joiningDate", isDate: true },
  {
    label: "Department",
    dataKey: "departmentName",
    isCustom: true,
    customValue: departmentName,
  },
  {
    label: "Manager",
    dataKey: "managerName",
    isCustom: true,
    customValue: managerName,
  },
  { label: "Branch", dataKey: "branch" },
  { label: "Slab Percentage", dataKey: "slabPercentage", suffix: "%" },
];
