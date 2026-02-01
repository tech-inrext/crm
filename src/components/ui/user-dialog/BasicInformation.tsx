// src/components/ui/user-dialog/BasicInformation.tsx
import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import PhotoUpload from "./PhotoUpload";
import FormField from "./FormField";
import PersonalInfoSection from "./PersonalInfoSection";
import ContactInfoSection from "./ContactInfoSection";
import NomineeSection from "./NomineeSection";
import RequiredDocuments from "./RequiredDocuments";
import { FIELD_LABELS } from "@/constants/users";

interface BasicInformationProps {
  editId: string | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({ editId }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
        {FIELD_LABELS.BASIC_INFO}
      </Typography>

      {/* Photo Upload Section */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <PhotoUpload />
        </Box>
      </Box>

      {/* Basic Information Fields */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
          mt: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <FormField name="name" label={FIELD_LABELS.FULL_NAME} autoFocus />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormField name="email" label={FIELD_LABELS.EMAIL} />
        </Box>
      </Box>

      <ContactInfoSection />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <FormField name="specialization" label={FIELD_LABELS.SPECIALIZATION} sx={{ flex: 1 }} />
        <FormField name="fatherName" label={FIELD_LABELS.FATHER_NAME} sx={{ flex: 1 }} />
      </Box>

      <PersonalInfoSection />

      <RequiredDocuments />
      <NomineeSection />
    </>
  );
};

export default BasicInformation;