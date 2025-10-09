"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Simplified loading state to avoid hydration issues
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#667eea",
        }}
      >
        <CircularProgress size={60} sx={{ color: "white", mb: 2 }} />
        <Typography variant="h6" sx={{ color: "white" }}>
          Authenticating...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
};

export default ProtectedRoute;
