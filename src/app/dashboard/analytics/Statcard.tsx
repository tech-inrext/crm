"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import { Autocomplete, TextField } from "@mui/material";
import ScheduleCard from "./components/ScheduleCard";
import { FaUsers, FaDollarSign, FaBuilding } from "react-icons/fa";

//StatCard Component
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
    className={`rounded-2xl border border-gray-200 bg-white min-h-[130px] p-4 shadow-sm transition cursor-${onClick ? "pointer" : "default"} hover:shadow-md`}
    onClick={onClick}
  >
    <CardContent className="p-0">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="body2" className="text-gray-500">
            {loading ? <Skeleton width={60} /> : title}
          </Typography>
          <Typography variant="h5" className="mt-1 font-bold text-gray-900">
            {loading ? <Skeleton width={70} height={32} /> : value}
          </Typography>
        </Box>

        <Box
          className={`rounded-full w-10 h-10 flex items-center justify-center`}
          style={{ backgroundColor: iconBg }}
        >
          {loading ? (
            <Skeleton variant="circular" width={32} height={32} />
          ) : (
            icon
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

//  Main StatsCardsRow Component
export const StatsCardsRow: React.FC<{
  scheduleLoading?: boolean;
  scheduleAnalytics?: any;
  analyticsAccess?: boolean;
}> = ({ scheduleLoading, scheduleAnalytics, analyticsAccess }) => {
  const router = useRouter();
  const { user } = useAuth();

  //States
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [teamUsersWithAll, setTeamUsersWithAll] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserTeamUsers, setSelectedUserTeamUsers] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  const allOption = { _id: "all", name: "All Team Members" };
  const showVendorBilling = true;

  // Fetch Analytics
  useEffect(() => {
    setLoading(true);
    const url = selectedUserId
      ? `/api/v0/analytics/overall?userId=${selectedUserId}`
      : `/api/v0/analytics/overall`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => setAnalytics(data || {}))
      .finally(() => setLoading(false));
  }, [selectedUserId]);

  // Fetch Team Users
  useEffect(() => {
    const fetchTeamUsers = async () => {
      setUserLoading(true);
      try {
        const res = await fetch(`/api/v0/employee/teams/users`);
        const data = await res.json();
        if (Array.isArray(data?.users)) {
          setTeamUsers(data.users);
          setTeamUsersWithAll([allOption, ...data.users]);
        } else {
          setTeamUsers([]);
          setTeamUsersWithAll([allOption]);
        }
      } catch {
        setTeamUsers([]);
        setTeamUsersWithAll([allOption]);
      } finally {
        setUserLoading(false);
      }
    };

    if (user?._id) fetchTeamUsers();
  }, [user?._id]);

  // Analytics Values
  const teamCount = analytics?.teamCount ?? 0;
  const activeLeads = analytics?.activeLeads ?? 0;
  const newLeads = analytics?.newLeads ?? 0;
  const siteVisitCount = analytics?.siteVisitCount ?? 0;
  const mouPending = analytics?.mouPending ?? 0;
  const mouApproved = analytics?.mouApproved ?? 0;
  const totalCabVendors = analytics?.totalCabVendors ?? 0;
  const totalEarnings = analytics?.totalEarnings ?? 0;

  //   Team Stats (All vs Selected)
  const overallTeamNewLeads =
    selectedUserId === null
      ? teamUsers.reduce((acc, u) => acc + (u.newLeads ?? 0), 0)
      : (selectedUser?.newLeads ?? 0);

  const overallTeamActiveLeads =
    selectedUserId === null
      ? teamUsers.reduce((acc, u) => acc + (u.activeLeads ?? 0), 0)
      : (selectedUser?.activeLeads ?? 0);

  const overallTeamSiteVisits =
    selectedUserId === null
      ? teamUsers.reduce((acc, u) => acc + (u.siteVisitCount ?? 0), 0)
      : (selectedUser?.siteVisitCount ?? 0);

  const overallTeamMouPending =
    selectedUserId === null
      ? teamUsers.reduce(
          (acc, u) => acc + (u.mouPending ?? u.mouStats?.pending ?? 0),
          0,
        )
      : (selectedUser?.mouStats?.pending ?? 0);

  const overallTeamMouApproved =
    selectedUserId === null
      ? teamUsers.reduce(
          (acc, u) =>
            acc +
            ((u.mouApproved ?? 0) +
              (u.mouCompleted ?? 0) +
              (u.mouStats?.approved ?? 0)),
          0,
        )
      : (selectedUser?.mouStats?.approved ?? 0);

  const overallTeamTotalVendors =
    selectedUserId === null
      ? teamUsers.reduce((acc, u) => acc + (u.totalVendors ?? 0), 0)
      : (selectedUser?.totalVendors ?? 0);

  const overallTeamTotalSpend =
    selectedUserId === null
      ? teamUsers.reduce((acc, u) => acc + (u.totalSpend ?? 0), 0)
      : (selectedUser?.totalSpend ?? 0);

  // ---------------- JSX ----------------
  return (
    <Box className="w-full mb-8">
      {/* YOU Section */}
      <div className="text-blue-500 m-2 font-semibold">YOU</div>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            title="My Teams (All Levels)"
            value={teamCount}
            icon={<FaUsers size={20} color="#43a047" />}
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
            icon={<FaUsers size={20} color="#2196f3" />}
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
            icon={<FaUsers size={20} color="#2196f3" />}
            iconBg="#e3f2fd"
            onClick={() => router.push("/dashboard/leads?status=new")}
            loading={loading}
          />
          <StatCard
            title="Site Visits Scheduled"
            value={siteVisitCount}
            icon={<FaDollarSign size={20} color="#8e24aa" />}
            iconBg="#f3e5f5"
            onClick={() =>
              router.push("/dashboard/leads?status=site+visit+done")
            }
            loading={loading}
          />
          <StatCard
            title="MoUs (Pending / Approved)"
            value={`${mouPending} / ${mouApproved}`}
            icon={<FaUsers size={20} color="#3949ab" />}
            iconBg="#e8eaf6"
            onClick={() => router.push("/dashboard/mou")}
            loading={loading}
          />
          <StatCard
            title="Total Vendors & Billing amount"
            value={`${totalCabVendors} / ₹${totalEarnings.toLocaleString()}`}
            icon={<FaBuilding size={20} color="#ffb300" />}
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

      {/* YOUR TEAMS Section */}
      <div className="flex flex-row mt-8 items-center">
        <div className="text-blue-500 m-2 font-semibold">YOUR TEAMS</div>

        {userLoading ? (
          <Skeleton
            variant="rectangular"
            width={280}
            height={40}
            className="ml-2 rounded"
          />
        ) : (
          <Autocomplete
            className="ml-2 min-w-[280px]"
            options={teamUsersWithAll}
            getOptionLabel={(option) =>
              option._id === "all"
                ? option.name
                : option.teamName
                  ? `${option.name} (${option.teamName})`
                  : option.name
            }
            value={selectedUser === null ? allOption : selectedUser}
            onChange={async (_, value) => {
              if (value?._id === "all") {
                setSelectedUser(null);
                setSelectedUserTeamUsers([]);
                setSelectedUserId(null);
              } else if (value?._id) {
                setSelectedUser(value);
                setSelectedUserId(value._id);

                try {
                  const res = await fetch(`/api/v0/employee/teams/users`);
                  const data = await res.json();
                  setSelectedUserTeamUsers(
                    Array.isArray(data?.users) ? data.users : [],
                  );
                } catch {
                  setSelectedUserTeamUsers([]);
                }
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Team User"
                placeholder="Search user or team..."
                size="small"
              />
            )}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            disableClearable
            filterOptions={(options, state) =>
              options.filter(
                (option) =>
                  option.name
                    .toLowerCase()
                    .includes(state.inputValue.toLowerCase()) ||
                  option.teamName
                    ?.toLowerCase()
                    .includes(state.inputValue.toLowerCase()),
              )
            }
            renderOption={(props, option) => (
              <li {...props} key={option._id}>
                {option.teamName && option._id !== "all"
                  ? `${option.name} (${option.teamName})`
                  : option.name}
              </li>
            )}
          />
        )}
      </div>

      {/* Team Stats Cards */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-2">
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {userLoading ? (
            <>
              <StatCard
                loading
                title="Active Leads"
                value={0}
                icon={<FaUsers size={24} className="text-blue-500" />}
                iconBg="#e3f2fd"
              />
              <StatCard
                loading
                title="New Leads"
                value={0}
                icon={<FaUsers size={24} className="text-blue-500" />}
                iconBg="#e3f2fd"
              />
              <StatCard
                loading
                title="Site Visits Scheduled"
                value={0}
                icon={<FaDollarSign size={24} className="text-purple-700" />}
                iconBg="#f3f5f5"
              />
              <StatCard
                loading
                title="MoUs (Pending / Completed)"
                value={0}
                icon={<FaUsers size={24} className="text-indigo-900" />}
                iconBg="#e8eaf6"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Active Leads"
                value={overallTeamActiveLeads}
                icon={<FaUsers size={24} className="text-blue-500" />}
                iconBg="#e3f2fd"
                onClick={() =>
                  router.push(
                    "/dashboard/leads?status=follow-up%2Ccall+back%2Cdetails+shared%2Csite+visit+done",
                  )
                }
              />
              <StatCard
                title="New Leads"
                value={overallTeamNewLeads}
                icon={<FaUsers size={24} className="text-blue-500" />}
                iconBg="#e3f2fd"
                onClick={() => router.push("/dashboard/leads?status=new")}
              />
              <StatCard
                title="Site Visits Scheduled"
                value={overallTeamSiteVisits}
                icon={<FaDollarSign size={24} className="text-purple-700" />}
                iconBg="#f3f5f5"
                onClick={() =>
                  router.push("/dashboard/leads?status=site+visit+done")
                }
              />
              <StatCard
                title="MoUs (Pending / Completed)"
                value={`${overallTeamMouPending} / ${overallTeamMouApproved}`}
                icon={<FaUsers size={24} className="text-indigo-900" />}
                iconBg="#e8eaf6"
                onClick={() => router.push("/dashboard/mou")}
              />
              {showVendorBilling && (
                <StatCard
                  title="Total Vendors & Billing amount"
                  value={`${overallTeamTotalVendors} / ₹${overallTeamTotalSpend.toLocaleString()}`}
                  icon={<FaBuilding size={24} className="text-yellow-500" />}
                  iconBg="#fffde7"
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
