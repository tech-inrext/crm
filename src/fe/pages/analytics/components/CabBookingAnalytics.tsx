"use client";

import React, { useEffect, useState } from "react";
import MyBookingCountCards from "./MyBookingCountCards";
import TeamBookingDetails from "./TeamBookingDetails";
import { analyticsApi } from "../analyticsApi";

const CabBookingAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const res = await analyticsApi.getCabBookingActivity();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch cab booking analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20 w-full">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full pb-8">
      {/* Top Section: My Booking Count & Status Summary Cards */}
      <MyBookingCountCards stats={data?.myBookingStats} />

      {/* Main Section: Team Cab Booking Details & Status Tracking */}
      <TeamBookingDetails stats={data?.teamStats} bookings={data?.teamBookingsList} />
    </div>
  );
};

export default CabBookingAnalytics;
