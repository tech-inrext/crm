import React from "react";
import {
  EditIcon,
  IconButton,
} from "@/components/ui/Component";
import { USERS_PERMISSION_MODULE } from "@/fe/pages/user/constants/users";
import type { UserCardProps } from "@/fe/pages/user/types";
import { cardStyles } from "./styles";
import { getContactInfo, getOrgInfo } from "@/fe/pages/user/utils";
import { PermissionGuard } from "@/components/ui";

const lightIconMap: Record<string, string> = {
  email: "bg-blue-50 text-blue-600 border border-blue-100",
  phone: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  manager: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  dept: "bg-purple-50 text-purple-600 border border-purple-100",
};

const UserCard: React.FC<UserCardProps & { managers?: any[]; departments?: any[] }> = ({ 
  user, 
  onEdit, 
  onView,
  managers = [],
  departments = []
}) => {
  const [imgError, setImgError] = React.useState(false);
  const managerName = user.managerName || managers.find(m => m._id === user.managerId)?.name || "N/A";
  const departmentName = user.departmentName || departments.find(d => d._id === user.departmentId)?.name || "N/A";

  const initial = user.name?.[0]?.toUpperCase() ?? "?";
  const profileImage = user.avatarUrl || user.photo;
  const showPhoto = Boolean(profileImage && !imgError);
  const contactInfo = getContactInfo(user);
  const orgInfo = getOrgInfo({ managerName, departmentName });

  const allItems = [...contactInfo, ...orgInfo];

  return (
    <div 
      className={cardStyles.container}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView?.();
        }
      }}
    >
      <div className={cardStyles.accentBanner} />
      
      <div className={cardStyles.header}>
        <div className={cardStyles.profileInfo}>
          <div className={cardStyles.avatarWrapper}>
            {showPhoto ? (
              <img 
                src={profileImage} 
                alt={user.name} 
                className={cardStyles.avatarImage} 
                onError={() => setImgError(true)}
              />
            ) : (
              <div className={cardStyles.avatarPlaceholder}>{initial}</div>
            )}
          </div>

          <div className={cardStyles.nameSection}>
            <h3 className={cardStyles.nameTitle} title={user.name}>{user.name}</h3>
            <span className={cardStyles.designationTag} title={user.designation}>
              {user.designation || "No Designation"}
            </span>
          </div>
        </div>
      </div>

      <div className={cardStyles.metadataSection}>
        {allItems.map(({ icon: Icon, label, value, key }) => (
          <div key={key} className={cardStyles.metadataItem}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 shadow-2xs ${
              lightIconMap[key] || "bg-slate-100 text-slate-600 border border-slate-200"
            }`}>
              <Icon style={{ fontSize: "0.85rem" }} />
            </div>
            <span className={cardStyles.metadataValue} title={key === "manager" || key === "dept" ? `${label} ${value}` : value}>
              {key === "manager" || key === "dept" ? (
                <>
                  <span className="text-gray-400 font-normal mr-1">{label}</span>
                  <span>{value}</span>
                </>
              ) : (
                <span>{value}</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {onEdit && (
        <div 
          className="absolute bottom-4 right-4 z-10" 
          onClick={(e) => e.stopPropagation()}
        >
          <PermissionGuard module={USERS_PERMISSION_MODULE} action="write" fallback={null}>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }} 
              className={cardStyles.actionButtonEdit} 
              size="small" 
              aria-label="edit user"
            >
              <EditIcon style={{ fontSize: "1.05rem" }} />
            </IconButton>
          </PermissionGuard>
        </div>
      )}
    </div>
  );
};

export default UserCard;
