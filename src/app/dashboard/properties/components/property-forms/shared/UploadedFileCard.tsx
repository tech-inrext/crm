"use client";

import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { StarBorder, Delete, Description } from "@mui/icons-material";
import { FileItem } from "./types";

interface UploadedFileCardProps {
  file: FileItem;
  index: number;
  type: 'propertyImages' | 'floorPlans';
  onSetPrimary?: (index: number) => void;
  onRemove: (type: 'propertyImages' | 'floorPlans', index: number) => void;
  showPrimaryOption?: boolean;
  isPrimary?: boolean;
  color?: 'primary' | 'secondary' | 'warning' | 'info' | 'success';
}

const UploadedFileCard: React.FC<UploadedFileCardProps> = ({
  file,
  index,
  type,
  onSetPrimary,
  onRemove,
  showPrimaryOption = true,
  isPrimary = false,
  color = 'primary'
}) => {
  const isImage = file.url && (file.url.includes('image') || file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  const isPdf = file.url && file.url.includes('pdf');

  return (
    <Card
      sx={{
        position: 'relative',
        border: isPrimary ? `2px solid ${color}.main` : '1px solid #e0e0e0',
        height: '100%'
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            height: 120,
            backgroundColor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            position: 'relative',
            mb: 1,
            overflow: 'hidden',
            border: '1px dashed #e0e0e0'
          }}
        >
          {isImage ? (
            <img
              src={file.url}
              alt={file.title || `File ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : isPdf ? (
            <Box sx={{ textAlign: 'center' }}>
              <Description sx={{ fontSize: 48, color: `${color}.main`, mb: 1 }} />
              <Typography variant="caption" display="block">
                PDF Document
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Description sx={{ fontSize: 48, color: `${color}.main`, mb: 1 }} />
              <Typography variant="caption" display="block">
                {file.type || 'Document'}
              </Typography>
            </Box>
          )}

          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5
          }}>
            {showPrimaryOption && !isPrimary && onSetPrimary && (
              <Tooltip title="Set as primary">
                <IconButton
                  size="small"
                  onClick={() => onSetPrimary(index)}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                  }}
                >
                  <StarBorder sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Remove">
              <IconButton
                size="small"
                onClick={() => onRemove(type, index)}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                }}
              >
                <Delete sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {isPrimary && (
            <Chip
              label="Primary"
              size="small"
              color={color}
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
              }}
            />
          )}
        </Box>

        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {file.title || `File ${index + 1}`}
        </Typography>

        {file.url && !file.url.startsWith('data:') && (
          <Typography variant="caption" color="success.main" display="block">
            ✓ S3 Storage
          </Typography>
        )}
        {file.url && file.url.startsWith('data:') && (
          <Typography variant="caption" color="warning.main" display="block">
            ⚠ Base64 (needs re-upload)
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadedFileCard;