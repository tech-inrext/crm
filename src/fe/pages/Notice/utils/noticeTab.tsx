import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import WifiIcon from "@mui/icons-material/Wifi";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LockIcon from "@mui/icons-material/Lock";

export const NOTICE_TABS = [
  { label: "All Notices", icon: <NotificationsNoneIcon />, value: "" },
  { label: "General", icon: <FolderOpenIcon />, value: "general" },
  { label: "Project Updates", icon: <WifiIcon />, value: "project" },
  { label: "Pricing / Offers", icon: <LocalOfferIcon />, value: "pricing" },
  { label: "Sales Targets", icon: <TrendingUpIcon />, value: "sales" },
  {
    label: "Urgent Alerts",
    icon: <WarningAmberIcon color="error" />,
    value: "urgent",
  },
  { label: "HR / Internal", icon: <LockIcon />, value: "hr" },
];

export const CATEGORY_MAP: Record<string, string> = {
  general: "General Announcements",
  project: "Project Updates",
  pricing: "Pricing / Offers",
  sales: "Sales Targets",
  urgent: "Urgent Alerts",
  hr: "HR / Internal",
};

export const REVERSE_CATEGORY_MAP: Record<string, number> = {
  "General Announcements": 1,
  "Project Updates": 2,
  "Pricing / Offers": 3,
  "Sales Targets": 4,
  "Urgent Alerts": 5,
  "HR / Internal": 6,
};
