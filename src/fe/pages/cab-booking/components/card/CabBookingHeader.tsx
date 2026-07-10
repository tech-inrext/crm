import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import Avatar from "@/components/ui/Component/Avatar";
import { getProjectName } from "@/fe/pages/cab-booking/constants/cab-booking";

interface CabBookingHeaderProps {
  displayName: string;
  project: string;
}

const CabBookingHeader: React.FC<CabBookingHeaderProps> = ({ displayName, project }) => {
  const avatarText = displayName ? displayName.substring(0, 2).toUpperCase() : "CB";

  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1 }}>
      <Avatar
        sx={{
          width: 44,
          height: 44,
          fontWeight: 700,
          fontSize: 15,
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          color: "white",
          boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
        }}
      >
        {avatarText}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography 
          sx={{ 
            fontSize: "1.05rem", 
            fontWeight: 800, 
            lineHeight: 1.2,
            color: "text.primary" 
          }} 
          noWrap
        >
          {displayName}
        </Typography>
        <Typography 
          sx={{ 
            fontSize: "0.8rem", 
            color: "text.secondary",
            fontWeight: 500
          }} 
          noWrap
        >
          {getProjectName(project)}
        </Typography>
      </Box>
    </Box>
  );
};

export default CabBookingHeader;
