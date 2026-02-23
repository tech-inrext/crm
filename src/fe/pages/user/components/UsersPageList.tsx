"use client";

import React from "react";
import { UsersList } from "@/fe/pages/user/components/UsersList";

interface Props {
  loading: boolean;
  employees: any[];
  isMobile: boolean;
  isClient: boolean;
  windowWidth: number;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  usersTableHeader: any;
  onPageChange: (p: number) => void;
  onPageSizeChange: (n: number) => void;
  onEditUser: (id: string) => void;
  canEdit: (user: any) => boolean;
}

const UsersPageList: React.FC<Props> = (props) => {
  return <UsersList {...props} />;
};

export default UsersPageList;
