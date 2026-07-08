import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import {
  EventAvailable,
  Verified,
  LocalTaxi,
  AccountBalanceWallet,
  TaskAlt,
  Cancel
} from "@mui/icons-material";

interface CabBookingStepperProps {
  status: string;
}

const STEPS = [
  { id: "pending", label: "Booked", Icon: EventAvailable },
  { id: "approved", label: "Approved", Icon: Verified },
  { id: "active", label: "Active", Icon: LocalTaxi },
  { id: "payment_due", label: "Payment", Icon: AccountBalanceWallet },
  { id: "completed", label: "Completed", Icon: TaskAlt },
];

const ERROR_STATUSES = ["rejected", "cancelled"];

const CabBookingStepper: React.FC<CabBookingStepperProps> = ({ status }) => {
  const isError = ERROR_STATUSES.includes(status);
  
  // Find current step index
  let currentIndex = STEPS.findIndex((s) => s.id === status);
  if (currentIndex === -1 && !isError) currentIndex = 0;

  return (
    <Box sx={{ width: "100%", py: 2, px: 1 }}>
      {isError ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2, bgcolor: "error.50", borderRadius: 2, border: "1px solid", borderColor: "error.200" }}>
          <Cancel color="error" />
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "error.main", textTransform: "uppercase" }}>
            {status}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "flex-start", width: "100%", position: "relative" }}>
          {/* Background connecting line */}
          <Box 
            sx={{ 
              position: "absolute", 
              top: 18, 
              left: "calc(10% + 20px)", 
              right: "calc(10% + 20px)", 
              height: 3, 
              bgcolor: "grey.200", 
              zIndex: 0,
              borderRadius: 2 
            }} 
          />

          {STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            
            // Define colors
            let iconBg = "white";
            let iconColor = "grey.400";
            let borderColor = "grey.200";
            let labelColor = "text.disabled";
            let iconShadow = "none";
            
            if (isActive) {
              iconColor = "white";
              labelColor = "primary.main";
              
              if (step.id === "payment_due") { 
                iconBg = "warning.main"; 
                borderColor = "warning.main";
                labelColor = "warning.main";
                iconShadow = "0 4px 12px rgba(237, 108, 2, 0.4)";
              } else if (step.id === "completed") { 
                iconBg = "success.main"; 
                borderColor = "success.main";
                labelColor = "success.main";
                iconShadow = "0 4px 12px rgba(46, 125, 50, 0.4)";
              } else if (step.id === "active") { 
                iconBg = "secondary.main"; 
                borderColor = "secondary.main";
                labelColor = "secondary.main";
                iconShadow = "0 4px 12px rgba(156, 39, 176, 0.4)";
              } else {
                iconBg = "primary.main";
                borderColor = "primary.main";
                iconShadow = "0 4px 12px rgba(25, 118, 210, 0.4)";
              }
            } else if (isCompleted) {
              iconBg = "white"; // Solid white to hide the line behind it
              iconColor = "success.main";
              borderColor = "success.main";
              labelColor = "text.primary";
            }

            return (
              <Box key={step.id} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                
                {/* Active progress line up to this step */}
                {isCompleted && index < STEPS.length - 1 && (
                   <Box 
                   sx={{ 
                     position: "absolute", 
                     top: 18, 
                     left: "calc(50% + 18px)", // Start right after the icon border
                     width: "calc(100% - 36px)", // End right before the next icon border
                     height: 3, 
                     bgcolor: "success.main", 
                     zIndex: -1 
                   }} 
                 />
                )}
                {(isActive && index < STEPS.length - 1) && (
                   <Box 
                   sx={{ 
                     position: "absolute", 
                     top: 18, 
                     left: "calc(50% + 18px)", 
                     width: "calc(50% - 18px)", 
                     height: 3, 
                     bgcolor: borderColor, 
                     zIndex: -1 
                   }} 
                 />
                )}

                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    bgcolor: iconBg,
                    border: "2px solid",
                    borderColor: borderColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: iconShadow,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isActive ? "scale(1.15)" : "scale(1)",
                    mb: 1,
                  }}
                >
                  <step.Icon sx={{ fontSize: 20, color: iconColor }} />
                </Box>
                <Typography 
                  sx={{ 
                    fontSize: "0.7rem", 
                    fontWeight: isActive || isCompleted ? 700 : 500, 
                    color: labelColor, 
                    textAlign: "center",
                    lineHeight: 1.1,
                    transition: "all 0.2s"
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default CabBookingStepper;
