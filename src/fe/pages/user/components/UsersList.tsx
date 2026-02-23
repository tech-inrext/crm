import React from "react";
import type { UsersListProps } from "@/fe/pages/user/types";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  TableContainer,
} from "@/components/ui/Component";
import UserCard from "@/fe/pages/user/components/card/UserCard";
import { USERS_ROWS_PER_PAGE_OPTIONS } from "@/fe/pages/user/constants/users";
import { default as MODULE_STYLES } from "@/fe/pages/user/styles";
import dynamic from "next/dynamic";

const TableMap = dynamic(() => import("@/components/ui/table/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
);

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
          borderRadius: 2,
          ...MODULE_STYLES.leads.tableContainer,
        }}
      >
        <TableMap
          data={employees}
          header={usersTableHeader}
          onEdit={() => { }}
          onDelete={() => { }}
          size={isClient && windowWidth < 600 ? "small" : "medium"}
          stickyHeader
        />
      </TableContainer>
      {paginationComponent}
    </Box>
  );
};

export default UsersList;
