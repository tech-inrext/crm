import { memo } from "react";
import { Box, Card, Skeleton, Stack, Divider, CardContent } from "@/components/ui/Component";
import { VendorsSkeletonProps } from "../types";
import * as styles from "./VendorCard/styles";
import * as commonStyles from "./styles";

const VendorsSkeleton = memo(({ rows = 8 }: VendorsSkeletonProps) => {
  return (
    <Box sx={commonStyles.vendorsGridSx}>
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index} elevation={3} sx={styles.cardRoot}>
          {/* Header row */}
          <Box sx={styles.headerBox}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={styles.nameContainer}>
                <Skeleton variant="text" width={120} height={24} />
                <Skeleton variant="text" width={150} height={20} />
                <Skeleton variant="rectangular" width={80} height={24} sx={commonStyles.skeletonBadgeSx} />
              </Box>
            </Stack>
            <Skeleton variant="circular" width={32} height={32} />
          </Box>

          <Divider />

          <CardContent sx={styles.cardContent}>
            <Stack direction="column" spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={100} height={20} />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={180} height={20} />
              </Stack>
              <Box sx={styles.spacer} />
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={90} height={20} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
});

VendorsSkeleton.displayName = "VendorsSkeleton";

export default VendorsSkeleton;
