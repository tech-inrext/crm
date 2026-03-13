"use client";

import React from "react";
import { Box, Card, Stack, Skeleton } from "@/components/ui/Component";
import { roleCardStyles } from "./card/styles";
import { RolesSkeletonProps } from "../types";


const RolesSkeleton: React.FC<RolesSkeletonProps> = ({ count = 6 }) => (
  <Box sx={roleCardStyles.loadingGrid}>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} sx={roleCardStyles.loadingCard}>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="circular" width={28} height={28} />
          </Box>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ borderRadius: 1 }}
          />
        </Stack>
      </Card>
    ))}
  </Box>
);

export default RolesSkeleton;
