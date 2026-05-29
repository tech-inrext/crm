"use client";

import React, { useEffect, useState } from "react";
import CabBookingPipeline from "./CabBookingPipeline";
import CabCostRoi from "./CabCostRoi";
import CabVendorPerformance from "./CabVendorPerformance";
import CabPickupHotspots from "./CabPickupHotspots";
import { analyticsApi } from "../analyticsApi";

const mockCabData = {
  pipeline: {
    totalScheduled: 15,
    pending: 5,
    completed: 8,
    cancelled: 2,
  },
  roi: {
    totalSpent: 12500,
    costPerVisit: 1250,
    mousGenerated: 2,
  },
  vendors: [
    { name: "Uber Fleet", onTimeRate: 95, trips: 45 },
    { name: "Ola Corporate", onTimeRate: 88, trips: 32 },
    { name: "Local Transits", onTimeRate: 98, trips: 15 },
  ],
  hotspots: [
    { area: "Andheri West", count: 28 },
    { area: "Bandra Kurla Complex", count: 22 },
    { area: "Powai", count: 18 },
    { area: "Navi Mumbai", count: 12 },
  ],
};

const CabBookingAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const res = await analyticsApi.getCabBookingActivity();
        if (res.success) {
          setData(res.data);
        } else {
          setData(mockCabData);
        }
      } catch (err) {
        console.error("Failed to fetch cab booking analytics:", err);
        setData(mockCabData);
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
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="flex w-full h-full">
          <CabBookingPipeline data={data?.pipeline} />
        </div>
        <div className="flex w-full h-full">
          <CabCostRoi data={data?.roi} />
        </div>
        <div className="flex w-full h-full">
          <CabVendorPerformance data={data?.vendors} />
        </div>
        <div className="flex w-full h-full">
          <CabPickupHotspots data={data?.hotspots} />
        </div>
      </div>
    </div>
  );
};

export default CabBookingAnalytics;
