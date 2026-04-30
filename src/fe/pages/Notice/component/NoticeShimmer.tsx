"use client";

import React from "react";
import { Card, CardContent, Skeleton, Stack, Divider } from "@mui/material";

export default function NoticeShimmer() {
  return (
    <Card className="!rounded-2xl">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Skeleton variant="rounded" width={100} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Stack>

        <Skeleton variant="text" height={30} />
        <Skeleton variant="text" height={30} />
        <Skeleton variant="text" height={20} width="80%" />

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between">
          <Skeleton width={100} />
          <Skeleton width={80} />
        </Stack>
      </CardContent>
    </Card>
  );
}
