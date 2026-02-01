// src/components/ui/user-dialog/PersonalInfoSection.tsx
import React from "react";
import { Box } from "@/components/ui/Component";
import FormField from "./FormField";
import { GENDER_OPTIONS, FIELD_LABELS } from "@/constants/users";

const genderOptions = GENDER_OPTIONS.map((gender) => ({
  value: gender,
  label: gender,
}));

const PersonalInfoSection: React.FC = () => {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <FormField name="gender" label={FIELD_LABELS.GENDER} select options={genderOptions} sx={{ flex: 1 }} />
        <FormField name="age" label={FIELD_LABELS.AGE} type="number" sx={{ flex: 1 }} />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <FormField 
          name="joiningDate" 
          label={FIELD_LABELS.JOINING_DATE} 
          type="date" 
          sx={{ 
            flex: 1,
            height: 56,
            '& input[type="date"]': {
              height: "56px",
              fontSize: "16px",
              WebkitAppearance: "none",
              MozAppearance: "textfield",
              appearance: "none",
              lineHeight: "normal",
              padding: "0 14px",
            },
          }}
          InputLabelProps={{ shrink: true }}
        />
        <FormField name="designation" label={FIELD_LABELS.DESIGNATION} sx={{ flex: 1 }} />
      </Box>

      <FormField
        name="panNumber"
        label={`${FIELD_LABELS.PAN_NUMBER}`}
        required
        helperText="Required. Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)"
      />
    </>
  );
};

export default PersonalInfoSection;