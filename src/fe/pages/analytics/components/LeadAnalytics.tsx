"use client";

import React, { useEffect, useState } from "react";
import ActivityCards from "./ActivityCards";
import PipelineHealth from "./PipelineHealth";
import LeadQuality from "./LeadQuality";
import WeeklyPerformance from "./WeeklyPerformance";
import { analyticsApi } from "../analyticsApi";

const LeadAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await analyticsApi.getTodayActivity();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch lead analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20 w-full">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="flex w-full h-full">
          <ActivityCards 
            stats={{
              callBackCount: data?.callBackCount,
              siteVisitCount: data?.siteVisitCount,
              overdueCount: data?.overdueCount,
              total: data?.total
            }} 
          />
        </div>
        <div className="flex w-full h-full">
          <LeadQuality data={data?.qualityDistribution} />
        </div>
        <div className="flex w-full h-full">
          <PipelineHealth data={data?.statusDistribution} />
        </div>
        <div className="flex w-full h-full">
          <WeeklyPerformance data={data?.trendData} />
        </div>
      </div>
    </div>
  );
};

export default LeadAnalytics;
