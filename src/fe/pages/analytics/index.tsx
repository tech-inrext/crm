"use client";

import React, { useState } from "react";
import { Box, Tabs, Tab, useTheme, useMediaQuery } from "@mui/material";
import {
  containerSx,
  tabsWrapperSx,
  tabsSx,
  tabSx,
  tabLabelBoxSx,
  tabTextTypographySx,
  tabPanelSx,
} from "./styles";
import LeadAnalytics from "./components/LeadAnalytics";
import UserAnalytics from "./components/UserAnalytics";
import CabBookingAnalytics from "./components/CabBookingAnalytics";
import AnalyticsActionBar from "./components/AnalyticsActionBar";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      style={{ flex: 1, display: value === index ? "flex" : "none", flexDirection: "column", overflow: "hidden" }}
      {...other}
    >
      {value === index && (
        <Box sx={tabPanelSx}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Analytics = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={containerSx}>
      {/* Header / Action Bar */}
      <Box sx={{ flexShrink: 0, mb: 1 }}>
        <AnalyticsActionBar />
      </Box>

      {/* Tabs Section */}
      <Box sx={tabsWrapperSx}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant={isMobile ? "fullWidth" : "standard"}
          indicatorColor="primary"
          textColor="primary"
          sx={tabsSx}
        >
          <Tab
            disableRipple
            sx={tabSx}
            label={
              <Box sx={tabLabelBoxSx}>
                <Box component="span" sx={tabTextTypographySx}>LEAD</Box>
              </Box>
            }
          />
          <Tab
            disableRipple
            sx={tabSx}
            label={
              <Box sx={tabLabelBoxSx}>
                <Box component="span" sx={tabTextTypographySx}>USER</Box>
              </Box>
            }
          />
          <Tab
            disableRipple
            sx={tabSx}
            label={
              <Box sx={tabLabelBoxSx}>
                <Box component="span" sx={tabTextTypographySx}>CAB BOOKING</Box>
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Content Section */}
      <CustomTabPanel value={value} index={0}>
        <LeadAnalytics />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <UserAnalytics />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <CabBookingAnalytics />
      </CustomTabPanel>
    </Box>
  );
};

export default Analytics;
