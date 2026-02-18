import React from "react";
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
  const [filter, setFilter] = React.useState<"day" | "week" | "overdue">(
    "week",
  );
  const [page, setPage] = React.useState(1);
  const [leadsPerPage, setLeadsPerPage] = React.useState(2);

  if (analyticsAccess.showScheduleThisWeek) {
    // ✅ Use backend grouped data
    const filteredLeads =
      filter === "day"
        ? scheduleAnalytics?.data?.today || []
        : filter === "week"
          ? scheduleAnalytics?.data?.week || []
          : scheduleAnalytics?.data?.overdue || [];

    const totalPages = Math.max(
      1,
      Math.ceil(filteredLeads.length / leadsPerPage),
    );

    const paginatedLeads = filteredLeads.slice(
      (page - 1) * leadsPerPage,
      page * leadsPerPage,
    );

    React.useEffect(() => {
      setPage(1);
    }, [filter, scheduleAnalytics, leadsPerPage]);

    const handleChangePage = (_: any, value: number) => {
      setPage(value);
    };

    const handleChangeRowsPerPage = (
      event: React.ChangeEvent<{ value: unknown }>,
    ) => {
      setLeadsPerPage(Number(event.target.value));
      setPage(1);
    };

    return (
      <Card
        sx={{
          minHeight: 400,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          width: { xs: "100%", md: "175%" },
          mr: { xs: 0, md: 1 },
        }}
      >
        <CardContent>
          {/* Header */}
          <Box
            display="flex"
            gap={1}
            alignItems="center"
            mb={2.25}
            flexWrap={{ xs: "wrap", sm: "wrap", md: "nowrap" }}
          >
            <Typography
              sx={{
                fontSize: "1.35rem",
                fontWeight: 600,
                color: "#222",
                mb: { xs: 1, sm: 1, md: 0 },
              }}
            >
              Schedule In this
            </Typography>

            <Box
              display="flex"
              alignItems="center"
              gap={1}
              flex={1}
              minWidth={0}
              sx={{ flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap" } }}
            >
              <Select
                value={filter === "overdue" ? "week" : filter}
                onChange={(e) => setFilter(e.target.value as "day" | "week")}
                size="small"
                sx={{ minWidth: 140, width: "auto", maxWidth: "100%" }}
                displayEmpty
              >
                <MenuItem value="day">Day Wise</MenuItem>
                <MenuItem value="week">Week Wise</MenuItem>
              </Select>

              <a
                href="/dashboard/leads"
                className="text-[#0792fa] font-medium text-base no-underline hover:underline"
                style={{
                  marginLeft: 0,
                  whiteSpace: "nowrap",
                  ...(typeof window !== "undefined" && window.innerWidth >= 900
                    ? { marginLeft: "10rem" }
                    : {}),
                }}
              >
                View All
              </a>
            </Box>
          </Box>

          <Box>
            {/* Loading */}
            {scheduleLoading && (
              <Box sx={{ py: 2.5 }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={40}
                  sx={{ mb: 2, borderRadius: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={32}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={24}
                  sx={{ mb: 1 }}
                />
                {[...Array(2)].map((_, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={60}
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {/* Success */}
            {!scheduleLoading && scheduleAnalytics?.success && (
              <Box>
                {/* Summary */}
                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                  {/* Today/Week Count */}
                  {/* Scheduled Clickable */}
                  <Box
                    onClick={() => setFilter(filter === "day" ? "day" : "week")}
                    sx={{
                      background: "#e3f2fd",
                      px: 3,
                      py: 2,
                      borderRadius: 2,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#1976d2",
                      cursor: "pointer",
                      border:
                        filter !== "overdue" ? "2px solid #1976d2" : "none",
                    }}
                  >
                    {filter === "day"
                      ? scheduleAnalytics.summary?.todayCount
                      : scheduleAnalytics.summary?.weekCount}{" "}
                    scheduled
                  </Box>

                  {/* Overdue Clickable */}
                  <Box
                    onClick={() => setFilter("overdue")}
                    sx={{
                      background: "#ffebee",
                      px: 3,
                      py: 2,
                      borderRadius: 2,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#d32f2f",
                      cursor: "pointer",
                      border:
                        filter === "overdue" ? "2px solid #d32f2f" : "none",
                    }}
                  >
                    {scheduleAnalytics.summary?.overdueCount || 0} overdue
                  </Box>
                </Box>

                {/* Leads List */}
                <Box
                  sx={{
                    position: "relative",
                    height: 280,
                    maxHeight: 280,
                    overflowY: "auto",
                    pb: 7,
                  }}
                >
                  {filteredLeads.length > 0 ? (
                    paginatedLeads.map((item: any) => {
                      const followUpDate = new Date(item.followUpDate);

                      const isToday =
                        followUpDate.toDateString() ===
                        new Date().toDateString();

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
                        <Box
                          key={item.id}
                          display="flex"
                          alignItems="center"
                          p={1.5}
                          mb={1}
                          sx={{
                            background:
                              filter === "overdue"
                                ? "#fff5f5"
                                : isToday
                                  ? "#fff3e0"
                                  : "#f8f9fa",
                            borderRadius: 2,
                            border:
                              filter === "overdue"
                                ? "1px solid #f5c2c7"
                                : isToday
                                  ? "1px solid #ffcc02"
                                  : "1px solid #e9ecef",
                            cursor: "pointer",
                          }}
                        >
                          <Box flex={1}>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "#222",
                                fontSize: "0.95rem",
                                mb: 0.25,
                              }}
                            >
                              {item.lead?.fullName || "Unknown"}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: "0.8rem",
                                color: "#666",
                                mb: 0.5,
                              }}
                            >
                              {item.lead?.phone} •{" "}
                              {item.lead?.source || "No source"}
                            </Typography>

                            <Typography
                              sx={{ fontSize: "0.75rem", color: "#888" }}
                            >
                              {item.lead?.assignedTo
                                ? `Assigned to: ${item.lead.assignedTo.name}`
                                : "Unassigned"}
                            </Typography>
                          </Box>

                          <Box textAlign="right" minWidth={80}>
                            <Typography
                              sx={{
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "#666",
                                mb: 0.25,
                              }}
                            >
                              {dateLabel}
                            </Typography>

                            <Typography
                              sx={{ fontSize: "0.75rem", color: "#888" }}
                            >
                              {item.followUpTime}
                            </Typography>

                            <div
                              className="text-[0.7rem] px-2 py-1 rounded mt-2"
                              style={{
                                background:
                                  item.lead?.status === "New"
                                    ? "#e3f2fd"
                                    : item.lead?.status === "Contacted"
                                      ? "#e8f5e9"
                                      : item.lead?.status === "Site Visit"
                                        ? "#fff3e0"
                                        : "#f3e5f5",
                                color:
                                  item.lead?.status === "New"
                                    ? "#1976d2"
                                    : item.lead?.status === "Contacted"
                                      ? "#388e3c"
                                      : item.lead?.status === "Site Visit"
                                        ? "#f57c00"
                                        : "#7b1fa2",
                              }}
                            >
                              {item.lead?.status}
                            </div>
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Box sx={{ color: "#666", textAlign: "center", py: 5 }}>
                      📅 No follow-ups scheduled for this{" "}
                      {filter === "day"
                        ? "day"
                        : filter === "week"
                          ? "week"
                          : "overdue"}
                    </Box>
                  )}

                  {/* Pagination */}
                  <Box className="flex items-center justify-center gap-5 absolute left-0 right-0 bottom-0 bg-white border-t border-[#eee] py-3 z-[2]">
                    <Typography className="text-[#666] text-[0.95rem]">
                      Page
                    </Typography>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handleChangePage}
                      color="primary"
                      size="small"
                    />
                    <Typography className="text-[#666] text-[0.95rem]">
                      Rows:
                    </Typography>
                    <Select
                      value={leadsPerPage}
                      onChange={handleChangeRowsPerPage}
                      size="small"
                    >
                      <MenuItem value={2}>2</MenuItem>
                    </Select>
                  </Box>
                </Box>
              </Box>
            )}

            {!scheduleLoading &&
              (!scheduleAnalytics || !scheduleAnalytics.success) && (
                <Box sx={{ color: "#d32f2f", textAlign: "center", py: 2.5 }}>
                  Failed to load schedule data
                </Box>
              )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        minHeight: 320,
        height: "95%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "175%",
        mr: 1,
      }}
    >
      <CardContent sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
          🔒 Access Restricted
        </Typography>
        <Typography>
          You don't have permission to view Schedule This Week.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;
