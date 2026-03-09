import React, { useEffect, useMemo, useState } from "react";
import Skeleton from "@/components/ui/Component/Skeleton";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Card from "@/components/ui/Component/Card";
import CardContent from "@/components/ui/Component/CardContent";
import Box from "@/components/ui/Component/Box";
import Typography from "@/components/ui/Component/Typography";
import { useRouter } from "next/navigation";
import CallIcon from "@mui/icons-material/Call";
import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
interface AnalyticsAccess {
  showScheduleThisWeek: boolean;
}

interface ScheduleAnalytics {
  success?: boolean;
  summary?: {
    todayCount: number;
    weekCount: number;
    overdueCount: number;
  };
  data?: {
    today: any[];
    week: any[];
    overdue: any[];
  };
}

interface ScheduleCardProps {
  analyticsAccess: AnalyticsAccess;
  scheduleLoading: boolean;
  scheduleAnalytics: ScheduleAnalytics | null;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  analyticsAccess,
  scheduleLoading,
  scheduleAnalytics,
}) => {
  const router = useRouter();

  const [filter, setFilter] = useState<"day" | "week" | "overdue">("week");
  const [page, setPage] = useState(1);

  const leadsPerPage = 4;

  useEffect(() => {
    setPage(1);
  }, [filter, scheduleAnalytics]);

  const filteredLeads = useMemo(() => {
    if (!scheduleAnalytics?.data) return [];

    let data: any[] = [];

    if (filter === "day") data = scheduleAnalytics.data.today || [];
    if (filter === "week") data = scheduleAnalytics.data.week || [];
    if (filter === "overdue") data = scheduleAnalytics.data.overdue || [];

    // Remove notes from schedule
    return data.filter(
      (item) =>
        item?.followUpType && item.followUpType.toLowerCase() !== "note",
    );
  }, [filter, scheduleAnalytics]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / leadsPerPage),
  );

  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice((page - 1) * leadsPerPage, page * leadsPerPage);
  }, [filteredLeads, page]);

  const handleCardClick = (item: any) => {
    const leadId = item?.lead?._id || item?.lead?.id;

    if (leadId) {
      router.push(`/dashboard/leads?leadIdentifier=${leadId}`);
    } else {
      router.push("/dashboard/leads");
    }
  };

  /* DATE LABEL FUNCTION */
  const getDateLabel = (date: string) => {
    if (!date) return "";

    const followDate = new Date(date);
    const today = new Date();

    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const followStart = new Date(followDate.setHours(0, 0, 0, 0));

    const diffDays = (followStart.getTime() - todayStart.getTime()) / 86400000;

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";

    return followStart.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (!analyticsAccess.showScheduleThisWeek) {
    return (
      <Card>
        <CardContent className="text-center space-y-2 py-6">
          <Typography className="text-lg font-semibold">
            🔒 Access Restricted
          </Typography>
          <Typography className="text-gray-600 text-sm">
            You don't have permission to view Schedule.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[420px] w-full overflow-hidden flex flex-col">
      <CardContent className="flex flex-col h-full">
        {/* HEADER */}
        <Box className="flex flex-wrap items-center gap-2 mb-3">
          <Typography className="text-xl font-semibold text-gray-800">
            Schedule Activity
          </Typography>

          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <Select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value as "day" | "week" | "overdue")
              }
              size="small"
              className="min-w-[120px]"
            >
              <MenuItem value="day">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>

            <a
              href="/dashboard/leads"
              className="text-[#0792fa] text-sm font-medium hover:underline ml-auto"
            >
              View All
            </a>
          </div>
        </Box>

        <Box className="flex-1 flex flex-col">
          {/* LOADING */}
          {scheduleLoading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width="100%"
                  height={70}
                  className="rounded-lg"
                />
              ))}
            </div>
          )}

          {/* DATA */}
          {!scheduleLoading && scheduleAnalytics?.success && (
            <>
              {/* SUMMARY */}
              <div className="flex gap-2 mb-2">
                <div
                  onClick={() => setFilter("day")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer
                  ${
                    filter === "day"
                      ? "bg-blue-100 text-blue-700 border border-blue-500"
                      : "border border-gray-300 text-blue-600"
                  }`}
                >
                  {scheduleAnalytics.summary?.todayCount || 0} Today
                </div>

                <div
                  onClick={() => setFilter("week")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer
                  ${
                    filter === "week"
                      ? "bg-green-100 text-green-700 border border-green-500"
                      : "border border-gray-300 text-green-600"
                  }`}
                >
                  {scheduleAnalytics.summary?.weekCount || 0} This Week
                </div>

                <div
                  onClick={() => setFilter("overdue")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer
                  ${
                    filter === "overdue"
                      ? "bg-red-100 text-red-700 border border-red-500"
                      : "border border-gray-300 text-red-600"
                  }`}
                >
                  {scheduleAnalytics.summary?.overdueCount || 0} Overdue
                </div>
              </div>

              {/* LIST */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-0">
                {filteredLeads.length > 0 ? (
                  paginatedLeads.map((item: any) => {
                    const title =
                      item.followUpTitle ||
                      `${item.followUpType || "Follow up"} with ${
                        item.lead?.fullName || "Lead"
                      }`;

                    const dateLabel = getDateLabel(item.followUpDate);

                    const type = item.followUpType || "task";

                    return (
                      <div
                        key={item?._id || item?.id}
                        onClick={() => handleCardClick(item)}
                        className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                      >
                        {/* LEFT */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-full
                            ${
                              type === "call"
                                ? "bg-blue-100 text-blue-600"
                                : type === "visit"
                                  ? "bg-green-100 text-green-600"
                                  : type === "meeting"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {type?.toLowerCase().includes("call") ? (
                              <CallIcon fontSize="small" />
                            ) : type?.toLowerCase().includes("visit") ? (
                              <HomeIcon fontSize="small" />
                            ) : type?.toLowerCase().includes("meeting") ? (
                              <EventIcon fontSize="small" />
                            ) : type?.toLowerCase().includes("proposal") ? (
                              <DescriptionIcon fontSize="small" />
                            ) : (
                              <TaskAltIcon fontSize="small" />
                            )}
                          </div>

                          <div>
                            <Typography className="font-semibold text-black !text-[14px]">
                              {title}
                            </Typography>

                            <Typography className="text-gray-500 !text-[12px]">
                              {dateLabel} • {item.followUpTime || "--"}
                            </Typography>
                          </div>
                        </div>

                        {/* RIGHT MENU */}
                        <div className="text-gray-400 text-lg cursor-pointer">
                          ⋯
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    📅 No activities for this {filter}
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              <div className=" pb-1  mt-1.5 flex justify-center shrink-0">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  size="small"
                  color="primary"
                />
              </div>
            </>
          )}

          {!scheduleLoading &&
            (!scheduleAnalytics || !scheduleAnalytics.success) && (
              <div className="text-red-600 text-center py-6 text-sm">
                Failed to load schedule data
              </div>
            )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
