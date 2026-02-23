"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@/components/ui/Component";
import {
  Person,
  Email,
  Phone,
  Home,
  CalendarToday,
  Badge,
  SupervisorAccount,
  Business,
  AccountBalance,
  Fingerprint,
  Description,
  FamilyRestroom,
  Work,
  Close,
} from "@mui/icons-material";
import useUserDetails from "@/fe/pages/user/hooks/useUserDetails";
import { formatDate, formatRoleDisplayName } from "@/fe/pages/user/utils";

const DetailItem = ({ icon: Icon, label, value, isLink = false }: any) => (
  <div className="group flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-blue-50/70 transition-all duration-200 border border-transparent hover:border-blue-100">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
      <Icon className="text-sm" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </div>
      {isLink ? (
        value && value !== "-" && value.trim() ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 group"
          >
            View Document
            <svg
              className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ) : (
          <div className="text-sm text-gray-400 font-medium">Not Available</div>
        )
      ) : (
        <div className="text-sm text-gray-800 font-medium break-words">
          {value || "-"}
        </div>
      )}
    </div>
  </div>
);

const SectionCard = ({ title, icon: Icon, colorClass, children }: any) => {
  const colorMap: Record<
    string,
    { bg: string; border: string; icon: string; text: string }
  > = {
    "text-blue-600": {
      bg: "from-blue-50 to-blue-100/50",
      border: "border-blue-200",
      icon: "from-blue-500 to-blue-600",
      text: "text-blue-700",
    },
    "text-purple-600": {
      bg: "from-purple-50 to-purple-100/50",
      border: "border-purple-200",
      icon: "from-purple-500 to-purple-600",
      text: "text-purple-700",
    },
    "text-orange-600": {
      bg: "from-orange-50 to-orange-100/50",
      border: "border-orange-200",
      icon: "from-orange-500 to-orange-600",
      text: "text-orange-700",
    },
    "text-green-600": {
      bg: "from-green-50 to-green-100/50",
      border: "border-green-200",
      icon: "from-green-500 to-green-600",
      text: "text-green-700",
    },
  };

  const colors = colorMap[colorClass] || colorMap["text-blue-600"];

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
      <div
        className={`bg-gradient-to-r ${colors.bg} px-5 py-4 border-b ${colors.border}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.icon} flex items-center justify-center text-white shadow-sm`}
          >
            <Icon className="text-sm" />
          </div>
          <h3
            className={`font-semibold text-sm uppercase tracking-wide ${colors.text}`}
          >
            {title}
          </h3>
        </div>
      </div>
      <div className="p-5">
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
};

const UserDetailsDialog = ({ user, open, onClose }: any) => {
  const { roleMap, imageError, setImageError, hasPhoto } = useUserDetails(
    open,
    user,
  );

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle className="p-0">
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 opacity-20"></div>
          <div className="relative z-10 flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Person className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">User Profile</h1>
                <p className="text-blue-200 text-sm opacity-90">
                  View complete information
                </p>
              </div>
            </div>
            <IconButton
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
              size="small"
            >
              <Close className="text-lg" />
            </IconButton>
          </div>
        </div>
      </DialogTitle>
      <DialogContent className="p-0 bg-gray-50">
        <div className="p-6">
          {/* User Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  {hasPhoto ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span>{user.name?.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.name}
                </h2>
                <div className="text-sm text-gray-600 mb-2">
                  {user.designation || "No Designation"}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {user.email && (
                    <div className="flex items-center gap-1.5">
                      <Email className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="Contact & Personal"
              icon={Badge}
              colorClass="text-blue-600"
            >
              <DetailItem
                icon={Email}
                label="Email Address"
                value={user.email}
              />
              <DetailItem
                icon={Phone}
                label="Phone Number"
                value={user.phone}
              />
              <DetailItem
                icon={Phone}
                label="WhatsApp Number"
                value={user.altPhone}
              />
              <DetailItem icon={Person} label="Gender" value={user.gender} />
              <DetailItem
                icon={CalendarToday}
                label="Date of Birth"
                value={formatDate(user.dateOfBirth)}
              />
              <DetailItem
                icon={Person}
                label="Specialization"
                value={user.specialization}
              />
              <DetailItem
                icon={Person}
                label="Father's Name"
                value={user.fatherName}
              />
              <DetailItem icon={Home} label="Address" value={user.address} />
            </SectionCard>

            <SectionCard
              title="Organization"
              icon={Business}
              colorClass="text-purple-600"
            >
              <DetailItem
                icon={Work}
                label="Designation"
                value={user.designation}
              />
              <DetailItem
                icon={CalendarToday}
                label="Joining Date"
                value={formatDate(user.joiningDate)}
              />
              <DetailItem
                icon={Business}
                label="Department"
                value={user.departmentId?.name || "N/A"}
              />
              <DetailItem
                icon={SupervisorAccount}
                label="Manager"
                value={user.managerId?.name || "N/A"}
              />
              <DetailItem
                icon={AccountBalance}
                label="Branch"
                value={user.branch}
              />
              <DetailItem
                icon={AccountBalance}
                label="Slab Percentage"
                value={`${user.slabPercentage || 0}%`}
              />

              {/* Roles Section */}
              <div className="p-3 rounded-lg bg-gray-50/50 border border-gray-100">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Assigned Roles
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.roles?.length > 0 ? (
                    user.roles.map((role: any, idx: number) => {
                      const displayName = formatRoleDisplayName(role, roleMap);
                      return (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200"
                        >
                          {displayName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-400">
                      No roles assigned
                    </span>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Documents"
              icon={Description}
              colorClass="text-orange-600"
            >
              <DetailItem
                icon={Description}
                label="PAN Number"
                value={user.panNumber}
              />
              <DetailItem
                icon={Fingerprint}
                label="Aadhar Card"
                value={user.aadharUrl}
                isLink
              />
              <DetailItem
                icon={Description}
                label="PAN Card"
                value={user.panUrl}
                isLink
              />
              <DetailItem
                icon={AccountBalance}
                label="Bank Proof"
                value={user.bankProofUrl}
                isLink
              />
              <DetailItem
                icon={Description}
                label="Signature"
                value={user.signatureUrl}
                isLink
              />
              <DetailItem
                icon={Description}
                label="Photo"
                value={user.photo}
                isLink
              />
            </SectionCard>

            <SectionCard
              title="Emergency Contact"
              icon={FamilyRestroom}
              colorClass="text-green-600"
            >
              <DetailItem
                icon={Person}
                label="Nominee Name"
                value={user.nominee?.name}
              />
              <DetailItem
                icon={Phone}
                label="Contact Number"
                value={user.nominee?.phone}
              />
              <DetailItem
                icon={Work}
                label="Occupation"
                value={user.nominee?.occupation}
              />
              <DetailItem
                icon={FamilyRestroom}
                label="Relationship"
                value={user.nominee?.relation}
              />
            </SectionCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
