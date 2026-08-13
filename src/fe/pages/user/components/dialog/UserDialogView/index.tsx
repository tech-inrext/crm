"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
} from "@/components/ui/Component";
import { useTheme, useMediaQuery } from "@mui/material";
import {
  Close,
  PersonOutline,
  BusinessCenter,
  Shield,
  Description,
  Email,
  Phone,
  WhatsApp,
  Visibility,
  Download,
} from "@mui/icons-material";
import useUserDetails from "@/fe/pages/user/hooks/useUserDetails";
import { formatDate, formatRoleDisplayName } from "@/fe/pages/user/utils";
import {
  iconBadgeColors,
  dialogProps,
  profileHeader,
  sectionStyles,
  infoRowStyles,
} from "./styles";
import {
  getContactPersonalFields,
  getOrganizationFields,
} from "@/fe/pages/user/constants/users";

const UserDialogView = ({ user, open, onClose }: any) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    roleMap,
    imageError,
    setImageError,
    hasPhoto,
    managerName,
    departmentName,
  } = useUserDetails(open, user);

  const contactPersonalFields = getContactPersonalFields();
  const organizationFields = getOrganizationFields(departmentName, managerName);

  if (!user) return null;

  const userPhoto = user.photo || user.avatarUrl;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      BackdropProps={dialogProps.backdrop}
      PaperProps={dialogProps.paper}
    >
      <DialogContent className="p-4 sm:p-6 bg-slate-50 flex flex-col space-y-6 h-full overflow-y-auto custom-scrollbar">
        {/* ─── Top Header Card ────────────────────────────────────────── */}
        <div className={profileHeader.container}>
          {/* Close Button Absolute Right */}
          <div className="absolute top-3.5 right-3.5 z-20">
            <IconButton
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full p-1.5 transition-all active:scale-95"
              size="small"
              aria-label="close"
            >
              <Close style={{ fontSize: "1.25rem" }} />
            </IconButton>
          </div>

          {/* User Info Bar */}
          <div className={profileHeader.mainCard}>
            <div className={profileHeader.avatarWrap}>
              {hasPhoto ? (
                <img
                  src={userPhoto}
                  alt={user.name}
                  className={profileHeader.avatarImg}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={profileHeader.avatarInitial}>
                  {user.name?.substring(0, 2).toUpperCase() || "??"}
                </div>
              )}
            </div>

            <div className={profileHeader.info}>
              <h2 className={profileHeader.name}>{user.name}</h2>
              <div className={profileHeader.tagGroup}>
                <span className={profileHeader.designationPill}>
                  {user.designation || "No Designation"}
                </span>
                {user.branch && (
                  <span className={profileHeader.branchPill}>
                    📍 {user.branch}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className={profileHeader.actionRow}>
            {user.email && (
              <a href={`mailto:${user.email}`} className={profileHeader.actionBtn}>
                <Email style={{ fontSize: "0.95rem" }} className="text-blue-600" />
                <span>{user.email}</span>
              </a>
            )}
            {user.phone && (
              <a href={`tel:${user.phone}`} className={profileHeader.actionBtn}>
                <Phone style={{ fontSize: "0.95rem" }} className="text-emerald-600" />
                <span>{user.phone}</span>
              </a>
            )}
            {user.altPhone && (
              <a
                href={`https://wa.me/${user.altPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={profileHeader.actionBtn}
              >
                <WhatsApp style={{ fontSize: "0.95rem" }} className="text-green-600" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* ─── Details Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact & Personal Information */}
            <div className={sectionStyles.card}>
              <div className={sectionStyles.titleRow}>
                <div className={`${sectionStyles.titleIcon} bg-gradient-to-br from-blue-600 to-indigo-600`}>
                  <PersonOutline style={{ fontSize: "1.15rem" }} />
                </div>
                <h3 className={sectionStyles.titleText}>Contact & Personal Details</h3>
              </div>

              <div className={sectionStyles.list}>
                {contactPersonalFields.map((field: any) => {
                  const Icon = field.icon || PersonOutline;
                  const rawVal = user[field.dataKey];
                  if (rawVal === undefined || rawVal === null || rawVal === "") return null;
                  const val = field.isDate ? formatDate(rawVal) : rawVal;

                  const badgeClass = iconBadgeColors[field.color || "blue"] || iconBadgeColors.blue;

                  return (
                    <div key={field.dataKey} className={infoRowStyles.row}>
                      <div className={infoRowStyles.leftGroup}>
                        <div className={`${infoRowStyles.iconBubble} ${badgeClass}`}>
                          <Icon style={{ fontSize: "0.95rem" }} />
                        </div>
                        <span className={infoRowStyles.label}>{field.label}</span>
                      </div>
                      <span className={infoRowStyles.value}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Organization Details */}
            <div className={sectionStyles.card}>
              <div className={sectionStyles.titleRow}>
                <div className={`${sectionStyles.titleIcon} bg-gradient-to-br from-indigo-600 to-purple-600`}>
                  <BusinessCenter style={{ fontSize: "1.15rem" }} />
                </div>
                <h3 className={sectionStyles.titleText}>Organization & Role</h3>
              </div>

              <div className={sectionStyles.list}>
                {organizationFields.map((field: any) => {
                  const Icon = field.icon || BusinessCenter;
                  const rawVal = field.isCustom ? field.customValue : user[field.dataKey];
                  if (rawVal === undefined || rawVal === null || rawVal === "") return null;
                  const displayVal = field.isDate
                    ? formatDate(rawVal)
                    : `${rawVal}${field.suffix || ""}`;

                  const badgeClass = iconBadgeColors[field.color || "indigo"] || iconBadgeColors.indigo;

                  return (
                    <div key={field.dataKey} className={infoRowStyles.row}>
                      <div className={infoRowStyles.leftGroup}>
                        <div className={`${infoRowStyles.iconBubble} ${badgeClass}`}>
                          <Icon style={{ fontSize: "0.95rem" }} />
                        </div>
                        <span className={infoRowStyles.label}>{field.label}</span>
                      </div>
                      <span className={infoRowStyles.value}>{displayVal}</span>
                    </div>
                  );
                })}
              </div>

              {/* Assigned Roles */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <Shield style={{ fontSize: "1.05rem" }} className="text-purple-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Assigned System Roles
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role: any, idx: number) => {
                      const roleName = formatRoleDisplayName(role, roleMap);
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-800 border border-purple-200/80 shadow-2xs"
                        >
                          ⚡ {roleName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs font-medium text-slate-400 italic">
                      No roles assigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Documents (If available) */}
          {(user.aadharUrl || user.panUrl || user.bankProofUrl || user.aadharBackUrl) && (
            <div className={sectionStyles.card}>
              <div className={sectionStyles.titleRow}>
                <div className={`${sectionStyles.titleIcon} bg-gradient-to-br from-amber-500 to-orange-500`}>
                  <Description style={{ fontSize: "1.15rem" }} />
                </div>
                <h3 className={sectionStyles.titleText}>Uploaded Documents</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Aadhar Front", url: user.aadharUrl },
                  { label: "Aadhar Back", url: user.aadharBackUrl },
                  { label: "PAN Card", url: user.panUrl },
                  { label: "Bank Proof", url: user.bankProofUrl },
                ]
                  .filter((doc) => Boolean(doc.url))
                  .map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-amber-200/80 hover:shadow-2xs transition-all min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border border-amber-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <Description style={{ fontSize: "1rem" }} />
                        </div>
                        <span className="text-xs font-black text-slate-900 break-words tracking-tight">
                          {doc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Document"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all active:scale-95 shadow-2xs"
                        >
                          <Visibility style={{ fontSize: "0.85rem" }} />
                          <span>View</span>
                        </a>
                        <a
                          href={doc.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download Document"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all active:scale-95 shadow-2xs"
                        >
                          <Download style={{ fontSize: "0.85rem" }} />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDialogView;
