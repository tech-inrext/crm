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
    icon: <Analytics />,
  },
  {
    label: "Notice Board",
    href: "/dashboard/Notice-Board",
icon: <Campaign />  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    module: "lead",
    icon: <ContactPhone />,
  },
  {
    label: "Business Partners",
    href: "/dashboard/users",
    module: "employee",
    icon: <Groups />,
  },
  {
    label: "Roles",
    href: "/dashboard/roles",
    module: "role",
    icon: <ManageAccounts />,
  },
  {
    label: "Teams",
    href: "/dashboard/teams",
    module: "team",
    icon: <GroupAdd />,
  },
  {
    label: "Pillars",
    href: "/dashboard/pillars",
    module: "pillar",
    icon: <People />,
  },
  {
    label: "MOU",
    href: "/dashboard/mou",
    module: "mou",
    icon: <Diversity3 />,
  },
  {
    label: "Vendors",
    href: "/dashboard/vendor",
    module: "vendor",
    icon: <Person />,
  },
  {
    label: "Cab Status",
    href: "/dashboard/cab-booking",
    module: "cab-booking",
    icon: <LocalTaxi />,
  },
  {
    label: "Vendor Booking",
    href: "/dashboard/vendor-booking",
    module: "cab-vendor",
    icon: <Assignment />,
  },
  {
    label: "Properties",
    href: "/dashboard/properties",
    module: "property",
    icon: <Apartment />,
  },
  {
    label: "Booking Login",
    href: "/dashboard/booking-login",
    module: "booking-login",
    icon: <Description />,
  },
  {
    label: "Training Videos",
    href: "/dashboard/training-videos",
    module: "training-videos",
    icon: <VideoLibrary />,
  },
  {
    label: "Landing Popup",
    href: "/dashboard/landing-popup",
    module: "landing-popup",
    icon: <Campaign />,
  },
  {
    label: "Departments",
    href: "/dashboard/department",
    module: "department",
    icon: <GroupIcon />,
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: <Notifications />,
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
    const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";

    return user && !pendingRoleSelection
      ? DASHBOARD_SIDEBAR_LINKS.filter((link) => {
          // Hide Analytics if not staging
          if (!isStaging && link.module === "analytics") return false;

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
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
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
                backgroundColor: "#f9f9f9",
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
