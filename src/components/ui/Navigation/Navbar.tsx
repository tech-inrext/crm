import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@/components/ui/Component/IconButton";
import MenuIcon from "@/components/ui/Component/MenuIcon";
import Typography from "@/components/ui/Component/Typography";
import { useTheme, useMediaQuery } from "../Component";
import AvatarComponent from "@/components/ui/Component/Avatar";
import ProfileMenu from "../profile/ProfileMenu";
import NotificationBell from "../notifications/NotificationBell";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        px: { xs: 0.5, sm: 1, md: 2 },
        py: { xs: 0.25, sm: 0.5, md: 1 },
        bgcolor: "#fff",
        height: { xs: 64, sm: 72, md: 64 },
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      <IconButton
        color="inherit"
        edge="start"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        sx={{
          mr: { xs: 0.2, sm: 0.5, md: 2 }, // slight gap for xs
          ml: { xs: 0.5, sm: 0, md: 0 }, // add left margin for xs
          display: { xs: "block", lg: "none" },
          p: { xs: 0.5, sm: 1, md: 1.5 },
          minWidth: { xs: 44, sm: 64, md: 80 },
          minHeight: { xs: 40, sm: 44 },
          outline: "none",
          boxShadow: "none",
          background: "none",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.1)",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "none",
          },
        }}
      >
        <MenuIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
      </IconButton>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 0.3, sm: 1, md: 2 }, // reduce gap for xs
          minWidth: 0,
          flex: 1,
        }}
      >
        <AvatarComponent
          src="/inrext.png"
          alt="Inrext"
          sx={{
            color: "#000",
            width: { xs: 28, sm: 32, md: 40 },
            height: { xs: 28, sm: 32, md: 40 },
            borderRadius: "8px",
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Montserrat", calibri, sans-serif',
            fontWeight: 800,
            fontSize: { xs: 22, sm: 26, md: 32 },
            color: "#000",
            letterSpacing: 1,
            ml: { xs: 0.5, sm: 1, md: 1 }, // slightly increase margin left for xs
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Inrext
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <NotificationBell />
        <ProfileMenu />
      </Box>
    </Box>
  );
};

export default Navbar;
