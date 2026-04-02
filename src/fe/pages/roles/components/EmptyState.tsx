"use client";

import React from "react";
import { Typography } from "@/components/ui/Component";

const EmptyState: React.FC = () => (
  <Typography textAlign="center" width="100%" mt={2} color="text.primary">
    No roles found.
  </Typography>
);

export default EmptyState;
