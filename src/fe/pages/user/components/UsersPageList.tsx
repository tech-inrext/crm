"use client";

import React from "react";
import { UsersList } from "@/fe/pages/user/components/UsersList";
import type { UsersListProps } from "@/fe/pages/user/types";

const UsersPageList: React.FC<UsersListProps> = React.memo((props) => (
  <div className="mt-2">
    <UsersList {...props} />
  </div>
));

UsersPageList.displayName = "UsersPageList";

export default UsersPageList;
