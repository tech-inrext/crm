"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  memo,
  lazy,
  Suspense,
} from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Container,
} from "@mui/material";
import Image from "next/image";
import Sidebar from "../../components/ui/Sidebar";
import Navbar from "../../components/ui/Navbar";
import PermissionGuard from "../../components/PermissionGuard";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/router";

// Lazy load heavy components for better performance
const Leads = lazy(() => import("./leads/page"));
const Users = lazy(() => import("./Users/page"));
const Roles = lazy(() => import("./Roles/page"));

// Loading component for Suspense
const LoadingFallback = memo(() => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
));
LoadingFallback.displayName = "LoadingFallback";

// Reusable Icon Component for better maintainability
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

// Icon instances
const DashboardIcon = memo(() => (
  <AppIcon src="/dasboard.png" alt="Dashboard" />
));
const LeadsIcon = memo(() => <AppIcon src="/leads.png" alt="Leads" />);
const UsersIcon = memo(() => <AppIcon src="/users.png" alt="Users" />);
const RolesIcon = memo(() => <AppIcon src="/roles.png" alt="Roles" />);

DashboardIcon.displayName = "DashboardIcon";
LeadsIcon.displayName = "LeadsIcon";
UsersIcon.displayName = "UsersIcon";
RolesIcon.displayName = "RolesIcon";

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

// Main dashboard layout component
const Dashboard: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const { getPermissions } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Enhanced mobile-first responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Changed from lg to md for better mobile support
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Sidebar should always be open on desktop, controllable on mobile and tablet
  const sidebarIsOpen = isMobile || isTablet ? sidebarOpen : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoute = (route) => {
    console.log("route", route);
    router.push(`/dashboard/${route}`);
  };

  // Memoized sidebar links for better performance
  const allSidebarLinks = useMemo<SidebarLink[]>(
    () => [
      {
        label: "Dashboard",
        href: "dashboard",
        icon: <DashboardIcon />,
        onClick: () => handleRoute("dashboard"),
      },
      {
        label: "Leads",
        href: "leads",
        module: "lead",
        icon: <LeadsIcon />,
        onClick: () => handleRoute("leads"),
      },
      {
        label: "Users",
        href: "users",
        module: "employee",
        icon: <UsersIcon />,
        onClick: () => handleRoute("users"),
      },
      {
        label: "Roles",
        href: "roles",
        module: "role",
        icon: <RolesIcon />,
        onClick: () => handleRoute("roles"),
      },
    ],
    []
  );

  // Filter sidebar links based on user permissions
  const sidebarLinks = useMemo(() => {
    return allSidebarLinks.filter((link) => {
      const { hasReadAccess } = getPermissions(link.module);
      return !link.module || hasReadAccess;
    });
  }, [allSidebarLinks, getPermissions]);

  // Render content based on selected page
  const renderContent = () => {
    switch (selected) {
      case "leads":
        return (
          <PermissionGuard module="lead" action="read">
            <Leads />
          </PermissionGuard>
        );
      case "users":
        return (
          <PermissionGuard module="employee" action="read">
            <Users />
          </PermissionGuard>
        );
      case "roles":
        return (
          <PermissionGuard module="role" action="read">
            <Roles />
          </PermissionGuard>
        );
      default:
        return (
          <Box
            sx={{
              p: { xs: 3, sm: 4, md: 5 }, // Increased padding
              textAlign: "center",
              mt: { xs: 2, md: 4 }, // Added top margin
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" }, // Slightly larger
                fontWeight: 700,
                color: "primary.main",
                mb: { xs: 3, md: 4 }, // Increased bottom margin
              }}
            >
              Welcome to Dashboard
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: "1rem", sm: "1.125rem" }, // Slightly larger
                maxWidth: "600px",
                mx: "auto",
                lineHeight: 1.6, // Better line height
              }}
            >
              Select an option from the sidebar to get started.
            </Typography>
          </Box>
        );
    }
  };

  // Show loading state during mount to prevent hydration mismatch
  if (!mounted) {
    return <LoadingFallback />;
  }

  // Mobile-first responsive layout
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f5f7fa",
      }}
    >
      {/* Fixed Navbar */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />{" "}
      {/* Sidebar - responsive */}
      <Sidebar
        open={sidebarIsOpen}
        onClose={() => setSidebarOpen(false)}
        links={sidebarLinks}
      />
      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 7, sm: 8, md: 6, lg: 3 }, // Better responsive top padding
          pb: { xs: 2, sm: 3 }, // Responsive bottom padding
          pl: { xs: 0, lg: "260px" }, // Account for sidebar on large screens only
          pr: { xs: 0 }, // No right padding needed
          transition: "padding-left 0.3s ease",
          minHeight: "100vh",
          width: { xs: "100%", lg: "calc(100% - 260px)" }, // Account for sidebar width
          overflow: "hidden", // Prevent horizontal scroll
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            py: { xs: 1, sm: 2, md: 3 }, // Responsive vertical padding
            px: { xs: 1, sm: 2, md: 3 }, // Responsive horizontal padding
            minHeight: "calc(100vh - 64px)",
            maxWidth: "100%", // Prevent overflow
          }}
        >
          <Suspense fallback={<LoadingFallback />}>{renderContent()}</Suspense>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
