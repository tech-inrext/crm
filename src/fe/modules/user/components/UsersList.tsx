import React from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  TableContainer,
} from "@/components/ui/Component";
import UserCard from "@/fe/modules/user/components/card/UserCard";
import dynamic from "next/dynamic";
import {
  COMMON_STYLES,
  USERS_ROWS_PER_PAGE_OPTIONS,
} from "@/fe/modules/user/constants/users";
import { MODULE_STYLES } from "@/styles/moduleStyles";

const TableMap = dynamic(() => import("@/components/ui/table/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
);

interface UsersListProps {
  loading: boolean;
  employees: any[];
  isMobile: boolean;
  isClient: boolean;
  windowWidth: number;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  usersTableHeader: any[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditUser: (user: any) => void;
  canEdit: (user: any) => boolean;
}

export const UsersList: React.FC<UsersListProps> = ({
  loading,
  employees,
  isMobile,
  isClient,
  windowWidth,
  page,
  rowsPerPage,
  totalItems,
  usersTableHeader,
  onPageChange,
  onPageSizeChange,
  onEditUser,
  canEdit,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (employees.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography>No users found.</Typography>
      </Box>
    );
  }

  const paginationComponent = (
    <Box sx={MODULE_STYLES.leads.paginationWrapper}>
      <Pagination
        page={page}
        pageSize={rowsPerPage}
        total={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={USERS_ROWS_PER_PAGE_OPTIONS}
      />
    </Box>
  );

  if (isMobile) {
    return (
      <Box>
        <Box
          sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5, mb: 2 }}
        >
          {employees.map((user) => (
            <UserCard
              key={user.id || user._id}
              user={{
                name: user.name,
                email: user.email,
                designation: user.designation,
                avatarUrl: user.avatarUrl,
              }}
              onEdit={canEdit(user) ? () => onEditUser(user) : undefined}
            />
          ))}
        </Box>
        {paginationComponent}
      </Box>
    );
  }

  return (
    <Box sx={MODULE_STYLES.leads.tableWrapper}>
      <TableContainer
        component={(props) => <Paper elevation={8} {...props} />}
        sx={{
          ...COMMON_STYLES.roundedPaper,
          ...MODULE_STYLES.leads.tableContainer,
        }}
      >
        <TableMap
          data={employees}
          header={usersTableHeader}
          onEdit={() => {}}
          onDelete={() => {}}
          size={isClient && windowWidth < 600 ? "small" : "medium"}
          stickyHeader
        />
      </TableContainer>
      {paginationComponent}
    </Box>
  );
};

export default UsersList;
