// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// import { Box, Typography } from "@mui/material";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import BeachAccessIcon from "@mui/icons-material/BeachAccess";
// import DescriptionIcon from "@mui/icons-material/Description";
// import CampaignIcon from "@mui/icons-material/Campaign";

// type StatsType = {
//   upcomingHolidays: number;
//   pastHolidays: number;
//   pendingLeaves: number;
//   pendingCampaigns: number;
// };

// export default function StatsCards() {
//   const [stats, setStats] = useState<StatsType>({
//     upcomingHolidays: 0,
//     pastHolidays: 0,
//     pendingLeaves: 0,
//     pendingCampaigns: 0, // static for now
//   });

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const [holidayRes, leaveRes] = await Promise.all([
//         axios.get("/api/v0/holiday"),
//         axios.get("/api/v0/leave"),
//       ]);

//       const holidays = holidayRes.data || [];
//       const leaves = leaveRes.data || [];

//       const today = new Date();

//       // ✅ Upcoming Holidays
//       const upcomingHolidays = holidays.filter(
//         (h: any) => new Date(h.date) >= today
//       ).length;

//       // ✅ Past Holidays
//       const pastHolidays = holidays.filter(
//         (h: any) => new Date(h.date) < today
//       ).length;

//       // ✅ Pending Leaves
//       const pendingLeaves = leaves.filter(
//         (l: any) => l.status?.toLowerCase() === "pending"
//       ).length;

//       setStats({
//         upcomingHolidays,
//         pastHolidays,
//         pendingLeaves,
//         pendingCampaigns: 8, // static (replace later if API exists)
//       });
//     } catch (err) {
//       console.error("Stats fetch failed", err);
//     }
//   };

//   const cards = [
//     {
//       icon: <CalendarMonthIcon className="text-blue-500" />,
//       value: stats.upcomingHolidays,
//       label: "Upcoming Holidays",
//       bg: "bg-blue-50",
//     },
//     {
//       icon: <BeachAccessIcon className="text-green-500" />,
//       value: stats.pendingLeaves,
//       label: "Pending Leave Requests",
//       bg: "bg-green-50",
//     },
//     {
//       icon: <DescriptionIcon className="text-indigo-500" />,
//       value: stats.pastHolidays,
//       label: "Holidays Logged (Past)",
//       bg: "bg-indigo-50",
//     },
//     {
//       icon: <CampaignIcon className="text-red-500" />,
//       value: stats.pendingCampaigns,
//       label: "Campaigns Pending Approval",
//       bg: "bg-red-50",
//     },
//   ];

//   return (
//     <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 !p-6">
//       {cards.map((item, index) => (
//         <Box
//           key={index}
//           className={`!flex items-center !gap-4 !p-6 !border border-gray-600 !rounded-xl !bg-white ${item.bg}`}
//         >
//           {/* Icon */}
//           <Box className="!text-6xl mt-1">{item.icon}</Box>

//           {/* Text */}
//           <Box>
//             <Typography className="!text-xl !font-semibold !text-gray-700">
//               {item.value}
//             </Typography>
//             <Typography className="!text-sm !text-gray-600">
//               {item.label}
//             </Typography>
//           </Box>
//         </Box>
//       ))}
//     </Box>
//   );
// }