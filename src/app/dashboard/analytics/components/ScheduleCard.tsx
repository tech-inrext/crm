import React, { useEffect, useMemo, useState } from "react";
import Skeleton from "@/components/ui/Component/Skeleton";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Card from "@/components/ui/Component/Card";
import CardContent from "@/components/ui/Component/CardContent";
import Box from "@/components/ui/Component/Box";
import Typography from "@/components/ui/Component/Typography";

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
  const [filter, setFilter] = useState<"day" | "week" | "overdue">("week");
  const [page, setPage] = useState(1);

  const leadsPerPage = 2; // ✅ Fixed 2 items per page

  /* RESET PAGE WHEN DATA CHANGES */
  useEffect(() => {
    setPage(1);
  }, [filter, scheduleAnalytics]);

  /* FILTERED DATA */
  const filteredLeads = useMemo(() => {
    if (!scheduleAnalytics?.data) return [];

    switch (filter) {
      case "day":
        return scheduleAnalytics.data.today || [];
      case "week":
        return scheduleAnalytics.data.week || [];
      case "overdue":
        return scheduleAnalytics.data.overdue || [];
      default:
        return [];
    }
  }, [filter, scheduleAnalytics]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / leadsPerPage),
  );

  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice((page - 1) * leadsPerPage, page * leadsPerPage);
  }, [filteredLeads, page]);

  /* ACCESS CONTROL */
  if (!analyticsAccess.showScheduleThisWeek) {
    return (
      <Card>
        <CardContent className="text-center space-y-2 py-6">
          <Typography className="text-lg font-semibold">
            🔒 Access Restricted
          </Typography>
          <Typography className="text-gray-600 text-sm">
            You don't have permission to view Schedule This Week.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[400px] h-full flex flex-col w-full md:w-[180%] overflow-hidden">
      <CardContent className="flex flex-col h-full">
        {/* HEADER */}
        <Box className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-4">
          <Typography className="text-xl font-semibold text-gray-800">
            Schedule In This
          </Typography>

          <div className="flex items-center gap-2 flex-1 flex-wrap md:flex-nowrap">
            <Select
              value={filter === "overdue" ? "week" : filter}
              onChange={(e) => setFilter(e.target.value as "day" | "week")}
              size="small"
              className="min-w-[100px]"
            >
              <MenuItem value="day">Day Wise</MenuItem>
              <MenuItem value="week">Week Wise</MenuItem>
            </Select>

            <a
              href="/dashboard/leads"
              className="text-[#0792fa] text-sm font-medium hover:underline whitespace-nowrap md:ml-auto"
            >
              View All
            </a>
          </div>
        </Box>

        {/* BODY */}
        <Box className="flex-1 flex flex-col">
          {/* LOADING */}
          {scheduleLoading && (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width="100%"
                  height={60}
                  className="rounded-lg"
                />
              ))}
            </div>
          )}

          {/* SUCCESS */}
          {!scheduleLoading && scheduleAnalytics?.success && (
            <>
              {/* SUMMARY */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div
                  onClick={() => setFilter(filter === "day" ? "day" : "week")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
                    filter !== "overdue"
                      ? "bg-blue-100 text-blue-700 border border-blue-600"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {filter === "day"
                    ? scheduleAnalytics.summary?.todayCount
                    : scheduleAnalytics.summary?.weekCount}{" "}
                  scheduled
                </div>

                <div
                  onClick={() => setFilter("overdue")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
                    filter === "overdue"
                      ? "bg-red-100 text-red-600 border border-red-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {scheduleAnalytics.summary?.overdueCount || 0} overdue
                </div>
              </div>

              {/* LEADS LIST */}
              <div className="flex-1 space-y-2">
                {filteredLeads.length > 0 ? (
                  paginatedLeads.map((item: any) => {
                    const followUpDate = new Date(item.followUpDate);

                    const isToday =
                      followUpDate.toDateString() === new Date().toDateString();

                    const isTomorrow =
                      followUpDate.toDateString() ===
                      new Date(Date.now() + 86400000).toDateString();

                    let dateLabel = followUpDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    });

                    if (isToday) dateLabel = "Today";
                    else if (isTomorrow) dateLabel = "Tomorrow";

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                          filter === "overdue"
                            ? "bg-red-50 border-red-200"
                            : isToday
                              ? "bg-orange-50 border-orange-200"
                              : "bg-gray-50 border-gray-200"
                        } hover:shadow-sm`}
                      >
                        {/* LEFT */}
                        <div>
                          <Typography className="font-semibold text-gray-800 text-xs">
                            {item.lead?.fullName || "Unknown"}
                          </Typography>

                          <Typography className="text-[11px] text-gray-500">
                            {item.lead?.phone} •{" "}
                            {item.lead?.source || "No source"}
                          </Typography>

                          <Typography className="text-[11px] text-gray-400">
                            {item.lead?.assignedTo
                              ? `Assigned to: ${item.lead.assignedTo.name}`
                              : "Unassigned"}
                          </Typography>
                        </div>

                        {/* RIGHT */}
                        <div className="text-right min-w-[80px]">
                          <Typography className="text-xs font-semibold text-gray-600">
                            {dateLabel}
                          </Typography>

                          <Typography className="text-[11px] text-gray-400">
                            {item.followUpTime}
                          </Typography>

                          <div className="text-[10px] px-2 py-0.5 rounded mt-1 bg-purple-100 text-purple-700 capitalize">
                            {item.followUpType && item.followUpType !== "note"
                              ? item.followUpType
                              : item.lead?.status || "N/A"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 text-sm py-10">
                    📅 No follow-ups scheduled for this {filter}
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="border-t py-2 flex items-center justify-center mt-3">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    size="small"
                  />
                </div>
              )}
            </>
          )}

          {/* ERROR */}
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
