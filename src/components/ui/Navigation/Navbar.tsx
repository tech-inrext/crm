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
    <Box className="fixed top-0 left-0 right-0 z-[1300] flex items-center justify-between bg-white h-auto border-b border-[#E6EEF5] overflow-visible">
      <Box
        className="
  flex items-center min-w-0
  gap-[2px] sm:gap-1 md:gap-2
  pl-[50px] sm:pl-[20px] md:pl-[30px] lg:pl-[30px]
  pr-1 sm:pr-2
  w-auto md:w-[260px]
  px-[2px] sm:px-1 md:px-1.5 lg:px-1
  py-[2px] sm:py-1 md:py-1
  lg:border-r lg:border-[#E6EEF5]
"
      >
        <Box
          sx={{
            height: { xs: 35, md: 40 },
            width: 120,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
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
      {/* <ProfileMenu /> */}
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
          position: { xs: "absolute", sm: "relative" },
          left: { xs: 8, sm: "auto" },
          top: { xs: "50%", sm: "auto" },
          transform: { xs: "translateY(-50%)", sm: "none" },
          zIndex: 1400,
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
        <MenuIcon sx={{ fontSize: { xs: 32, md: 24 } }} />
      </IconButton>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <NotificationBell />
        <ProfileMenu />
      </Box>
    </Box>
  );
};

export default Navbar;
