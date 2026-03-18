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
    <Box
      className="
    relative h-[200px] sm:h-[850px] md:h-[600px] min-h-[170px]  bg-gradient-to-br from-[#1976d2] to-[#0f5293] text-white flex flex-col justify-between p-2 md:p-4 overflow-hidden"
    >
      {/* Background Image */}
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

      {/* Loader */}
      {primaryImageLoading && primaryImageUrl && !primaryImageError && (
        <Box className="absolute inset-0 flex items-center justify-center bg-black/30">
          <CircularProgress sx={{ color: "white" }} />
        </Box>
      )}

      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(15, 82, 147, 0.85) 100%)",
          zIndex: 1,
        }}
      />

      {/* Close Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          zIndex: 2,
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          className="text-white bg-white/15 backdrop-blur-[10px] border border-white/20 transition-all duration-200 ease-in-out hover:bg-white/25 hover:scale-110"
        >
          <Close />
        </IconButton>
      </Box>

      {/* Content */}
      <Box className="flex items-end justify-between flex-wrap mt-auto z-[2] relative">
        <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "auto" } }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              fontSize: { xs: "1.4rem", sm: "2.5rem", md: "3rem" }, // slightly reduced for mobile
              textShadow: "0 4px 20px rgba(0,0,0,0.4)",
              lineHeight: 1.1,
            }}
          >
            {property.projectName}
          </Typography>

          <Box className="flex items-center flex-wrap gap-2">
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Business sx={{ mr: 1, fontSize: 20, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>
                {property.builderName}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="text-left md:text-right bg-white/15 backdrop-blur-[10px] border border-white/20 rounded-lg p-1 md:p-2 min-w-full md:min-w-[280px]">
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              fontSize: { xs: "1.3rem", md: "2.5rem" },
            }}
          >
            {property.price
              ? `${property.price}${property.sizeUnit ? ` / ${property.sizeUnit}` : ""}`
              : "Contact for Price"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PropertyHeader;
