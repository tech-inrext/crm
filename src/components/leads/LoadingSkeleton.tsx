import { memo } from "react";
import { Box, Card, Stack, Skeleton } from "@/components/ui/Component";
import { MODULE_STYLES } from "@/styles/moduleStyles";

const LoadingSkeleton = memo(() => (
  <Box sx={MODULE_STYLES.leads.cardsGrid}>
    {Array.from({ length: 8 }).map((_, index) => (
      <Card
        key={index}
        sx={{
          p: 1.5,
          borderRadius: 3,
          position: "relative",
          overflow: "visible",
          width: "100%",
          minHeight: 230,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -8,
            left: -6,
            height: 22,
            width: 90,
            borderRadius: "4px 4px 4px 0",
            bgcolor: "grey.200",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            height: 24,
            width: 86,
            borderRadius: 12,
            bgcolor: "grey.200",
          }}
        />
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          <Skeleton variant="text" width="50%" height={28} />
          <Stack spacing={0.75}>
            <Skeleton variant="text" width="55%" height={18} />
            <Skeleton variant="text" width="45%" height={18} />
          </Stack>

          <Box sx={{ py: 0.5 }}>
            <Skeleton variant="rectangular" width="100%" height={1} />
          </Box>

          <Stack spacing={1}>
            {Array.from({ length: 4 }).map((__, rowIndex) => (
              <Stack
                key={rowIndex}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Skeleton variant="circular" width={18} height={18} />
                <Skeleton variant="text" width="70%" height={20} />
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Card>
    ))}
  </Box>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

export default LoadingSkeleton;
