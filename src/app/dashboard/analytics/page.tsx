"use client";

import React, { useState, useMemo, useEffect } from "react";
import BoxMUI from "@/components/ui/Component/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useAuth } from "@/contexts/AuthContext";
import { Box, Typography, Card, CardContent } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import { StatsCardsRow } from "../analytics/Statcard";
import { VendorBreakdown } from "../analytics/Cab/Cabvendor";
import LeadGenerationChart from "../analytics/Charts/LeadGenerationChart";
import SiteVisitConversionChart from "./Charts/SiteVisitConversionChart";
import { PropertyPieChart } from "./Charts/Propertychart";
import LeadSourcesPieChart from "./components/LeadSourcesPieChart";
import LeadsBySourceList from "./components/LeadsBySourceList";

// ----- Types -----
interface OverallAnalytics {
  siteVisitCount: number;
  totalUsers: number;
  totalTeams: number;
}

interface ScheduleAnalytics {
  showScheduleThisWeek?: boolean;
  tasks?: any[];
}

interface LeadsAnalytics {
  totalLeads: number;
  slices: { name: string; value: number; color?: string }[];
  propertyData?: { name: string; value: number; color?: string }[];
}

// ----- Card Wrapper -----
const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="min-h-[400px] h-full rounded-none shadow-sm border border-gray-200 w-full flex flex-col flex-1">
    <CardContent className="p-0 h-full flex flex-col justify-start">
      {children}
    </CardContent>
  </Card>
);

