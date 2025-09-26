"use client";

import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import HandshakeIcon from "@mui/icons-material/Handshake";

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
    label: "Vendors",
    href: "/dashboard/vendor",
    module: "vendor",
    icon: <AppIcon src="/vendor.png" alt="Vendors" />,
  },
  {
    label: "Vendor Booking",
    href: "/dashboard/vendor-booking",
    module: "cab-vendor",
    icon: <AppIcon src="/cab-vendor.png" alt="Vendor Booking" />,
  },
  {
    label: "Roles",
    href: "/dashboard/roles",
    module: "role",
    icon: <AppIcon src="/roles.png" alt="Roles" />,
  },
  {
    label: "Cab Booking",
    href: "/dashboard/cab-booking",
    module: "cab-booking",
    icon: <AppIcon src="/cab-booking.png" alt="Cab Booking" />,
  },
  {
    label: "MOU",
    href: "/dashboard/mou",
    module: "mou",
    icon: <HandshakeIcon sx={{ color: "#4CAF50" }} />,
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
  const router = useRouter();
  const pathname = usePathname();

  const { getPermissions, user, pendingRoleSelection } = useAuth();

  // Compute accessible sidebar links
  const sidebarLinks = useMemo(() => {
    return user && !pendingRoleSelection
      ? DASHBOARD_SIDEBAR_LINKS.filter((link) => {
          if (!link.module) return true;
          const { hasReadAccess } = getPermissions(link.module);
          return hasReadAccess;
        })
      : [];
  }, [user, pendingRoleSelection, getPermissions]);

  // Redirect to first accessible module after login or role switch
  useEffect(() => {
    if (user && !pendingRoleSelection && sidebarLinks.length > 0) {
      // If current path is not in allowed sidebar links, redirect to first allowed module
      const allowedHrefs = sidebarLinks.map((link) => link.href);
      const isAllowed = allowedHrefs.some((href) => pathname.startsWith(href));
      if (!isAllowed) {
        router.replace(sidebarLinks[0].href);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingRoleSelection, sidebarLinks, pathname]);

  // Determine selected sidebar link
  const selectedLink = useMemo(() => {
    if (!sidebarLinks.length) return null;
    return (
      sidebarLinks.find((link) => pathname.startsWith(link.href)) ||
      sidebarLinks[0]
    );
  }, [sidebarLinks, pathname]);

  return (
    <>
      {user && (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
          {!isMobile && !pendingRoleSelection && (
            <Sidebar
              open={true}
              onClose={() => {}}
              links={sidebarLinks}
              selected={selectedLink?.href}
            />
          )}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                pt: { xs: "64px", sm: "72px", md: "64px", lg: "64px" }, // Always match Navbar height for all breakpoints
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
              selected={selectedLink?.href}
            />
          )}
        </Box>
      )}
    </>
  );
}
