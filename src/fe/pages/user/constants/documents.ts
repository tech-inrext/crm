import { FIELD_LABELS } from "./users";
import { DocumentConfig } from "@/fe/pages/user/types/documents";

export const DOCUMENTS: DocumentConfig[] = [
  { id: "aadhar-upload", fieldName: "aadharFile", labelKey: "AADHAR" },
  { id: "pan-upload", fieldName: "panFile", labelKey: "PAN" },
  { id: "bank-upload", fieldName: "bankProofFile", labelKey: "BANK_PROOF" },
  { id: "sig-upload", fieldName: "signatureFile", labelKey: "SIGNATURE" },
];