// ----- Main Dashboard -----
export default function NewDashboardPage() {
  const { getAnalyticsAccess } = useAuth();
  const analyticsAccess = getAnalyticsAccess();

  const [section, setSection] = useState(0);
  const [leadConversionPeriod, setLeadConversionPeriod] = useState<
    "week" | "month"
  >("month");

  // ----- Tabs -----
  const availableSections = useMemo(() => {
    const sections = ["Overview"];
    if (analyticsAccess.showCabBookingAnalytics)
      sections.push("Cab Booking Analytics");
    sections.push("Leads & Projects");
    return sections;
  }, [analyticsAccess.showCabBookingAnalytics]);

  useEffect(() => {
    if (section >= availableSections.length) setSection(0);
  }, [section, availableSections.length]);

  // ----- Overview Data (fetch once) -----
  const [overall, setOverall] = useState<OverallAnalytics | null>(null);
  const [overallLoading, setOverallLoading] = useState(true);

  const [scheduleAnalytics, setScheduleAnalytics] =
    useState<ScheduleAnalytics | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchOverview() {
      try {
        const [overallRes, scheduleRes] = await Promise.all([
          fetch("/api/v0/analytics/overall"),
          fetch("/api/v0/analytics/schedule"),
        ]);

        const overallData = await overallRes.json();
        const scheduleData = await scheduleRes.json();

        if (!isMounted) return;
        setOverall(overallData);
        setScheduleAnalytics(scheduleData);
      } catch (err) {
        console.error("Error fetching overview APIs:", err);
      } finally {
        if (isMounted) {
          setOverallLoading(false);
          setScheduleLoading(false);
        }
      }
    }

    fetchOverview();

    return () => {
      isMounted = false;
    };
  }, []); // <-- empty dependency => fetch only once

  // ----- Leads Data (fetch only once when Leads tab is active) -----
  const [leadsAnalytics, setLeadsAnalytics] = useState<LeadsAnalytics | null>(
    null,
  );
  const [leadsLoading, setLeadsLoading] = useState(false);

  useEffect(() => {
    const leadsTabIndex = analyticsAccess.showCabBookingAnalytics ? 2 : 1;
    if (section !== leadsTabIndex) return;

    let isMounted = true;
    setLeadsLoading(true);

    fetch("/api/v0/analytics/leads")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        setLeadsAnalytics(data);
      })
      .finally(() => {
        if (isMounted) setLeadsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [section, analyticsAccess.showCabBookingAnalytics]);

  // ----- Derived Metrics -----
  const leadsBySourceMetrics = useMemo(() => {
    if (!leadsAnalytics) return { slices: [], sourcesOrder: [] };
    const palette = [
      "#08c4a6",
      "#4285f4",
      "#ffca28",
      "#ff7f4e",
      "#a259e6",
      "#f06292",
      "#7cb342",
    ];
    const slices = (leadsAnalytics.slices || []).map((s, idx) => ({
      ...s,
      color: palette[idx % palette.length],
    }));
    const sourcesOrder = slices.map((s) => s.name);
    return { ...leadsAnalytics, slices, sourcesOrder };
  }, [leadsAnalytics]);

  const propertyMetrics = useMemo(() => {
    if (!leadsAnalytics?.propertyData) return [];
    const palette = ["#4285f4", "#08c4a6", "#a259e6", "#ff7f4e", "#ffca28"];
    return leadsAnalytics.propertyData.map((p, idx) => ({
      ...p,
      color: palette[idx % palette.length],
    }));
  }, [leadsAnalytics]);

  return (
    <PermissionGuard module="analytics" action="read">
      <Box className="p-3 sm:p-6 md:p-8 overflow-hidden">
        <Typography
          variant="h4"
          className="font-bold text-[#1a1a1a] mb-4 text-2xl sm:text-3xl md:text-4xl"
        >
          Dashboard
        </Typography>

        {/* Tabs */}
        <BoxMUI className="border-b border-gray-200 mb-4">
          <Tabs
            value={section}
            onChange={(_, newValue) => setSection(newValue)}
            aria-label="Analytics Tabs"
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {availableSections.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </BoxMUI>

        {/* Overview */}
        {section === 0 && (
          <StatsCardsRow
            scheduleLoading={scheduleLoading}
            scheduleAnalytics={scheduleAnalytics}
            analyticsAccess={analyticsAccess}
            siteVisitCount={overall?.siteVisitCount}
            totalUsers={overall?.totalUsers}
            totalTeams={overall?.totalTeams}
          />
        )}

        {/* Cab Booking Analytics */}
        {analyticsAccess.showCabBookingAnalytics && section === 1 && (
          <VendorBreakdown />
        )}

        {/* Leads & Projects */}
        {((analyticsAccess.showCabBookingAnalytics && section === 2) ||
          (!analyticsAccess.showCabBookingAnalytics && section === 1)) && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-6 w-full items-stretch">
              <CardWrapper>
                <div className="flex justify-between items-center px-2 pt-4 pb-0">
                  <Typography
                    variant="h5"
                    className="font-semibold text-[#222]"
                  >
                    Lead Conversion
                  </Typography>
                  <select
                    value={leadConversionPeriod}
                    onChange={(e) =>
                      setLeadConversionPeriod(
                        e.target.value as "week" | "month",
                      )
                    }
                    className="px-3 py-1 rounded border border-gray-300 font-medium text-base text-[#222] bg-[#f7f9fa]"
                  >
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
                <LeadGenerationChart period={leadConversionPeriod} />
              </CardWrapper>

              <CardWrapper>
                <div className="text-[1.3rem] font-bold text-[#333] mb-4 w-full text-center">
                  Property On Demand
                </div>
                <PropertyPieChart propertyData={propertyMetrics} />
              </CardWrapper>
            </div>

            <div className="flex flex-wrap gap-6 w-full items-stretch">
              <CardWrapper>
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[1.3rem] font-bold text-[#333] text-center">
                    Leads by Source
                  </div>
                  <div className="text-sm text-[#666]">
                    {leadsAnalytics?.totalLeads || 0} leads
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4 w-full flex-1">
                  <div className="w-[350px] h-[350px] mx-auto">
                    <LeadSourcesPieChart slices={leadsBySourceMetrics.slices} />
                  </div>
                  <LeadsBySourceList
                    leadsBySourceMetrics={leadsBySourceMetrics}
                  />
                </div>
              </CardWrapper>

              <CardWrapper>
                <SiteVisitConversionChart />
              </CardWrapper>
            </div>
          </div>
        )}
      </Box>
    </PermissionGuard>
  );
}
