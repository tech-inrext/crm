"use client";

import React, {
  Suspense,
  lazy,
  useState,
  memo,
  useMemo,
  useEffect,
} from "react";
import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
const AppIcon = memo(
  ({ src, alt, size = 24 }: { src: string; alt: string; size?: number }) => (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{
        display: "block",
      }}
      priority={false}
      unoptimized
    />
  )
);
AppIcon.displayName = "AppIcon";

export type SidebarLink =
  | { kind: "header"; title: string }
  | { kind: "divider" }
  | {
      label: string;
      href: string;
      module?: string;
      icon?: React.ReactNode;
      onClick?: () => void;
    };

const LeadsIcon = memo(() => <AppIcon src="/leads.png" alt="Leads" />);
const UsersIcon = memo(() => <AppIcon src="/users.png" alt="Users" />);
const RolesIcon = memo(() => <AppIcon src="/roles.png" alt="Roles" />);

export const DASHBOARD_SIDEBAR_LINKS: SidebarLink[] = [
  {
    label: "Leads",
    href: "/dashboard/leads",
    module: "lead",
    icon: <LeadsIcon />,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    module: "employee",
    icon: <UsersIcon />,
  },
  {
    label: "Roles",
    href: "/dashboard/roles",
    module: "role",
    icon: <RolesIcon />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();
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
  }, [user]);

  // useEffect(() => {
  //   if (!user) {
  //     router.push("/login");
  //   }
  // }, [user]);

  return (
    <>
      {user && (
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
      )}
    </>
  );
}
