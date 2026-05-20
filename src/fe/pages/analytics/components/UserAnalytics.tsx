"use client";

import React, { useEffect, useState } from "react";
import MouOverview from "./MouOverview";
import TargetAchievement from "./TargetAchievement";
import ConversionEfficiency from "./ConversionEfficiency";
import ProductivityStats from "./ProductivityStats";
import { analyticsApi } from "../analyticsApi";

const UserAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await analyticsApi.getUserActivity();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user analytics:", error);
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
          <MouOverview data={data?.mouDistribution} total={data?.totalMOUs} />
        </div>
        <div className="flex w-full h-full">
          <TargetAchievement data={data?.revenue} />
        </div>
        <div className="flex w-full h-full">
          <ConversionEfficiency data={data?.conversion} />
        </div>
        <div className="flex w-full h-full">
          <ProductivityStats data={data?.conversion} totalMOUs={data?.totalMOUs} />
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
