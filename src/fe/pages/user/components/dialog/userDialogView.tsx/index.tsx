"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@/components/ui/Component";
import { Close } from "@mui/icons-material";
import useUserDetails from "@/fe/pages/user/hooks/useUserDetails";
import { formatDate, formatRoleDisplayName } from "@/fe/pages/user/utils";
import { dialogHeader, userHeaderCard, layout, dialogProps } from "./styles";
import {
  getContactPersonalFields,
  getOrganizationFields,
} from "@/fe/pages/user/constants/userDialogView";

const UserDetailsDialog = ({ user, open, onClose }: any) => {
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      BackdropProps={dialogProps.backdrop}
      PaperProps={dialogProps.paper}
    >
      <DialogTitle>
        <IconButton
          onClick={onClose}
          className={dialogHeader.closeBtn}
          size="small"
        >
          <Close className="text-lg" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="p-0 bg-white">
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
                  {contactPersonalFields
                    .filter((field) => field.icon)
                    .map(
                      (field) =>
                        user[field.dataKey] && (
                          <div
                            key={field.dataKey}
                            className={userHeaderCard.metaItem}
                          >
                            <field.icon className={userHeaderCard.metaIcon} />
                            <span>{user[field.dataKey]}</span>
                          </div>
                        ),
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
                {contactPersonalFields.map((field) => (
                  <div key={field.dataKey}>
                    <strong>{field.label}:</strong>{" "}
                    {field.isDate
                      ? formatDate(user[field.dataKey])
                      : field.isCustom
                        ? field.customValue
                        : user[field.dataKey]}
                    {field.suffix && <span>{field.suffix}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-white">
              <h3 className="text-lg font-semibold mb-4">Organization</h3>
              <div className="space-y-3">
                {organizationFields.map((field) => (
                  <div key={field.dataKey}>
                    <strong>{field.label}:</strong>{" "}
                    {field.isDate
                      ? formatDate(user[field.dataKey])
                      : field.isCustom
                        ? field.customValue
                        : user[field.dataKey] || 0}
                    {field.suffix && <span>{field.suffix}</span>}
                  </div>
                ))}
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
