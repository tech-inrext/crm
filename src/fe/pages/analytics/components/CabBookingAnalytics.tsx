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
      <div className="w-full pb-8">
        {/* Top Section Shimmer: My Booking Count */}
        <div className="w-full bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl animate-shimmer"></div>
              <div className="space-y-2">
                <div className="h-4 w-44 rounded-md animate-shimmer"></div>
                <div className="h-3 w-60 rounded-md animate-shimmer"></div>
              </div>
            </div>
            <div className="h-6 w-24 rounded-full animate-shimmer"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 flex flex-col justify-between h-28">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-24 rounded-md animate-shimmer"></div>
                  <div className="w-7 h-7 rounded-lg animate-shimmer"></div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-7 w-16 rounded-lg animate-shimmer"></div>
                  <div className="h-2.5 w-28 rounded-md animate-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Section Shimmer: Team Booking Details */}
        <div className="w-full bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs">
          {/* Header Shimmer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl animate-shimmer-purple"></div>
              <div className="space-y-2">
                <div className="h-5 w-48 rounded-md animate-shimmer"></div>
                <div className="h-3.5 w-72 rounded-md animate-shimmer"></div>
              </div>
            </div>
            <div className="h-8 w-32 rounded-xl animate-shimmer"></div>
          </div>

          {/* 4 Metric Cards Shimmer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 h-24 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-28 rounded-md animate-shimmer"></div>
                  <div className="w-5 h-5 rounded-md animate-shimmer"></div>
                </div>
                <div className="h-7 w-20 rounded-lg animate-shimmer"></div>
                <div className="h-2.5 w-32 rounded-md animate-shimmer"></div>
              </div>
            ))}
          </div>

          {/* Controls Bar Shimmer */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="h-9 w-60 rounded-xl animate-shimmer-purple"></div>
              <div className="flex items-center gap-1.5 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 w-16 rounded-lg animate-shimmer"></div>
                ))}
              </div>
            </div>
            <div className="h-9 w-64 rounded-xl animate-shimmer"></div>
          </div>

          {/* Table Rows Shimmer */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-4">
              <div className="h-3 w-20 rounded animate-shimmer"></div>
              <div className="h-3 w-24 rounded animate-shimmer"></div>
              <div className="h-3 w-28 rounded animate-shimmer"></div>
              <div className="h-3 w-36 rounded animate-shimmer"></div>
              <div className="h-3 w-24 rounded animate-shimmer"></div>
              <div className="h-3 w-16 rounded animate-shimmer"></div>
              <div className="h-3 w-16 rounded animate-shimmer ml-auto"></div>
            </div>
            <div className="divide-y divide-gray-100 bg-white">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-4 py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1.5 w-28">
                    <div className="h-3.5 w-20 rounded-md animate-shimmer"></div>
                    <div className="h-2.5 w-24 rounded-md animate-shimmer"></div>
                  </div>
                  <div className="flex items-center gap-2.5 w-44">
                    <div className="w-8 h-8 rounded-full animate-shimmer shrink-0"></div>
                    <div className="space-y-1.5 w-full">
                      <div className="h-3.5 w-24 rounded-md animate-shimmer"></div>
                      <div className="h-2.5 w-16 rounded-md animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="space-y-1.5 w-36">
                    <div className="h-3.5 w-28 rounded-md animate-shimmer"></div>
                    <div className="h-2.5 w-20 rounded-md animate-shimmer"></div>
                  </div>
                  <div className="space-y-1.5 w-48">
                    <div className="h-3 w-40 rounded-md animate-shimmer"></div>
                    <div className="h-2.5 w-32 rounded-md animate-shimmer"></div>
                  </div>
                  <div className="space-y-1.5 w-32">
                    <div className="h-3.5 w-24 rounded-md animate-shimmer"></div>
                    <div className="h-2.5 w-16 rounded-md animate-shimmer"></div>
                  </div>
                  <div className="h-4 w-14 rounded-md animate-shimmer"></div>
                  <div className="h-6 w-20 rounded-full animate-shimmer"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-8">
      {/* Top Section: My Booking Count & Status Summary Cards */}
      <MyBookingCountCards stats={data?.myBookingStats} />

      {/* Main Section: Team Cab Booking Details & Status Tracking */}
      <TeamBookingDetails
        stats={data?.teamStats}
        bookings={data?.teamBookingsList}
        pagination={data?.pagination}
      />
    </div>
  );
};

export default CabBookingAnalytics;
