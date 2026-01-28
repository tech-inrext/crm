// src/components/ui/user-dialog/ContactInfoSection.tsx
import React from "react";
import { Box } from "@/components/ui/Component";
import FormField from "./FormField";
import { FIELD_LABELS } from "@/constants/users";

const ContactInfoSection: React.FC = () => {
  const handlePhoneChange = (field: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (field.onChange) {
      field.onChange({
        target: { name: field.name, value: value },
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <FormField
          name="phone"
          label={FIELD_LABELS.PHONE}
          sx={{ flex: 1 }}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <FormField
          name="altPhone"
          label={FIELD_LABELS.ALT_PHONE}
          sx={{ flex: 1 }}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
      </Box>

      <FormField name="address" label={FIELD_LABELS.ADDRESS} />
    </>
  );
};

export default ContactInfoSection;