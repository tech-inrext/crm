import { TableHeader } from "@/components/ui/TableMap";
import type { Lead } from "@/types/lead";

export const leadsTableHeader: TableHeader<Lead>[] = [
  { label: "Name", dataKey: "fullName" },
  { label: "Email", dataKey: "email" },
  { label: "Phone", dataKey: "phone" },
  { label: "Status", dataKey: "status" },
  { label: "Budget", dataKey: "budgetRange" },
  { label: "Next Follow-up", dataKey: "nextFollowUp" },
  {
    label: "Actions",
    component: (row, handlers) => null, // To be overridden in the page for action buttons
  },
];
