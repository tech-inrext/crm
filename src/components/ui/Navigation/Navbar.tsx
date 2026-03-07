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
        bgcolor: "#fff",
        height: "auto",
        borderBottom: "1px solid #E6EEF5",
        overflow: "visible",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 0.3, sm: 1, md: 2 }, // reduce gap for xs
          minWidth: 0,
          pl: { xs: 6, sm: 0 },
          pr: { xs: 1, sm: 2 },
          borderRight: {
            xs: "none",
            sm: "none",
            md: "none",
            lg: "1px solid #E6EEF5",
          },
          width: { xs: "auto", sm: "auto", md: "260px", lg: "260px" },
          px: { xs: 0.5, sm: 1, md: 1.5, lg: 1 },
          py: { xs: 0.5, sm: 1, md: 1 },
          paddingLeft: { xs: "50px", sm: "20px", md: "30px", lg: "30px" },
        }}
      >
        <AvatarComponent
          src="https://inrext.s3.ap-south-1.amazonaws.com/Static+Assets/Inrext+logo.png"
          alt="Inrext"
          sx={{
            color: "#000",
            width: "auto",
            height: { xs: 35, md: 40, lg: 40 },
            borderRadius: "0px",
          }}
        />
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
