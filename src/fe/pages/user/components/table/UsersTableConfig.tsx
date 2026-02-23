import { Box, Button } from "@/components/ui/Component";
import {
  USERS_TABLE_HEADER,
  USERS_PERMISSION_MODULE,
} from "@/fe/pages/user/constants/users";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PermissionGuard from "@/components/PermissionGuard";

interface GetUsersTableHeaderProps {
  canEditEmployee: (user: any) => boolean;
  onView: (user: any) => void;
  onEdit: (user: any) => void;
}

export const getUsersTableHeader = ({
  canEditEmployee,
  onView,
  onEdit,
}: GetUsersTableHeaderProps) => {
  return USERS_TABLE_HEADER.map((header) =>
    header.label === "Actions"
      ? {
          ...header,
          component: (row: any) => (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                color="info"
                onClick={() => onView(row)}
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.5,
                  minHeight: 0,
                  lineHeight: 1,
                }}
              >
                <VisibilityIcon fontSize="small" />
              </Button>

              {canEditEmployee(row) && (
                <PermissionGuard
                  module={USERS_PERMISSION_MODULE}
                  action="write"
                  fallback={null}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onEdit(row)}
                    sx={{
                      minWidth: 0,
                      px: 1,
                      py: 0.5,
                      minHeight: 0,
                      lineHeight: 1,
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </Button>
                </PermissionGuard>
              )}
            </Box>
          ),
        }
      : header,
  );
};
