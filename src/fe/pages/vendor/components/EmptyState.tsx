import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import HandshakeIcon from "@/components/ui/Component/HandshakeIcon";
import * as styles from "./styles";

const EmptyState: React.FC = () => (
  <Box sx={styles.emptyStateContainerSx}>
    <Box sx={styles.emptyStateIconContainerSx}>
      <HandshakeIcon sx={styles.emptyStateIconSx} />
    </Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      No vendors found
    </Typography>
    <Typography variant="body2" sx={styles.emptyStateDescriptionSx}>
      Try adjusting your search filters or add a new vendor to get started.
    </Typography>
  </Box>
);

export default EmptyState;
