"use client";

import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/ui/Navigation/Sidebar";
import Navbar from "@/components/ui/Navigation/Navbar";
import { Box, useMediaQuery, useTheme } from "@/components/ui/Component";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import HandshakeIcon from "@mui/icons-material/Handshake";
import {
  RealEstateAgent,
  Group as GroupIcon,
  Description,
  VideoLibrary,
  People,
  Notifications,
  Analytics,
  ContactPhone,
  ManageAccounts,
  Person,
  LocalTaxi,
  Apartment,
} from "@mui/icons-material";

// const AppIcon = ({
//   src,
//   alt,
//   size = 24,
// }: {
//   src: string;
//   alt: string;
//   size?: number;
// }) => (
//   <Image
//     src={src}
//     alt={alt}
//     width={size}
//     height={size}
//     style={{ display: "block" }}
//     priority={false}
//     unoptimized
//   />
// );

export const DASHBOARD_SIDEBAR_LINKS = [
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: <Analytics sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    module: "lead",
    icon: <ContactPhone sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    module: "employee",
    icon: <GroupIcon sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Roles",
    href: "/dashboard/roles",
    module: "role",
    icon: <ManageAccounts sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Teams",
    href: "/dashboard/teams",
    module: "team",
    icon: <GroupIcon sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Vendors",
    href: "/dashboard/vendor",
    module: "vendor",
    icon: <Person sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Cab Booking",
    href: "/dashboard/cab-booking",
    module: "cab-booking",
    icon: <LocalTaxi sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Properties",
    href: "/dashboard/properties",
    module: "property",
    icon: <Apartment sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Booking Login",
    href: "/dashboard/booking-login",
    module: "booking-login",
    icon: <Description sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Training Videos",
    href: "/dashboard/training-videos",
    module: "training-videos",
    icon: <VideoLibrary sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Pillars",
    href: "/dashboard/pillars",
    module: "pillar",
    icon: <People sx={{ color: "#3785FF" }} />,
  },
  {
    label: "MOU",
    href: "/dashboard/mou",
    module: "mou",
    icon: <People sx={{ color: "#3785FF" }} />,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: <Notifications sx={{ color: "#3785FF" }} />,
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

  // const sidebarLinks = useMemo(() => {
  //   const filteredLinks =
  //     user && !pendingRoleSelection
  //       ? DASHBOARD_SIDEBAR_LINKS.filter((link) => {
  //           if (!link.module) return true;
  //           // ✅ Property always allow
  //           if (link.module === "property") return true;

  //           const { hasReadAccess } = getPermissions(link.module);
  //           return hasReadAccess;
  //         })
  //       : [];

  //   return filteredLinks;
  // }, [user, pendingRoleSelection, getPermissions]);

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
              onClose={() => { }}
              links={sidebarLinks}
            // selected={selectedLink?.href}
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
            // selected={selectedLink?.href}
            />
          )}
        </Box>
      )}
    </>
  );
}
