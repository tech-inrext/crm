"use client";
import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import ScheduleCard from "./components/ScheduleCard";
import {
  FaUsers,
  FaUserPlus,
  FaChartLine,
  FaMapMarkedAlt,
  FaFileSignature,
  FaBuilding,
  FaRupeeSign,
  FaMapMarkerAlt
} from "react-icons/fa";
type TrendItem = {
  date: string;  
  value: number;
};

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  trend?: TrendItem[]; // Array of trend items for last N days (sorted desc)
};

const StatCard: React.FC<StatCardProps & { onClick?: () => void; loading?: boolean }> = ({
  title,
  value,
  icon,
  iconBg,
  trend,
  onClick,
  loading = false,
}) => {
  let trendDisplay: React.ReactNode = null;

  // Helper to get date label (Today, Yesterday, X days ago)
  function getDateLabel(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - dateCopy.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (dateCopy.toDateString() === today.toDateString()) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
    return dateCopy.toLocaleDateString();
  }

  // Show only the most recent non-zero trend value, or 'No change today' if all are zero
  if (!loading && trend && Array.isArray(trend) && trend.length > 0) {
    // Sort trend by date descending (latest first)
    const sortedTrend = [...trend].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const isActiveLeads = title === "Active Leads";
    // Find the most recent non-zero value
    const mostRecent = sortedTrend.slice(0, 3).find((item) => item.value > 0);
    if (mostRecent) {
      const label = getDateLabel(new Date(mostRecent.date));
      trendDisplay = (
        <Typography
          sx={{
            color: isActiveLeads ? "success.main" : "#888",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            mt: 0.5,
          }}
        >
          <span style={{ fontWeight: 600 }}>{mostRecent.value} new</span>
          <span style={{ marginLeft: 4, color: "#888" }}>{label}</span>
        </Typography>
      );
    } else {
      // If all are zero, show no change for today
      trendDisplay = (
        <Typography
          sx={{
            color: "#888",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            mt: 0.5,
          }}
        >
          — No change today
        </Typography>
      );
    }
  } else if (loading) {
    trendDisplay = (
      <Skeleton variant="text" width={80} height={18} sx={{ mt: 0.5 }} />
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 2,
        border: "1px solid #f0f0f0",
        background: "#fff",
        minHeight: 130,
        minWidth: 0,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        px: 2,
        py: 2,
        boxShadow: "0 2px 8px 0 rgba(99, 99, 99, 0.04)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s",
        "&:hover": onClick
          ? {
              boxShadow: "0 4px 16px 0 rgba(33, 150, 243, 0.10)",
              borderColor: "#2196f3",
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              sx={{ fontSize: { xs: 11, sm: 13 } }}
            >
              {loading ? <Skeleton width={60} /> : title}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mt: 0.5, fontSize: { xs: 22, sm: 24 }, color: "#1a1a1a" }}
            >
              {loading ? <Skeleton width={70} height={32} /> : value}
            </Typography>
            {trendDisplay}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              bgcolor: iconBg || "#fffbe6",
              width: 40,
              height: 40,
              boxShadow: "0 2px 8px 0 rgba(99, 99, 99, 0.04)",
            }}
          >
            {loading ? <Skeleton variant="circular" width={32} height={32} /> : icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

type StatsCardsRowProps = {
  newLeads?: number | null;
  notconnectedLeads?: number | null;
  callBackLeads?: number | null;
  followUpLeads?: number | null;
  detailsSharedLeads?: number | null;
  loadingNewLeads?: boolean;
  siteVisitCount?: number | null;
  siteVisitLoading?: boolean;
  totalUsers?: number | null;
  usersLoading?: boolean;
  totalTeams?: number | null;
  teamsLoading?: boolean;
  vendorCount?: number | null;
  totalBilling?: string | number | null;
  pendingMouTotal?: number | null;
  pendingMouLoading?: boolean;
  approvedMouTotal?: number | null;
  approvedMouLoading?: boolean;
  showVendorBilling?: boolean;
  showTotalUsers?: boolean;
  scheduleLoading?: boolean;
  scheduleAnalytics?: any;
  analyticsAccess?: any;
  trend?: any;
  trendLeads?: any;
  myTeamsCount?: number | null;
};

export const StatsCardsRow: React.FC<StatsCardsRowProps> = (props) => {
  const router = useRouter();
  // Extended type for team users to include all used properties
  type TeamUserType = {
    _id: string;
    name: string;
    teamName?: string;
    newLeads?: number;
    activeLeads?: number;
    siteVisitCount?: number;
    mouPending?: number;
    mouApproved?: number;
    mouCompleted?: number;
    mouStats?: {
      pending?: number;
      approved?: number;
      completed?: number;
    };
    totalVendors?: number;
    totalSpend?: number;
    children?: { _id: string; name: string; teamName?: string }[];
  };
  // State for team users dropdown (must be before any use)
  const [teamUsers, setTeamUsers] = React.useState<TeamUserType[]>([]);
  // State for overall users MoUs from users API
  const [usersMous, setUsersMous] = React.useState<{pending: number, approved: number, completed: number}>({pending: 0, approved: 0, completed: 0});
  // State for initialStats from backend (sum of all stats including children)
  const [initialStats, setInitialStats] = React.useState<any | null>(null);
  // By default, show 'All' (null means all users)
  const [selectedUser, setSelectedUser] = React.useState<TeamUserType | null>(null);

  // Memoize 'All' option
  const allOption: TeamUserType = React.useMemo(() => ({
    _id: 'all',
    name: 'All',
    teamName: '',
    newLeads: 0,
    activeLeads: 0,
    siteVisitCount: 0,
    mouPending: 0,
    mouApproved: 0,
    mouCompleted: 0,
    mouStats: { pending: 0, approved: 0, completed: 0 },
    totalVendors: 0,
    totalSpend: 0,
  }), []);

  // Memoize flattening and unique user logic
  const teamUsersWithAll: TeamUserType[] = React.useMemo(() => {
    const arr: TeamUserType[] = [allOption];
    const seenUserIds = new Set<string>();
    function addUniqueUser(user: TeamUserType) {
      const userId = typeof user._id === 'string' ? user._id : user._id?.toString?.();
      if (!userId || seenUserIds.has(userId)) return;
      seenUserIds.add(userId);
      arr.push(user);
    }
    function addUserAndChildren(user: TeamUserType) {
      addUniqueUser(user);
      if (user.children && Array.isArray(user.children)) {
        user.children.forEach(addUserAndChildren);
      }
    }
    teamUsers.forEach(addUserAndChildren);
    return arr;
  }, [teamUsers, allOption]);

  // Memoize overall team stats calculations
  const overallTeamStats = React.useMemo(() => {
    const isAll = !selectedUser || selectedUser._id === 'all';
    return {
      newLeads: isAll && initialStats ? initialStats.newLeads : (teamUsers && teamUsers.length > 0 ? teamUsers.reduce((acc, user) => acc + (user.newLeads || 0), 0) : 0),
      activeLeads: isAll && initialStats ? initialStats.activeLeads : (teamUsers && teamUsers.length > 0 ? teamUsers.reduce((acc, user) => acc + (user.activeLeads || 0), 0) : 0),
      siteVisitCount: isAll && initialStats ? initialStats.siteVisitCount : (teamUsers && teamUsers.length > 0 ? teamUsers.reduce((acc, user) => acc + (user.siteVisitCount || 0), 0) : 0),
      mouPending: isAll && initialStats ? initialStats.mou?.pending ?? 0 : (teamUsers && teamUsers.length > 0 ? teamUsers.reduce((acc, user) => acc + (user.mouPending || user.mouStats?.pending || 0), 0) : 0),
      mouApproved: isAll && initialStats ? ((initialStats.mou?.approved ?? 0) + (initialStats.mou?.completed ?? 0)) : (teamUsers && teamUsers.length > 0 ? teamUsers.reduce((acc, user) => {
        let approved = user.mouApproved || user.mouStats?.approved || 0;
        let completed = user.mouCompleted || user.mouStats?.completed || 0;
        return acc + approved + completed;
      }, 0) : 0),
    };
  }, [selectedUser, initialStats, teamUsers]);

  const overallTeamNewLeads = overallTeamStats.newLeads;
  const overallTeamActiveLeads = overallTeamStats.activeLeads;
  const overallTeamSiteVisits = overallTeamStats.siteVisitCount;
  const overallTeamMouPending = overallTeamStats.mouPending;
  const overallTeamMouApproved = overallTeamStats.mouApproved;
  // State for backend summary of MoUs (for 'All' selection)
  const [overallTeamMouSummary, setOverallTeamMouSummary] = React.useState<{pending: number, approved: number, completed: number}>({pending: 0, approved: 0, completed: 0});
  const {
    newLeads = 0,
    notconnectedLeads = 0,
    callBackLeads = 0,
    followUpLeads = 0,
    detailsSharedLeads = 0,
    loadingNewLeads = false,
    siteVisitCount = 0,
    siteVisitLoading = false,
    totalUsers = 0,
    usersLoading = false,
    totalTeams = 0,
    teamsLoading = false,
    // Remove vendorCount and totalBilling from props, will fetch from backend
    pendingMouTotal = 0,
    pendingMouLoading = false,
    approvedMouTotal = 0,
    approvedMouLoading = false,
    showVendorBilling = false,
    showTotalUsers = false,
    scheduleLoading = false,
    scheduleAnalytics = null,
    analyticsAccess = null,
    trend = {},
    trendLeads = {},
    // Remove myTeamsCount from props, will fetch from backend
  } = props;

  // myTeamsCount is only from props, not local state


  // Fetch all dashboard stats from overall API (single source of truth)
  const [dashboardStats, setDashboardStats] = React.useState<any | null>(null);
  const [dashboardLoading, setDashboardLoading] = React.useState(true);
  // Fetch vendor stats from vendor API
  const [vendorStats, setVendorStats] = React.useState<{ totalVendors: number, totalEarnings: number }>({ totalVendors: 0, totalEarnings: 0 });
  const [vendorLoading, setVendorLoading] = React.useState(true);
  React.useEffect(() => {
    setDashboardLoading(true);
    setVendorLoading(true);
    // Fetch dashboardStats and vendorStats in parallel
    Promise.all([
      fetch("/api/v0/analytics/overall").then((r) => r.json()),
      fetch("/api/v0/analytics/vendor").then((r) => r.json()),
    ])
      .then(([dashboardData, vendorData]) => {
        setDashboardStats(dashboardData || {});
        setVendorStats({
          totalVendors: vendorData?.totalVendors ?? 0,
          totalEarnings: vendorData?.allVendors?.reduce?.((acc, v) => acc + (v.totalEarnings || 0), 0) ?? 0,
        });
      })
      .finally(() => {
        setDashboardLoading(false);
        setVendorLoading(false);
      });
  }, []);



  // State for selected user's analytics
  const [userAnalytics, setUserAnalytics] = React.useState<any | null>(null);
  const [userTrend, setUserTrend] = React.useState<any | null>(null);
  const [userTrendLeads, setUserTrendLeads] = React.useState<any | null>(null);
  const [userLoading, setUserLoading] = React.useState(false);
  // State for selected user's team MoU stats (sum for all direct reports)
  const [selectedUserTeamMouStats, setSelectedUserTeamMouStats] = React.useState<{pending: number, approved: number} | null>(null);
  // State for selected user's direct reports (team members)
  const [selectedUserTeamUsers, setSelectedUserTeamUsers] = React.useState<any[]>([]);

  // Fetch team users (with team name and stats) and summary for 'All' when selection changes (prevent duplicate calls for 'All')
  const teamUsersFetchedRef = React.useRef(false);
  React.useEffect(() => {
    if ((!selectedUser || selectedUser._id === 'all') && !teamUsersFetchedRef.current) {
      teamUsersFetchedRef.current = true;
      fetch("/api/v0/employee/teams/users")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data?.users)) {
            setTeamUsers(
              data.users.map((u: any) => ({
                ...u,
                teamName: u.teamName || "",
                newLeads: u.newLeads ?? u.stats?.newLeads ?? 0,
                activeLeads: u.activeLeads ?? u.stats?.activeLeads ?? 0,
                siteVisitCount: u.siteVisitCount ?? u.stats?.siteVisitCount ?? 0,
                mouPending: u.mouPending ?? u.stats?.mouPending ?? u.mouStats?.pending ?? 0,
                mouApproved: u.mouApproved ?? u.stats?.mouApproved ?? u.mouStats?.approved ?? 0,
                mouCompleted: u.mouCompleted ?? u.stats?.mouCompleted ?? u.mouStats?.completed ?? 0,
              }))
            );
          }
          if (data?.mous) {
            setUsersMous({
              pending: data.mous.pending ?? 0,
              approved: data.mous.approved ?? 0,
              completed: data.mous.completed ?? 0,
            });
          }
          if (data?.initialStats) {
            setInitialStats(data.initialStats);
          } else {
            setInitialStats(null);
          }
        });
    }
    // Reset ref if user changes to something else
    if (selectedUser && selectedUser._id !== 'all') {
      teamUsersFetchedRef.current = false;
    }
  }, [selectedUser]);

  // Fetch analytics for selected user
  React.useEffect(() => {
    if (selectedUser && selectedUser._id) {
      setUserLoading(true);
      fetch(`/api/v0/analytics/overall?userId=${selectedUser._id}`)
        .then((r) => r.json())
        .then((data) => {
          setUserAnalytics(data || {});
          setUserTrend(data?.trend || {});
          setUserTrendLeads(data?.trendLeads || {});
        })
        .finally(() => setUserLoading(false));
    } else {
      setUserAnalytics(null);
      setUserTrend(null);
      setUserTrendLeads(null);
      setUserLoading(false);
    }
  }, [selectedUser]);

  // Fetch direct reports (team users) for selected user and sum their MoU stats
  React.useEffect(() => {
    if (selectedUser && selectedUser._id && selectedUser._id !== 'all') {
      fetch(`/api/v0/employee/teams/users?managerId=${selectedUser._id}`)
        .then((r) => r.json()) 
        .then((data) => {  
          if (Array.isArray(data?.users)) {
            setSelectedUserTeamUsers(data.users);
            // Sum pending and approved MoUs for all direct reports
            const pending = data.users.reduce((acc, user) => acc + (user.mouPending ?? user.mouStats?.pending ?? 0), 0);
            const approved = data.users.reduce((acc, user) => acc + (user.mouApproved ?? user.mouStats?.approved ?? 0), 0);
            setSelectedUserTeamMouStats({ pending, approved });
          } else {
            setSelectedUserTeamUsers([]);
            setSelectedUserTeamMouStats({ pending: 0, approved: 0 });
          }
        })
        .catch(() => {
          setSelectedUserTeamUsers([]);
          setSelectedUserTeamMouStats({ pending: 0, approved: 0 });
        });
    } else {
      setSelectedUserTeamUsers([]);
      setSelectedUserTeamMouStats(null);
    }
  }, [selectedUser]);

  // For logged-in user, use local sum; for selected user, use backend value
  const activeLeads =
    (followUpLeads ?? 0) +
    (callBackLeads ?? 0) +
    (detailsSharedLeads ?? 0) +
    (siteVisitCount ?? 0);
  const userActiveLeads = userAnalytics?.activeLeads ?? 0;

  // Helper to convert old trend object to array format
  function trendObjToArray(
    trendObj: any,
    dateMap?: Record<string, string>
  ): TrendItem[] | undefined {
    if (!trendObj) return undefined;
    // If already array, return as is
    if (Array.isArray(trendObj)) return trendObj;
    // Otherwise, convert { today, yesterday, beforeYesterday } to array
    const arr: TrendItem[] = [];
    if (trendObj.today !== undefined) {
      arr.push({
        date: dateMap?.today || getDateNDaysAgo(0),
        value: trendObj.today,
      });
    }
    if (trendObj.yesterday !== undefined) {
      arr.push({
        date: dateMap?.yesterday || getDateNDaysAgo(1),
        value: trendObj.yesterday,
      });
    }
    if (trendObj.beforeYesterday !== undefined) {
      arr.push({
        date: dateMap?.beforeYesterday || getDateNDaysAgo(2),
        value: trendObj.beforeYesterday,
      });
    }
    return arr.length > 0 ? arr : undefined;
  }

  // Helper to get ISO date string for N days ago
  function getDateNDaysAgo(n: number) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  // Memoize trend arrays and calculations
  const totalUsersTrend = React.useMemo(() => trendObjToArray(trend?.totalUsers), [trend]);
  const newLeadsTrend = React.useMemo(() => trendObjToArray(trend?.newLeads), [trend]);
  const siteVisitTrend = React.useMemo(() => trendObjToArray(trend?.siteVisitCount), [trend]);
  const pendingMouTrend = React.useMemo(() => trendObjToArray(trend?.pendingMouTotal), [trend]);
  const totalVendorsTrend = React.useMemo(() => trendObjToArray(trend?.totalBilling), [trend]);
  // For activeLeads, sum up trends for each status if available
  const activeLeadsTrend: TrendItem[] | undefined = React.useMemo(() => {
    if (trendLeads?.activeLeads) {
      if (Array.isArray(trendLeads.activeLeads)) {
        return trendLeads.activeLeads;
      } else {
        const days = ["today", "yesterday", "beforeYesterday"];
        return days.map((day, idx) => {
          const value =
            (trendLeads?.followUpLeads?.[day] ?? 0) +
            (trendLeads?.callBackLeads?.[day] ?? 0) +
            (trendLeads?.detailsSharedLeads?.[day] ?? 0) +
            (trendLeads?.siteVisitCount?.[day] ?? 0);
          return { date: getDateNDaysAgo(idx), value };
        });
      }
    }
    return undefined;
  }, [trendLeads]);

  // For selected user, prepare trends
  const userNewLeadsTrend = React.useMemo(() => trendObjToArray(userTrend?.newLeads), [userTrend]);
  const userSiteVisitTrend = React.useMemo(() => trendObjToArray(userTrend?.siteVisitCount), [userTrend]);
  const userPendingMouTrend = React.useMemo(() => trendObjToArray(userTrend?.pendingMouTotal), [userTrend]);
  const userActiveLeadsTrend: TrendItem[] | undefined = React.useMemo(() => {
    if (userTrendLeads?.activeLeads) {
      if (Array.isArray(userTrendLeads.activeLeads)) {
        return userTrendLeads.activeLeads;
      } else {
        const days = ["today", "yesterday", "beforeYesterday"];
        return days.map((day, idx) => {
          const value =
            (userTrendLeads?.followUpLeads?.[day] ?? 0) +
            (userTrendLeads?.callBackLeads?.[day] ?? 0) +
            (userTrendLeads?.detailsSharedLeads?.[day] ?? 0) +
            (userTrendLeads?.siteVisitCount?.[day] ?? 0);
          return { date: getDateNDaysAgo(idx), value };
        });
      }
    }
    return undefined;
  }, [userTrendLeads]);

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <div className="text-blue-500 m-2"> YOU </div>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          width: "100%",
        }}
      >
        {/* Stat Cards Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
            alignItems: "stretch",
            width: "100%",
          }}
        >
          <StatCard
            title="My Teams (All Levels)"
            value={dashboardStats?.teamsCount ?? 0}
            icon={<FaUsers size={24} style={{ color: "#ff0000" }} />}
            iconBg="#e8f5e9"
            onClick={() => router.push("/dashboard/teams")}
            loading={dashboardLoading}
          />
          <StatCard
            title="Active Leads"
            value={dashboardStats?.activeLeads ?? 0}
            icon={<FaChartLine size={24} style={{ color: "#2196f3" }} />}
            iconBg="#e3f2fd"
            trend={activeLeadsTrend}
            onClick={() => router.push("/dashboard/leads?status=follow-up%2Ccall+back%2Cdetails+shared%2Csite+visit+done")}
            loading={dashboardLoading}
          />
          <StatCard
            title="New Leads"
            value={dashboardStats?.newLeads ?? 0}
            icon={<FaUserPlus size={24} style={{ color: "#43a047" }} />}
            iconBg="#e3f2fd"
            trend={newLeadsTrend}
            onClick={() => router.push("/dashboard/leads?status=new")}
            loading={dashboardLoading}
          />
          <StatCard
            title="Site Visits Scheduled"
            value={dashboardStats?.siteVisitCount ?? 0}
            icon={<FaMapMarkerAlt size={24} style={{ color: "#8e24aa" }} />}
            iconBg="#f3e5f5"
            trend={siteVisitTrend}
            onClick={() => router.push("/dashboard/leads?status=site+visit+done")}
            loading={dashboardLoading}
          />
          <StatCard
            title="MoUs (Pending / Completed)"
            value={dashboardLoading
              ? 0
              : `${dashboardStats?.mouStats?.pending ?? 0} / ${dashboardStats?.mouStats?.approved ?? 0}`}
            icon={<FaFileSignature size={24} style={{ color: "#3949ab" }} />}
            iconBg="#e8eaf6"
            trend={pendingMouTrend}
            onClick={() => router.push("/dashboard/mou")}
            loading={dashboardLoading}
          />
          {showVendorBilling && (
            <StatCard
              title="Total Vendors & Billing amount"
              value={`${vendorStats.totalVendors} / ₹${Number(vendorStats.totalEarnings).toLocaleString()}`}
              icon={<FaRupeeSign size={24} style={{ color: "#ffb300" }} />}
              iconBg="#fffde7"
              trend={totalVendorsTrend}
              loading={dashboardLoading || vendorLoading}
            />
          )}
        </Box>

        {/* Schedule Card */}
        <Box
          sx={{
            width: "100%",
            minHeight: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#fafbfc",
            borderRadius: 2,
          }}
        >
          <ScheduleCard
            analyticsAccess={analyticsAccess}
            scheduleLoading={scheduleLoading}
            scheduleAnalytics={scheduleAnalytics}
          />
        </Box>
      </Box>
      <div className=" flex flex-row mt-8 bg-white border gap-12 border-blue-600/30 p-4 rounded-2xl">
        <div className="text-blue-500 m-2  text-xl  font-serif "> YOUR TEAMS </div>
        {teamUsers.length === 0 ? (
          <Skeleton variant="rectangular" width={280} height={40} sx={{ ml: 2, borderRadius: 1 }} />
        ) : (
          <Autocomplete
            sx={{ minWidth: 280, ml: 2 }}
            options={teamUsersWithAll}
            getOptionLabel={(option) => {
              if (option._id === 'all') return option.name;
              return option.teamName ? `${option.name} (${option.teamName})` : option.name;
            }}
            value={selectedUser === null ? allOption : selectedUser}
            onChange={async (_, value) => {
              if (value && value._id === 'all') {
                setSelectedUser(null);
                setSelectedUserTeamUsers([]);
              } else if (value && value._id) {
                setSelectedUser(value);
                // Fetch children (direct reports) IDs for the selected user
                try {
                  const res = await fetch(`/api/v0/employee/teams/users?managerId=${value._id}`);
                  const data = await res.json();
                  if (Array.isArray(data?.users)) {
                    // Store direct reports (children) in state
                    setSelectedUserTeamUsers(data.users);
                  } else {
                    setSelectedUserTeamUsers([]);
                  }
                } catch (e) {
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
                  (option.teamName &&
                    option.teamName
                      .toLowerCase()
                      .includes(state.inputValue.toLowerCase()))
              )
            }
            renderOption={(props, option) => (
              <li {...props} key={option._id}>
                {option.teamName && option._id !== 'all'
                  ? `${option.name} (${option.teamName})`
                  : option.name}
              </li>
            )}
          />
        )}
      </div>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          width: "100%",
        }}
      >
        {/* Stat Cards Grid for selected user */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
            alignItems: "stretch",
            width: "100%",
            mt: 2,
          }}
        >
          {userLoading || teamUsers.length === 0 ? (
            // Show shimmer for all 4 cards if loading
            <>
              <StatCard loading title="My Teams (All Levels)" value={0} icon={<FaUsers size={24} style={{ color: "#ff0000" }} />} iconBg="#e8f5e9"/>
              <StatCard loading title="Active Leads" value={0} icon={<FaChartLine size={24} style={{ color: "#2196f3" }} />} iconBg="#e3f2fd" />
              <StatCard loading title="New Leads" value={0} icon={<FaUserPlus size={24} style={{ color: "#43a047" }} />} iconBg="#e3f2fd" />
              <StatCard loading title="Site Visits Scheduled" value={0} icon={<FaMapMarkerAlt size={24} style={{ color: "#8e24aa" }} />} iconBg="#f3e5f5" />
              <StatCard loading title="MoUs (Pending / Completed)" value={0} icon={<FaFileSignature size={24} style={{ color: "#3949ab" }} />} iconBg="#e8eaf6" />
              <StatCard loading title="Total Vendors & Billing amount" value={0} icon={<FaRupeeSign size={24} style={{ color: "#ffb300" }} />} iconBg="#fffde7" />
            </>

          ) : (
            <>
              <StatCard
                title="Active Leads"
                value={(!selectedUser || selectedUser._id === 'all') ? overallTeamActiveLeads : userActiveLeads}
                icon={<FaChartLine size={24} style={{ color: "#2196f3" }} />}
                iconBg="#e3f2fd"
                trend={(!selectedUser || selectedUser._id === 'all') ? activeLeadsTrend : userActiveLeadsTrend}
                onClick={() => router.push("/dashboard/leads?status=follow-up%2Ccall+back%2Cdetails+shared%2Csite+visit+done")}
                loading={userLoading}
              />
              <StatCard
                title="New Leads"
                value={(!selectedUser || selectedUser._id === 'all') ? overallTeamNewLeads : (userAnalytics?.newLeads ?? 0)}
                icon={<FaUserPlus size={24} style={{ color: "#43a047" }} />}
                iconBg="#e3f2fd"
                trend={(!selectedUser || selectedUser._id === 'all') ? newLeadsTrend : userNewLeadsTrend}
                onClick={() => router.push("/dashboard/leads?status=new")}
                loading={userLoading}
              />
              <StatCard
                title="Site Visits Scheduled"
                value={(!selectedUser || selectedUser._id === 'all') ? overallTeamSiteVisits : (userAnalytics?.siteVisitCount ?? 0)}
                icon={<FaMapMarkerAlt size={24} style={{ color: "#8e24aa" }} />}
                iconBg="#f3e5f5"
                trend={(!selectedUser || selectedUser._id === 'all') ? siteVisitTrend : userSiteVisitTrend}
                onClick={() => router.push("/dashboard/leads?status=site+visit+done")}
                loading={userLoading}
              />
              <StatCard
                title="MoUs (Pending / Completed)"
                value={
                  (!selectedUser || selectedUser._id === 'all') && initialStats
                    ? `${initialStats.mou?.pending ?? 0} / ${(initialStats.mou?.approved ?? 0) + (initialStats.mou?.completed ?? 0)}`
                    : (selectedUser?.mouStats
                        ? `${selectedUser.mouStats.pending ?? 0} / ${selectedUser.mouStats.approved ?? 0}`
                        : '0 / 0')
                }
                icon={<FaFileSignature size={24} style={{ color: "#3949ab" }} />}
                iconBg="#e8eaf6"
                trend={(!selectedUser || selectedUser._id === 'all') ? pendingMouTrend : userPendingMouTrend}
                onClick={() => router.push("/dashboard/mou")}
                loading={userLoading}
              />
                  {showVendorBilling && (
            <StatCard 
                title="Total Vendors & Billing amount"
                value={
                  (!selectedUser || selectedUser._id === 'all') && initialStats
                    ? `${initialStats.totalVendors || 0} / ₹${(initialStats.totalSpend || 0).toLocaleString()}`
                    : `${selectedUser?.totalVendors || 0} / ₹${(selectedUser?.totalSpend || 0).toLocaleString()}`
                }
                icon={<FaRupeeSign size={24} style={{ color: "#ffb300" }} />}
                iconBg="#fffde7"
                trend={totalVendorsTrend}
                loading={loadingNewLeads}
              />
          )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
