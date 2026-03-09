"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import { Autocomplete, TextField } from "@mui/material";
import ScheduleCard from "./components/ScheduleCard";
import {
  FaUserFriends,
  FaUserPlus,
  FaPhoneAlt,
  FaFileSignature,
  FaHandshake,
  FaRupeeSign,
} from "react-icons/fa";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  onClick?: () => void;
  loading?: boolean;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBg,
  onClick,
  loading = false,
}) => (
<Card
      elevation={0}
      onClick={onClick}
      className={`rounded-2xl border border-gray-200 h-full p-4 shadow-sm
        transition-all duration-200 flex items-center  justify-between
        ${
          onClick
            ? "cursor-pointer hover:shadow-md hover:-translate-y-[2px]"
            : "cursor-default"
        }`}
    >
      <CardContent className="p-0 w-full">
        <Box className="flex items-center gap-5">
          
          {/* Icon */}
          <Box
            className="flex items-center justify-center w-8 h-8 mb-2 rounded-full"
            sx={{ backgroundColor: iconBg }}
          >
            {loading ? (
              <Skeleton variant="circular" width={24} height={24} />
            ) : (
              icon
            )}
          </Box>

          {/* Text Content */}
          <Box className="flex flex-col">
            
            {/* Title */}
            <Typography
              sx={{ fontSize: "12px", fontWeight: 500 }}
              className="uppercase text-black tracking-wide"
            >
              {loading ? <Skeleton width={80} /> : title}
            </Typography>

            {/* Value */}
            <Typography
              sx={{ fontSize: "2rem", fontWeight: 500, lineHeight: 1.2 }}
              className="text-gray-900"
            >
              {loading ? <Skeleton width={70} height={40} /> : value}
            </Typography>

          </Box>
        </Box>
      </CardContent>
    </Card>
);

