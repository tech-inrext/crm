import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import { LocationOn, ArrowForward, Event } from "@/components/ui/Component";
import { formatDateTime } from "@/fe/pages/cab-booking/constants/cab-booking";
import GroupIcon from "@mui/icons-material/Group";

interface CabBookingRouteProps {
  pickupPoint: string;
  dropPoint: string;
  requestedDateTime: string;
  numberOfClients?: number;
}

const CabBookingRoute: React.FC<CabBookingRouteProps> = ({ pickupPoint, dropPoint, requestedDateTime, numberOfClients }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, my: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 0.5 }}>
          <LocationOn sx={{ fontSize: 18, color: "primary.main" }} />
          <Box sx={{ width: 2, height: 16, bgcolor: "grey.200", my: 0.5 }} />
          <ArrowForward sx={{ fontSize: 18, color: "success.main", transform: "rotate(90deg)" }} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Pickup
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", color: "text.primary", fontWeight: 500 }} noWrap>
              {pickupPoint}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Drop
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", color: "text.primary", fontWeight: 500 }} noWrap>
              {dropPoint}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1, p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Event sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "text.primary" }}>
            {formatDateTime(requestedDateTime)}
          </Typography>
        </Box>
        {numberOfClients !== undefined && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <GroupIcon sx={{ fontSize: 18, color: "text.secondary", mr: 0.5 }} />
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "text.primary" }}>
              {numberOfClients} {numberOfClients === 1 ? 'Passenger' : 'Passengers'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CabBookingRoute;
