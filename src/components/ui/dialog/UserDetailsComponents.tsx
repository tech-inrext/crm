import React from "react";
import { Box, Typography, Chip } from "@/components/ui/Component";
import {
  Person,
  Email,
  Phone,
  Home,
  Work,
  CalendarToday,
  Badge,
  SupervisorAccount,
  Business,
  AccountBalance,
  Fingerprint,
  Description,
  FamilyRestroom,
} from "@mui/icons-material";

interface DetailItemProps {
  icon: any;
  label: string;
  value: any;
  isLink?: boolean;
}

export const DetailItem: React.FC<DetailItemProps> = ({
  icon: Icon,
  label,
  value,
  isLink = false,
}) => (
  <div className="flex items-center gap-3">
    <Icon className="text-gray-500 text-xl opacity-70" />
    <div className="flex-1">
      <Typography
        variant="caption"
        className="text-gray-500 block leading-none mb-1"
      >
        {label}
      </Typography>
      {isLink ? (
        value && value !== "-" && value.trim() !== "" ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
          >
            View Document
          </a>
        ) : (
          <Typography variant="body2" className="text-gray-500 font-medium">
            N/A
          </Typography>
        )
      ) : (
        <Typography variant="body2" className="text-gray-900 font-medium">
          {value || "-"}
        </Typography>
      )}
    </div>
  </div>
);

interface SectionCardProps {
  title: string;
  icon: any;
  colorClass: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon: Icon,
  colorClass,
  children,
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className={`flex items-center gap-2 mb-6 ${colorClass}`}>
      <Icon className="text-sm" />
      <Typography
        variant="overline"
        className="font-extrabold tracking-widest text-xs"
      >
        {title}
      </Typography>
    </div>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);

interface UserHeaderProps {
  user: any;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ user }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 bg-white p-6 rounded-lg shadow-sm">
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{user.name?.substring(0, 2).toUpperCase() || <Person />}</span>
      )}
    </div>
    <div className="flex-1 w-full">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <Typography
            variant="h5"
            className="font-extrabold text-gray-900 mb-2 text-xl sm:text-2xl"
          >
            {user.name}
          </Typography>
          <div className="flex gap-2 flex-wrap items-center">
            <Chip
              label={user.designation || "No Designation"}
              size="small"
              color="primary"
              className="h-6 px-2 font-bold capitalize"
            />
            {user.isCabVendor && (
              <Chip
                label="Cab Vendor"
                size="small"
                color="warning"
                className="h-6"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
