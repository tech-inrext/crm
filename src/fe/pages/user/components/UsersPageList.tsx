"use client";

import React from "react";
import { UsersList } from "@/fe/pages/user/components/UsersList";
import type { UsersListProps } from "@/fe/pages/user/types";

const UsersPageList: React.FC<UsersListProps> = (props) => (
  <div className="mt-2">
    <UsersList {...props} />
  </div>
);

export default UsersPageList;
