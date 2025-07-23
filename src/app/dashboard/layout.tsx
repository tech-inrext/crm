"use client";

import React, { useState, useMemo } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

const AppIcon = ({
  src,
  alt,
  size = 24,
}: {
  src: string;
  alt: string;
  size?: number;
}) => (
  <Image
    src={src}
    alt={alt}
    width={size}
    height={size}
    style={{ display: "block" }}
    priority={false}
    unoptimized
  />
);

export const DASHBOARD_SIDEBAR_LINKS = [
  {
    label: "Leads",
    href: "/dashboard/leads",
    module: "lead",
    icon: <AppIcon src="/leads.png" alt="Leads" />,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    module: "employee",
    icon: <AppIcon src="/users.png" alt="Users" />,
  },
  {
    label: "Roles",
    href: "/dashboard/roles",
    module: "role",
    icon: <AppIcon src="/roles.png" alt="Roles" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { getPermissions, user, pendingRoleSelection } = useAuth();

  const sidebarLinks = useMemo(() => {
    return user && !pendingRoleSelection
      ? DASHBOARD_SIDEBAR_LINKS.filter((link) => {
          if (!link.module) return true;
          const { hasReadAccess } = getPermissions(link.module);
          return hasReadAccess;
        })
      : [];
  }, [user, pendingRoleSelection, getPermissions]);

  return (
    <>
      {user && (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
          {!isMobile && !pendingRoleSelection && (
            <Sidebar open={true} onClose={() => {}} links={sidebarLinks} />
          )}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
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
                width: "100%",
              }}
            >
              {children}
            </Box>
          </Box>
          {isMobile && !pendingRoleSelection && (
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              links={sidebarLinks}
            />
          )}
        </Box>
      )}
    </>
  );
}
