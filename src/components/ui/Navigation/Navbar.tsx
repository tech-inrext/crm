import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@/components/ui/Component/IconButton";
import MenuIcon from "@/components/ui/Component/MenuIcon";
import Typography from "@/components/ui/Component/Typography";
import { useTheme, useMediaQuery } from "../Component";
import AvatarComponent from "@/components/ui/Component/Avatar";
import ProfileMenu from "../profile/ProfileMenu";
import NotificationBell from "../notifications/NotificationBell";
import ThemeToggle from "../ThemeToggle";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box 
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "between",
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        height: "auto",
        overflow: "visible"
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: 0,
          gap: { xs: "2px", sm: 1, md: 2 },
          pl: { xs: "50px", sm: "20px", md: "30px", lg: "30px" },
          pr: { xs: 1, sm: 2 },
          width: { xs: "auto", md: "260px" },
          px: { xs: "2px", sm: 1, md: 1.5, lg: 1 },
          py: { xs: "2px", sm: 1, md: 1 },
          borderRight: { lg: 1 },
          borderColor: { lg: "divider" }
        }}
      >
        <Box
          sx={{
            height: { xs: 35, md: 40 },
            width: 120,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            filter: isDarkMode ? "brightness(0) invert(1)" : "none"
          }}
        >
          <img
            src="https://inrext.s3.ap-south-1.amazonaws.com/Static%20Assets/Inrext%20logo.png"
            alt="Inrext"
            style={{
              height: "100%",
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        </Box>
      </Box>
      
      <Box sx={{ flex: 1 }} />

      <IconButton
        color="inherit"
        edge="start"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          mr: { xs: 0.2, sm: 0.5, md: 2 },
          ml: { xs: 0.5, sm: 0, md: 0 },
          display: { xs: "block", lg: "none" },
          p: { xs: 0.5, sm: 1, md: 1.5 },
          minWidth: { xs: 44, sm: 64, md: 80 },
          minHeight: { xs: 40, sm: 44 },
          position: { xs: "absolute", sm: "relative" },
          left: { xs: 8, sm: "auto" },
          top: { xs: "50%", sm: "auto" },
          transform: { xs: "translateY(-50%)", sm: "none" },
          zIndex: 1400,
          outline: "none",
          boxShadow: "none",
          background: "none",
          "&:hover": {
            bgcolor: "action.hover",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "none",
          },
        }}
      >
        <MenuIcon sx={{ fontSize: { xs: 32, md: 24 } }} />
      </IconButton>
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: 2 }}>
        <ThemeToggle />
        <NotificationBell />
        <ProfileMenu />
      </Box>
    </Box>
  );
};

export default Navbar;
