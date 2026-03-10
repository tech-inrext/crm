"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@/components/ui/Component";
import { Email, Phone, Close } from "@mui/icons-material";
import useUserDetails from "@/fe/pages/user/hooks/useUserDetails";
import { formatDate, formatRoleDisplayName } from "@/fe/pages/user/utils";
import { dialogHeader, userHeaderCard, layout } from "./styles";

const UserDetailsDialog = ({ user, open, onClose }: any) => {
  const {
    roleMap,
    imageError,
    setImageError,
    hasPhoto,
    managerName,
    departmentName,
  } = useUserDetails(open, user);

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>
        <IconButton
          onClick={onClose}
          className={dialogHeader.closeBtn}
          size="small"
        >
          <Close className="text-lg" />
        </IconButton>
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
                <div className={userHeaderCard.designation}>
                  {user.designation || "No Designation"}
                </div>
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
            <div className="border rounded-lg p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4">Contact & Personal</h3>
              <div className="space-y-3">
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Phone:</strong> {user.phone}
                </div>
                <div>
                  <strong>WhatsApp:</strong> {user.altPhone}
                </div>
                <div>
                  <strong>Gender:</strong> {user.gender}
                </div>
                <div>
                  <strong>Date of Birth:</strong> {formatDate(user.dateOfBirth)}
                </div>
                <div>
                  <strong>Specialization:</strong> {user.specialization}
                </div>
                <div>
                  <strong>Father's Name:</strong> {user.fatherName}
                </div>
                <div>
                  <strong>Address:</strong> {user.address}
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4">Organization</h3>
              <div className="space-y-3">
                <div>
                  <strong>Designation:</strong> {user.designation}
                </div>
                <div>
                  <strong>Joining Date:</strong> {formatDate(user.joiningDate)}
                </div>
                <div>
                  <strong>Department:</strong> {departmentName}
                </div>
                <div>
                  <strong>Manager:</strong> {managerName}
                </div>
                <div>
                  <strong>Branch:</strong> {user.branch}
                </div>
                <div>
                  <strong>Slab Percentage:</strong> {user.slabPercentage || 0}%
                </div>
                <div>
                  <strong>Assigned Roles:</strong>
                  <div className="mt-2">
                    {user.roles?.length > 0 ? (
                      user.roles.map((role: any, idx: number) => (
                        <span
                          key={idx}
                          className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2"
                        >
                          {formatRoleDisplayName(role, roleMap)}
                        </span>
                      ))
                    ) : (
                      <span>No roles assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
