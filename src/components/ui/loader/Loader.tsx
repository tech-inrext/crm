import React from "react";
import CircularProgress from "@/components/ui/Component/CircularProgress";
import Box from "@/components/ui/Component/Box";

const Loader: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100px"
  >
    <CircularProgress />
  </Box>
);

export default Loader;
