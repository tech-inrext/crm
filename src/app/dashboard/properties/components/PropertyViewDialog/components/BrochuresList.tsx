"use client";

import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Description,
  PictureAsPdf,
  InsertDriveFile,
  ZoomIn,
  Download,
} from "@mui/icons-material";

interface BrochuresListProps {
  brochures: any[];
  onBrochureClick: (index: number) => void;
  onDownloadBrochure: (url: string, filename: string, index: number) => void;
}

const BrochuresList: React.FC<BrochuresListProps> = ({
  brochures,
  onBrochureClick,
  onDownloadBrochure,
}) => {
  const getFileIcon = (filename: string) => {
    if (filename.toLowerCase().endsWith('.pdf')) {
      return <PictureAsPdf color="error" />;
    } else if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx')) {
      return <Description color="primary" />;
    }
    return <InsertDriveFile color="action" />;
  };

  const getFileType = (filename: string) => {
    if (filename.toLowerCase().endsWith('.pdf')) return 'PDF';
    if (filename.toLowerCase().endsWith('.doc')) return 'Word DOC';
    if (filename.toLowerCase().endsWith('.docx')) return 'Word DOCX';
    return 'Document';
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {brochures.map((brochure, index) => (
        <React.Fragment key={index}>
          <ListItem 
            sx={{ 
              borderRadius: 2,
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ListItemIcon>
              {getFileIcon(brochure.title || brochure.url)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" fontWeight={600}>
                  {brochure.title || `Brochure ${index + 1}`}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                  <Chip 
                    label={getFileType(brochure.title || brochure.url)} 
                    size="small" 
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {brochure.size || 'Unknown size'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {brochure.pages ? `${brochure.pages} pages` : ''}
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Preview">
                <IconButton
                  edge="end"
                  onClick={() => onBrochureClick(index)}
                  sx={{ mr: 1 }}
                >
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  edge="end"
                  onClick={() => onDownloadBrochure(
                    brochure.url, 
                    brochure.title || `brochure-${index + 1}.pdf`, 
                    index
                  )}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
          {index < brochures.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default BrochuresList;