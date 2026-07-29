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
import MyLeavesTable from "./components/MyLeavesTable";
import ManagerApprovals from "./components/ManagerApprovals";
import HrLeavesOverview from "./components/HrLeavesOverview";
import { useAuth } from "@/contexts/AuthContext";

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
      id={`leave-tabpanel-${index}`}
      aria-labelledby={`leave-tab-${index}`}
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

const LeaveManagement = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isHR } = useAuth();

  const canAccessHrTab = Boolean(isHR);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={containerSx}>
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
                <Box component="span" sx={tabTextTypographySx}>MY LEAVES</Box>
              </Box>
            }
          />
          <Tab
            disableRipple
            sx={tabSx}
            label={
              <Box sx={tabLabelBoxSx}>
                <Box component="span" sx={tabTextTypographySx}>MANAGER APPROVALS</Box>
              </Box>
            }
          />
          {canAccessHrTab && (
            <Tab
              disableRipple
              sx={tabSx}
              label={
                <Box sx={tabLabelBoxSx}>
                  <Box component="span" sx={tabTextTypographySx}>HR / ALL LEAVES</Box>
                </Box>
              }
            />
          )}
        </Tabs>
      </Box>

      {/* Content Section */}
      <CustomTabPanel value={value} index={0}>
        <MyLeavesTable />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <ManagerApprovals />
      </CustomTabPanel>
      {canAccessHrTab && (
        <CustomTabPanel value={value} index={2}>
          <HrLeavesOverview />
        </CustomTabPanel>
      )}
    </Box>
  );
};

export default LeaveManagement;