export const StatsCardsRow: React.FC<{
  scheduleLoading?: boolean;
  scheduleAnalytics?: any;
  analyticsAccess?: boolean;
}> = ({ scheduleLoading, scheduleAnalytics, analyticsAccess }) => {
  const router = useRouter();
  const { user } = useAuth();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [teamUsersWithAll, setTeamUsersWithAll] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [usersLoading, setUsersLoading] = useState(true);

  const allOption = { _id: "all", name: "All Team Members" };
  const showVendorBilling = true;

  // ================= YOU ANALYTICS =================
  useEffect(() => {
    setLoading(true);

    fetch(`/api/v0/analytics/overall`)
      .then((r) => r.json())
      .then((data) => setAnalytics(data || {}))
      .finally(() => setLoading(false));
  }, []);

  // ================= FETCH TEAM USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await fetch(`/api/v0/employee/teams/users`);
        const data = await res.json();

        if (Array.isArray(data?.users)) {
          setTeamUsersWithAll([allOption, ...data.users]);
        } else {
          setTeamUsersWithAll([allOption]);
        }
      } catch {
        setTeamUsersWithAll([allOption]);
      } finally {
        setUsersLoading(false);
      }
    };

    if (user?._id) fetchUsers();
  }, [user?._id]);

  // ================= TEAM STATS CALCULATION =================
  const teamStats = useMemo(() => {
    const users =
      selectedUser && selectedUser._id !== "all"
        ? teamUsersWithAll.filter((u) => u._id === selectedUser._id)
        : teamUsersWithAll.filter((u) => u._id !== "all");

    return users.reduce(
      (acc, u) => {
        acc.activeLeads += u.activeLeads || 0;
        acc.newLeads += u.newLeads || 0;
        acc.siteVisitCount += u.siteVisitCount || 0;
        acc.mouPending += u.mouStatus === "Pending" ? 1 : 0;
        acc.mouApproved += u.mouStatus === "Approved" ? 1 : 0;
        acc.totalVendors += u.totalVendors || 0;
        acc.totalSpend += u.totalSpend || 0;
        return acc;
      },
      {
        activeLeads: 0,
        newLeads: 0,
        siteVisitCount: 0,
        mouPending: 0,
        mouApproved: 0,
        totalVendors: 0,
        totalSpend: 0,
      },
    );
  }, [selectedUser, teamUsersWithAll]);

  // ================= YOU VALUES =================
  const teamCount = analytics?.teamCount ?? 0;
  const activeLeads = analytics?.activeLeads ?? 0;
  const newLeads = analytics?.newLeads ?? 0;
  const siteVisitCount = analytics?.siteVisitCount ?? 0;
  const mouPending = analytics?.mouPending ?? 0;
  const mouApproved = analytics?.mouApproved ?? 0;
  const totalCabVendors = analytics?.totalCabVendors ?? 0;
  const totalEarnings = analytics?.totalEarnings ?? 0;

  return (
    <Box className="w-full h-full  mb-6">
      {/* YOU SECTION */}
      <div className="text-blue-500 text-lg m-4 font-medium">YOU</div>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stat Cards */}
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          <StatCard
            title="My Teams (All Levels)"
            value={teamCount}
            icon={<FaUserFriends size={17} color="#43a047" />}
            iconBg="#e8f5e9"
            onClick={() =>
              user?._id
                ? router.push(`/dashboard/teams?managerId=${user._id}`)
                : router.push("/dashboard/teams")
            }
            loading={loading}
          />

          <StatCard
            title="Active Leads"
            value={activeLeads}
            icon={<FaPhoneAlt size={17} color="#2196f3" />}
            iconBg="#e3f2fd"
            onClick={() =>
              router.push(
                "/dashboard/leads?status=in+progress%2Cdetails+shared",
              )
            }
            loading={loading}
          />

          <StatCard
            title="New Leads"
            value={newLeads}
            icon={<FaUserPlus size={17} color="#2196f3" />}
            iconBg="#e3f2fd"
            onClick={() => router.push("/dashboard/leads?status=new")}
            loading={loading}
          />

          <StatCard
            title="Upcoming Site Visits"
            value={siteVisitCount}
            icon={<FaHandshake size={17} color="#8e24aa" />}
            iconBg="#f3e5f5"
            loading={loading}
            onClick={() => {
              const leadId = analytics?.siteVisitLeadIds?.[0];

              if (leadId) {
                router.push(`/dashboard/leads?leadIdentifier=${leadId}`);
              } else {
                router.push("/dashboard/leads");
              }
            }}
          />

          <StatCard
            title="MoUs (Pending / Approved)"
            value={`${mouPending} / ${mouApproved}`}
            icon={<FaFileSignature size={17} color="#3949ab" />}
            iconBg="#e8eaf6"
            onClick={() => router.push("/dashboard/mou")}
            loading={loading}
          />

          <StatCard
            title="Total Vendors & Billing amount"
            value={`${totalCabVendors} / ₹${totalEarnings.toLocaleString()}`}
            icon={<FaRupeeSign size={17} color="#ffb300" />}
            iconBg="#fffde7"
            loading={loading}
          />
        </Box>

        {/* Schedule Section */}
        <Box className="bg-gray-50 rounded-xl flex items-center justify-center">
          <ScheduleCard
            analyticsAccess={analyticsAccess}
            scheduleLoading={scheduleLoading}
            scheduleAnalytics={scheduleAnalytics}
          />
        </Box>
      </Box>
      {/* YOUR TEAMS SECTION */}
    <Box className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 mt-6 flex flex-col md:flex-row md:items-center gap-18">

  {/* Title */}
  <Typography className="text-blue-600 font-semibold text-xl">
    YOUR TEAMS
  </Typography>

  {/* Dropdown */}
  {usersLoading ? (
    <Skeleton
      variant="rectangular"
      width={280}
      height={40}
      className="rounded-md"
    />
  ) : (
    <Autocomplete
      className="w-[280px]"
      options={teamUsersWithAll}
      disableClearable
      value={selectedUser ?? allOption}
      onChange={(_, value) => {
        if (value?._id === "all") {
          setSelectedUser(null);
        } else {
          setSelectedUser(value);
        }
      }}
      getOptionLabel={(option) =>
        option._id === "all"
          ? option.name
          : option.teamName
          ? `${option.name} (${option.teamName})`
          : option.name
      }
      isOptionEqualToValue={(option, value) => option._id === value._id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Team User"
          placeholder="Search user or team..."
          size="small"
        />
      )}
    />
  )}

</Box>

      {/* TEAM STAT CARDS */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-2">
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-1 w-full">
          <StatCard
            loading={usersLoading}
            title="Active Leads"
            value={teamStats.activeLeads}
            onClick={() =>
              router.push(
                "/dashboard/leads?status=in+progress%2Cdetails+shared",
              )
            }
            icon={<FaPhoneAlt size={17} className="text-blue-500" />}
            iconBg="#e3f2fd"
          />
          <StatCard
            loading={usersLoading}
            title="New Leads"
            value={teamStats.newLeads}
            onClick={() => router.push("/dashboard/leads?status=new")}
            icon={<FaUserPlus size={17} className="text-blue-500" />}
            iconBg="#e3f2fd"
          />
          <StatCard
            loading={usersLoading}
            title="Site Visits Scheduled"
            value={teamStats.siteVisitCount}
            icon={<FaHandshake size={17} className="text-purple-700" />}
            iconBg="#f3e5f5"
          />
          <StatCard
            loading={usersLoading}
            title="MoUs (Pending / Completed)"
            value={`${teamStats.mouPending} / ${teamStats.mouApproved}`}
            onClick={() => router.push("/dashboard/mou")}
            icon={<FaFileSignature size={17} className="text-indigo-900" />}
            iconBg="#e8eaf6"
          />
          {showVendorBilling && (
            <StatCard
              loading={usersLoading}
              title="Total Vendors & Billing amount"
              value={`${teamStats.totalVendors} / ₹${teamStats.totalSpend.toLocaleString()}`}
              icon={<FaRupeeSign size={17} className="text-yellow-500" />}
              iconBg="#fffde7"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
