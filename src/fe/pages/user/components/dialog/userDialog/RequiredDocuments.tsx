"use client";

import React, { memo } from "react";
import { Box, Typography } from "@mui/material";
import { FIELD_LABELS } from "@/fe/pages/user/constants/users";
import { DOCUMENTS } from "@/fe/pages/user/constants/documents";
import DocumentUploadField from "@/components/ui/documentUploadBox/DocumentUploadField";
import { requiredDocumentsStyles as styles } from "./styles";

const RequiredDocuments = memo(() => {
  return (
    <Box component="section" sx={styles.container}>
      <Typography variant="h6" sx={styles.title}>
        Required Documents
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={styles.subtitle}>
        Only JPG files allowed
      </Typography>

      <Box sx={styles.grid}>
        {DOCUMENTS.map(({ id, fieldName, labelKey }) => (
          <DocumentUploadField
            key={id}
            id={id}
            fieldName={fieldName}
            label={FIELD_LABELS[labelKey]}
          />
        ))}
      </Box>
    </Box>
  );
});

RequiredDocuments.displayName = "RequiredDocuments";

export default RequiredDocuments;
