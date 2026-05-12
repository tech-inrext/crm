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
  Diversity3,
  Groups,
  GroupAdd,
  Assignment,
  Campaign,
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
    module: "analytics",
    icon: <Analytics color="primary" />,
  },
  {
    label: "Notice Board",
    href: "/dashboard/Notice-Board",
    icon: <Campaign color="primary" />
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    module: "lead",
    icon: <ContactPhone color="primary" />,
  },
  {
    label: "Business Partners",
    href: "/dashboard/users",
    module: "employee",
    icon: <Groups color="primary" />,
  },
  {
    label: "Roles",
    href: "/dashboard/roles",
    module: "role",
    icon: <ManageAccounts color="primary" />,
  },
  {
    label: "Teams",
    href: "/dashboard/teams",
    module: "team",
    icon: <GroupAdd color="primary" />,
  },
  {
    label: "Pillars",
    href: "/dashboard/pillars",
    module: "pillar",
    icon: <People color="primary" />,
  },
  {
    label: "MOU",
    href: "/dashboard/mou",
    module: "mou",
    icon: <Diversity3 color="primary" />,
  },
  {
    label: "Vendors",
    href: "/dashboard/vendor",
    module: "vendor",
    icon: <Person color="primary" />,
  },
  {
    label: "Cab Booking",
    href: "/dashboard/cab-booking",
    module: "cab-booking",
    icon: <LocalTaxi color="primary" />,
  },
  {
    label: "Vendor Booking",
    href: "/dashboard/vendor-booking",
    module: "cab-vendor",
    icon: <Assignment color="primary" />,
  },
  {
    label: "Properties",
    href: "/dashboard/properties",
    module: "property",
    icon: <Apartment color="primary" />,
  },
  {
    label: "Booking Login",
    href: "/dashboard/booking-login",
    module: "booking-login",
    icon: <Description color="primary" />,
  },
  {
    label: "Training Videos",
    href: "/dashboard/training-videos",
    module: "training-videos",
    icon: <VideoLibrary color="primary" />,
  },
  {
    label: "Departments",
    href: "/dashboard/department",
    module: "department",
    icon: <GroupIcon color="primary" />,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: <Notifications color="primary" />,
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

          // Roles module only for system admins
          if (link.module === "role") return Boolean(user.isSystemAdmin);

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

  return (
    <>
      {user && (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
          {!isMobile && !pendingRoleSelection && (
            <Sidebar
              open={true}
              onClose={() => {}}
              links={sidebarLinks}
              // selected={selectedLink?.href}
            />
          )}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <Box
              key={String(
                typeof user?.currentRole === "object"
                  ? user?.currentRole?._id
                  : user?.currentRole,
              )}
              component="main"
              sx={{
                flexGrow: 1,
                pt: { xs: "64px", sm: "72px", md: "64px", lg: "64px" }, // Always match Navbar height for all breakpoints
                pb: { xs: 2, sm: 3 },
                pl: { xs: 0, lg: "260px" },
                pr: { xs: 0 },
                transition: "padding-left 0.3s ease",
                height: "calc(100vh - 64px)",
                bgcolor: "background.default",
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
