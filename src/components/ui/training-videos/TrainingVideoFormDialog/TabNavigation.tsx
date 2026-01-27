import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { CloudUpload, YouTube } from "@mui/icons-material";

interface TabNavigationProps {
  activeTab: "youtube" | "upload";
  onTabChange: (event: React.SyntheticEvent, newValue: "youtube" | "upload") => void;
  isUploading: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  isUploading
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={activeTab} 
        onChange={onTabChange}
        aria-label="video source tabs"
        sx={styles.tabs}
      >
        <Tab 
          value="upload" 
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <CloudUpload fontSize="small" />
              Upload Video File
            </Box>
          } 
          disabled={isUploading}
        />
        <Tab 
          value="youtube" 
          label={
            <Box display="flex" alignItems="center" gap={1}>
              <YouTube fontSize="small" />
              YouTube URL
            </Box>
          } 
          disabled={isUploading}
        />
      </Tabs>
    </Box>
  );
};

const styles = {
  tabs: {
    '& .MuiTab-root': {
      textTransform: 'none',
      fontWeight: 600,
      minHeight: 48,
    }
  }
} as const;