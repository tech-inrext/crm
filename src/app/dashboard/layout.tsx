"use client";

import React, { Suspense, lazy, useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { DASHBOARD_SIDEBAR_LINKS, SidebarLink } from "./page";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getPermissions, user, pendingRoleSelection } = useAuth();
  const sidebarLinks =
    user && !pendingRoleSelection
      ? DASHBOARD_SIDEBAR_LINKS.filter((link) => {
          if (!link.module) return true;
          const { hasReadAccess } = getPermissions(link.module);
          return hasReadAccess;
        })
      : [];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {/* Sidebar - always fixed on desktop */}
      {!isMobile && user && !pendingRoleSelection && (
        <Sidebar open={true} onClose={() => {}} links={sidebarLinks} />
      )}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Fixed Navbar - always on top */}
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* Main content area, with left padding for sidebar on desktop */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: 7, sm: 8, md: 6, lg: 3 },
            pb: { xs: 2, sm: 3 },
            pl: { xs: 0, lg: "260px" },
            pr: { xs: 0 },
            transition: "padding-left 0.3s ease",
            minHeight: "100vh",
            width: { xs: "100%", lg: "100%" },
            overflow: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
      {/* Sidebar as Drawer for mobile */}
      {isMobile && user && !pendingRoleSelection && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          links={sidebarLinks}
        />
      )}
    </Box>
  );
}
