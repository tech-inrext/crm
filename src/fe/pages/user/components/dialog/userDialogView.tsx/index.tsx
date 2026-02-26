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
import {
  detailItem,
  sectionCard,
  sectionColorMap,
  dialogHeader,
  userHeaderCard,
  rolesBadge,
  layout,
  type SectionColor,
} from "./styles";

// ─── DetailItem ───────────────────────────────────────────────────────────────

const DetailItem = ({ icon: Icon, label, value, isLink = false }: any) => (
  <div className={detailItem.row}>
    <div className={detailItem.iconWrap}>
      <Icon className={detailItem.iconEl} />
    </div>
    <div className={detailItem.body}>
      <div className={detailItem.label}>{label}</div>
      {isLink ? (
        value && value !== "-" && value.trim() ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className={detailItem.linkAnchor}>
            View Document
            <svg className={detailItem.linkArrow} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ) : (
          <div className={detailItem.empty}>Not Available</div>
        )
      ) : (
        <div className={detailItem.value}>{value || "-"}</div>
      )}
    </div>
  </div>
);

// ─── SectionCard ──────────────────────────────────────────────────────────────

const SectionCard = ({ title, icon: Icon, colorClass, children }: any) => {
  const colors = sectionColorMap[colorClass as SectionColor] ?? sectionColorMap["text-blue-600"];

  return (
    <div className={sectionCard.wrapper}>
      <div className={`bg-gradient-to-r ${colors.bg} px-5 py-4 border-b ${colors.border}`}>
        <div className="flex items-center gap-3">
          <div className={sectionCard.headerIconWrap(colors.icon)}>
            <Icon className={sectionCard.headerIcon} />
          </div>
          <h3 className={sectionCard.headerTitle(colors.text)}>{title}</h3>
        </div>
      </div>
      <div className={sectionCard.body}>
        <div className={sectionCard.bodyInner}>{children}</div>
      </div>
    </div>
  );
};

// ─── UserDetailsDialog ────────────────────────────────────────────────────────

const UserDetailsDialog = ({ user, open, onClose }: any) => {
  const { roleMap, imageError, setImageError, hasPhoto } = useUserDetails(open, user);

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle className="p-0">
        <div className={dialogHeader.banner}>
          <div className={dialogHeader.overlay} />
          <div className={dialogHeader.inner}>
            <div className={dialogHeader.titleRow}>
              <div className={dialogHeader.iconWrap}>
                <Person className="text-white text-xl" />
              </div>
              <div>
                <h1 className={dialogHeader.title}>User Profile</h1>
                <p className={dialogHeader.subtitle}>View complete information</p>
              </div>
            </div>
            <IconButton onClick={onClose} className={dialogHeader.closeBtn} size="small">
              <Close className="text-lg" />
            </IconButton>
          </div>
        </div>
      </DialogTitle>

      <DialogContent className="p-0 bg-gray-50">
        <div className={layout.content}>
          {/* User Header Card */}
          <div className={userHeaderCard.wrapper}>
            <div className={userHeaderCard.row}>
              <div className={userHeaderCard.avatarWrap}>
                <div className={userHeaderCard.avatar}>
                  {hasPhoto ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      className={userHeaderCard.photo}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span>{user.name?.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className={userHeaderCard.info}>
                <h2 className={userHeaderCard.name}>{user.name}</h2>
                <div className={userHeaderCard.designation}>{user.designation || "No Designation"}</div>
                <div className={userHeaderCard.metaRow}>
                  {user.email && (
                    <div className={userHeaderCard.metaItem}>
                      <Email className={userHeaderCard.metaIcon} />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className={userHeaderCard.metaItem}>
                      <Phone className={userHeaderCard.metaIcon} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className={layout.grid}>
            <SectionCard title="Contact & Personal" icon={Badge} colorClass="text-blue-600">
              <DetailItem icon={Email} label="Email Address" value={user.email} />
              <DetailItem icon={Phone} label="Phone Number" value={user.phone} />
              <DetailItem icon={Phone} label="WhatsApp Number" value={user.altPhone} />
              <DetailItem icon={Person} label="Gender" value={user.gender} />
              <DetailItem icon={CalendarToday} label="Date of Birth" value={formatDate(user.dateOfBirth)} />
              <DetailItem icon={Person} label="Specialization" value={user.specialization} />
              <DetailItem icon={Person} label="Father's Name" value={user.fatherName} />
              <DetailItem icon={Home} label="Address" value={user.address} />
            </SectionCard>

            <SectionCard title="Organization" icon={Business} colorClass="text-purple-600">
              <DetailItem icon={Work} label="Designation" value={user.designation} />
              <DetailItem icon={CalendarToday} label="Joining Date" value={formatDate(user.joiningDate)} />
              <DetailItem icon={Business} label="Department" value={user.departmentId?.name || "N/A"} />
              <DetailItem icon={SupervisorAccount} label="Manager" value={user.managerId?.name || "N/A"} />
              <DetailItem icon={AccountBalance} label="Branch" value={user.branch} />
              <DetailItem icon={AccountBalance} label="Slab Percentage" value={`${user.slabPercentage || 0}%`} />

              {/* Roles */}
              <div className={rolesBadge.wrapper}>
                <div className={rolesBadge.label}>Assigned Roles</div>
                <div className={rolesBadge.list}>
                  {user.roles?.length > 0 ? (
                    user.roles.map((role: any, idx: number) => (
                      <span key={idx} className={rolesBadge.badge}>
                        {formatRoleDisplayName(role, roleMap)}
                      </span>
                    ))
                  ) : (
                    <span className={rolesBadge.empty}>No roles assigned</span>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
