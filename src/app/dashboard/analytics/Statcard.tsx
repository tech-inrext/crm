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
    sx={{ height: 140 }}
    className={`rounded-lg border border-gray-200 bg-white min-h-[85px] p-2 shadow-sm transition cursor-${
      onClick ? "pointer" : "default"
    } hover:shadow`}
    onClick={onClick}
  >
    <CardContent className="p-0">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography className="text-[10px] text-gray-500">
            {loading ? <Skeleton width={60} /> : title}
          </Typography>

          <Typography className="mt-2 font-semibold text-gray-900 text-sm">
            {loading ? <Skeleton width={70} height={18} /> : value}
          </Typography>
        </Box>

        <Box
          className="rounded-full w-13 h-13 flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          {loading ? (
            <Skeleton variant="circular" width={20} height={20} />
          ) : (
            icon
          )}
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
    <Box className="w-full mb-8">
      {/* YOU SECTION */}
      <div className="text-blue-500 text-xl m-4 font-semibold">YOU</div>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="My Teams (All Levels)"
            value={teamCount}
            icon={<FaUserFriends size={20} color="#43a047" />}
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
            icon={<FaPhoneAlt size={20} color="#2196f3" />}
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
            icon={<FaUserPlus size={20} color="#2196f3" />}
            iconBg="#e3f2fd"
            onClick={() => router.push("/dashboard/leads?status=new")}
            loading={loading}
          />
          <StatCard
            title="Upcoming Site Visits"
            value={siteVisitCount}
            icon={<FaHandshake size={20} color="#8e24aa" />}
            iconBg="#f3e5f5"
            loading={loading}
          />
          <StatCard
            title="MoUs (Pending / Approved)"
            value={`${mouPending} / ${mouApproved}`}
            icon={<FaFileSignature size={20} color="#3949ab" />}
            iconBg="#e8eaf6"
            onClick={() => router.push("/dashboard/mou")}
            loading={loading}
          />
          <StatCard
            title="Total Vendors & Billing amount"
            value={`${totalCabVendors} / ₹${totalEarnings.toLocaleString()}`}
            icon={<FaRupeeSign size={20} color="#ffb300" />}
            iconBg="#fffde7"
            loading={loading}
          />
        </Box>

        <Box className="bg-gray-50 rounded-2xl flex items-center justify-center p-4">
          <ScheduleCard
            analyticsAccess={analyticsAccess}
            scheduleLoading={scheduleLoading}
            scheduleAnalytics={scheduleAnalytics}
          />
        </Box>
      </Box>

      {/* YOUR TEAMS SECTION */}
      <div className="flex flex-row mt-8 items-center">
        <div className="text-blue-500 m-2 font-semibold">YOUR TEAMS</div>

        {usersLoading ? (
          <Skeleton
            variant="rectangular"
            width={280}
            height={40}
            sx={{ ml: 2, borderRadius: 1 }}
          />
        ) : (
          <Autocomplete
            sx={{ minWidth: 280, ml: 2 }}
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
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Team User"
                placeholder="Search user or team..."
                size="small"
              />
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
          />
        )}
      </div>

      {/* TEAM STAT CARDS */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-4">
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <StatCard
            loading={usersLoading}
            title="Active Leads"
            value={teamStats.activeLeads}
            onClick={() =>
              router.push(
                "/dashboard/leads?status=in+progress%2Cdetails+shared",
              )
            }
            icon={<FaPhoneAlt size={24} className="text-blue-500" />}
            iconBg="#e3f2fd"
          />
          <StatCard
            loading={usersLoading}
            title="New Leads"
            value={teamStats.newLeads}
            onClick={() => router.push("/dashboard/leads?status=new")}
            icon={<FaUserPlus size={24} className="text-blue-500" />}
            iconBg="#e3f2fd"
          />
          <StatCard
            loading={usersLoading}
            title="Site Visits Scheduled"
            value={teamStats.siteVisitCount}
            icon={<FaHandshake size={24} className="text-purple-700" />}
            iconBg="#f3e5f5"
          />
          <StatCard
            loading={usersLoading}
            title="MoUs (Pending / Completed)"
            value={`${teamStats.mouPending} / ${teamStats.mouApproved}`}
            onClick={() => router.push("/dashboard/mou")}
            icon={<FaFileSignature size={24} className="text-indigo-900" />}
            iconBg="#e8eaf6"
          />
          {showVendorBilling && (
            <StatCard
              loading={usersLoading}
              title="Total Vendors & Billing amount"
              value={`${teamStats.totalVendors} / ₹${teamStats.totalSpend.toLocaleString()}`}
              icon={<FaRupeeSign size={24} className="text-yellow-500" />}
              iconBg="#fffde7"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
