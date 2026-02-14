import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Typography,
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
} from "@mui/icons-material";
import { format } from "date-fns";

const DetailItem = ({ icon: Icon, label, value, isLink = false }: any) => (
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
        value && value !== "-" && value.trim() ? (
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

const SectionCard = ({ title, icon: Icon, colorClass, children }: any) => (
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

import { useUserDialogData } from "@/fe/modules/user/hooks/useUserDialogData";

const UserDetailsDialog = ({ user, open, onClose }: any) => {
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const { roles } = useUserDialogData(open);

  useEffect(() => {
    if (!roles || roles.length === 0) return;
    const map: Record<string, string> = {};
    roles.forEach((r: any) => {
      const id = r._id || r.id;
      if (id) map[id] = r.name || r.label || "";
    });
    setRoleMap(map);
  }, [roles]);
  if (!user) return null;
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "PP");
    } catch (e) {
      return dateString;
    }
  };

  const hasPhoto = user.photo && user.photo.trim() !== "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-lg sm:text-xl py-5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Person className="text-3xl" />
          <span>User Details</span>
        </div>
        <IconButton
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/15"
          size="small"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            fill="currentColor"
          >
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </IconButton>
      </DialogTitle>
      <DialogContent dividers className="bg-gray-50 p-0">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
              {hasPhoto ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-full h-full object-cover object-top rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      const initials = document.createElement("span");
                      initials.textContent = user.name?.substring(0, 2).toUpperCase() || "";
                      initials.className = "text-2xl sm:text-3xl font-bold";
                      parent.appendChild(initials);
                    }
                  }}
                />
              ) : (
                <span>{user.name?.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 w-full">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard
              title="PRIVATE & CONTACT INFO"
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
                label="Whats App Number"
                value={user.altPhone}
              />
              <DetailItem icon={Person} label="Gender" value={user.gender} />
              <DetailItem icon={CalendarToday} label="Age" value={user.age} />
              <DetailItem
                icon={Person}
                label="Specialization"
                value={user.specialization}
              />
              <DetailItem
                icon={Person}
                label="Father''s Name"
                value={user.fatherName}
              />
              <DetailItem icon={Home} label="Address" value={user.address} />
            </SectionCard>
            <SectionCard
              title="ORGANIZATION"
              icon={Business}
              colorClass="text-purple-600"
            >
              <DetailItem
                icon={Work}
                label="Designation"
                value={user.designation}
              />
              <DetailItem
                icon={Description}
                label="PAN Number"
                value={user.panNumber}
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
              <div>
                <Typography
                  variant="caption"
                  className="text-gray-500 block mb-2"
                >
                  Roles
                </Typography>
                <div className="flex gap-1 flex-wrap">
                  {user.roles?.length > 0 ? (
                    user.roles.map((role: any, idx: number) => {
                      const displayName =
                        typeof role === "string"
                          ? roleMap[role] || role
                          : role.name ||
                            role.label ||
                            role._id ||
                            JSON.stringify(role);
                      return (
                        <Chip
                          key={idx}
                          label={displayName}
                          size="small"
                          variant="outlined"
                        />
                      );
                    })
                  ) : (
                    <Typography variant="body2">-</Typography>
                  )}
                </div>
              </div>
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
            </SectionCard>
            <SectionCard
              title="DOCUMENTS"
              icon={Description}
              colorClass="text-orange-600"
            >
              <DetailItem
                icon={Description}
                label="Pan Card Number"
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
              title="NOMINEE DETAILS"
              icon={FamilyRestroom}
              colorClass="text-green-600"
            >
              <DetailItem
                icon={Person}
                label="Name"
                value={user.nominee?.name}
              />
              <DetailItem
                icon={Phone}
                label="Phone"
                value={user.nominee?.phone}
              />
              <DetailItem
                icon={Work}
                label="Occupation"
                value={user.nominee?.occupation}
              />
              <DetailItem
                icon={FamilyRestroom}
                label="Relation"
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
