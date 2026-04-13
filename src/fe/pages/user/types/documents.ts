import { FIELD_LABELS } from "@/fe/pages/user/constants/users";

/**
 * Document upload configuration
 */
export interface DocumentConfig {
  id: string;
  fieldName: string;
  labelKey: keyof typeof FIELD_LABELS;
}

export interface ForFreelancerProps {
  loggedInSlab?: string;
  isAdmin?: boolean;
}