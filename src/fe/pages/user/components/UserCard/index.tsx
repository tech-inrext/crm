import {
  Visibility,
  EditIcon,
  IconButton,
} from "@/components/ui/Component";
import { USERS_PERMISSION_MODULE } from "@/fe/pages/user/constants/users";
import type { UserCardProps } from "@/fe/pages/user/types";
import { cardStyles } from "./styles";
import { getContactInfo, getOrgInfo } from "@/fe/pages/user/utils";
import { PermissionGuard } from "@/components/ui";


const UserCard: React.FC<UserCardProps & { managers?: any[]; departments?: any[] }> = ({ 
  user, 
  onEdit, 
  onView,
  managers = [],
  departments = []
}) => {
  const managerName = user.managerName || managers.find(m => m._id === user.managerId)?.name || "N/A";
  const departmentName = user.departmentName || departments.find(d => d._id === user.departmentId)?.name || "N/A";

  const initial = user.name?.[0]?.toUpperCase() ?? "?";
  const profileImage = user.avatarUrl || user.photo;
  const contactInfo = getContactInfo(user);
  const orgInfo = getOrgInfo({ managerName, departmentName });

  return (
    <div className={cardStyles.container}>
      {/* Background Accent */}
      <div className={cardStyles.bgAccent} />
      
      <div className={cardStyles.header}>
        <div className={cardStyles.profileInfo}>
          <div className={cardStyles.avatarWrapper}>
            {profileImage ? (
              <img src={profileImage} alt={user.name} className={cardStyles.avatarImage} />
            ) : (
              <div className={cardStyles.avatarPlaceholder}>{initial}</div>
            )}
          </div>

          <div className={cardStyles.nameSection}>
            <h3 className={cardStyles.nameTitle}>{user.name}</h3>
            <p className={cardStyles.designationText}>{user.designation || "No Designation"}</p>
          </div>
        </div>

        <div className={cardStyles.actionContainer}>
          {onView && (
            <IconButton onClick={onView} className={cardStyles.actionButton} size="small" aria-label="view user">
              <Visibility className="w-5 h-5" />
            </IconButton>
          )}
          {onEdit && (
            <PermissionGuard module={USERS_PERMISSION_MODULE} action="write" fallback={null}>
              <IconButton onClick={onEdit} className={cardStyles.actionButton} size="small" aria-label="edit user">
                <EditIcon className="w-5 h-5" />
              </IconButton>
            </PermissionGuard>
          )}
        </div>
      </div>

      <div className={cardStyles.metadataSection}>
        {contactInfo.map(({ icon: Icon, value, key }) => (
          <div key={key} className={cardStyles.metadataItem}>
            <Icon className={cardStyles.metadataIcon} />
            <span className={cardStyles.metadataValue}>{value}</span>
          </div>
        ))}
        
        <div className={cardStyles.orgSection}>
          {orgInfo.map(({ icon: Icon, label, value, key }) => (
            <div key={key} className={cardStyles.orgItem}>
              <Icon className={cardStyles.orgIcon} />
              <span className={cardStyles.orgLabel}>{label}</span>
              <span className={cardStyles.orgValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
