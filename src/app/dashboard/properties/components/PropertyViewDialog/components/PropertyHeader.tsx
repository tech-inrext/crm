"use client";

import React from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { Close, Business } from "@mui/icons-material";
import { Property } from "@/services/propertyService";

interface PropertyHeaderProps {
  property: Property;
  onClose: () => void;
  primaryImageUrl: string | null;
  primaryImageLoading: boolean;
  primaryImageError: boolean;
  handlePrimaryImageLoad: () => void;
  handlePrimaryImageError: () => void;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  property,
  onClose,
  primaryImageUrl,
  primaryImageLoading,
  primaryImageError,
  handlePrimaryImageLoad,
  handlePrimaryImageError,
}) => {
  return (
    <Box className="relative h-[1500px] sm:h-[850px] md:h-[500px] bg-gradient-to-br from-blue-600 to-blue-900 text-white flex flex-col justify-between p-2 md:p-3 overflow-hidden">
      {primaryImageUrl && !primaryImageError && (
        <Box
          component="img"
          src={primaryImageUrl}
          alt={property.projectName}
          onLoad={handlePrimaryImageLoad}
          onError={handlePrimaryImageError}
          className={`absolute top-0 left-0 w-full h-full object-cover opacity-40 ${primaryImageLoading ? "hidden" : "block"}`}
        />
      )}

      {primaryImageLoading && primaryImageUrl && !primaryImageError && (
        <Box className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/30">
          <CircularProgress className="text-white" />
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(15, 82, 147, 0.85) 100%)",
          zIndex: 0,
        }}
      />

      <Box
        className="relative z-20 flex justify-end items-end">
        {/* Your content here */}
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.25)",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <Box className="flex items-end justify-between flex-wrap mt-auto relative z-2">
        <Box className="flex-1 min-w-full md:min-w-0 ml-auto">
  <h2 className="font-extrabold text-[1.8rem] sm:text-[2.5rem] md:text-[2.5rem] leading-[1.1]">
    {property.projectName}
  </h2>

  <Box className="flex items-center flex-wrap gap-6">
    <Box className="flex items-center mb-1">
      <Business className="mr-6 text-[24px] opacity-90" />
      <Typography className="text-lg font-semibold opacity-95">
        {property.builderName}
      </Typography>
    </Box>
  </Box>
</Box>

        <Box
          sx={{
            textAlign: { xs: "left", md: "right" },
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 4,
            p: { xs: 1, md: 2 },
            minWidth: { xs: "100%", md: 280 },
            mt: { xs: 0, md: 0 },
          }}
        >
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            {property?.price
              ? `${property.price}${property?.sizeUnit ? `/${property.sizeUnit}` : ""}`
              : "Contact for Price"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PropertyHeader;
