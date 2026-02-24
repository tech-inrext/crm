"use client";

import React from "react";
import { UsersList } from "@/fe/pages/user/components/UsersList";
import type { UsersListProps } from "@/fe/pages/user/types";

/**
 * UsersPageList – thin layout wrapper around UsersList.
 * Keeps the page's JSX clean by encapsulating any future layout
 * decoration (e.g. container padding, surface cards) in one place.
 */
const UsersPageList: React.FC<UsersListProps> = (props) => (
  <div className="mt-2">
    <UsersList {...props} />
  </div>
);

export default UsersPageList;
