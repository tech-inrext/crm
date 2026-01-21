// app/dashboard/properties/components/property-view/PropertyHeader.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Business,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';

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
    <Box sx={{ 
      position: 'relative',
      height: { xs: 2500, sm: 850, md: 600 },
      background: 'linear-gradient(135deg, #1976d2 0%, #0f5293 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      p: { xs: 3, md: 4 },
      overflow: 'hidden'
    }}>
      {primaryImageUrl && !primaryImageError && (
        <Box
          component="img"
          src={primaryImageUrl}
          alt={property.projectName}
          onLoad={handlePrimaryImageLoad}
          onError={handlePrimaryImageError}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.4,
            display: primaryImageLoading ? 'none' : 'block'
          }}
        />
      )}
      
      {primaryImageLoading && primaryImageUrl && !primaryImageError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <CircularProgress sx={{ color: 'white' }} />
        </Box>
      )}
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(15, 82, 147, 0.85) 100%)',
          zIndex: 1,
        }}
      />

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'end', 
        alignItems: 'flex-end',
        zIndex: 2,
        position: 'relative'
      }}>
        <IconButton 
          onClick={onClose}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.25)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        mt: 'auto',
        zIndex: 2,
        position: 'relative'
      }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
          <Typography variant="h2" fontWeight={800} sx={{ 
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            textShadow: '0 4px 20px rgba(0,0,0,0.4)',
            lineHeight: 1.1,
          }}>
            {property.projectName}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Business sx={{ mr: 1.5, fontSize: 24, opacity: 0.9 }} />
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>
                {property.builderName}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ 
          textAlign: { xs: 'left', md: 'right' },
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 4,
          p: { xs: 1, md: 2 },
          minWidth: { xs: '100%', md: 280 },
          mt: { xs: 0, md: 0 }
        }}>
          <Typography variant="h3" fontWeight={800} sx={{ 
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            fontSize: { xs: '1.5rem', md: '2.5rem' }
          }}>
            {property.price || 'Contact for Price'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PropertyHeader;
