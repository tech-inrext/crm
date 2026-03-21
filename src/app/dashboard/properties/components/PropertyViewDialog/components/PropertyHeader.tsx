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
      <Box className="absolute inset-0 z-[1] bg-[linear-gradient(135deg,rgba(25,118,210,0.95)_0%,rgba(15,82,147,0.85)_100%)]" />

      {/* Close Button */}
      <Box className="flex justify-end relative z-[2]">
        <IconButton
          onClick={onClose}
          className="text-white bg-white/15 backdrop-blur-[10px] border border-white/20 transition-all duration-200 ease-in-out hover:bg-white/25 hover:scale-110"
        >
          <Close />
        </IconButton>
      </Box>

      {/* Content */}
      <Box className="flex items-end justify-between flex-wrap mt-auto z-[2] relative">
        <Box className="flex-1 min-w-full md:min-w-0">
          <Typography
            className="
    !font-extrabold
    !text-[1.4rem] sm:!text-[2.5rem] md:!text-[3rem]
    !leading-[1.1]
    [text-shadow:0_4px_20px_rgba(0,0,0,0.4)]
  "
          >
            {property.projectName}
          </Typography>

          <Box className="flex items-center flex-wrap gap-2">
            <Box className="flex items-center mb-2">
              <Business className="mr-1 text-[20px] opacity-90" />

              <Typography className="!font-semibold opacity-95 !text-[1.25rem]">
                {property.builderName}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="text-left md:text-right bg-white/15 backdrop-blur-[10px] border border-white/20 rounded-lg p-1 md:p-2 min-w-full md:min-w-[280px]">
          <Typography
            className="
    !flex !items-center
    !justify-start md:!justify-end
    !font-extrabold
    !text-[1.3rem] md:!text-[2.5rem]
    [text-shadow:0_2px_10px_rgba(0,0,0,0.3)]
  "
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
