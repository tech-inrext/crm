import { memo } from "react";
import { Box, Card, Stack, Skeleton } from "@mui/material";

const LoadingSkeleton = memo(() => (
  <Box sx={{ mt: 2 }}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} sx={{ mb: 2, p: 2 }}>
        <Stack spacing={1}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="rectangular" width="100%" height={60} />
        </Stack>
      </Card>
    ))}
  </Box>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

export default LoadingSkeleton;
