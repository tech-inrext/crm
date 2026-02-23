"use client";

import React from "react";
import PageHeader from "@/fe/framework/components/PageHeader";
import UsersActionBar from "@/fe/pages/user/components/UsersActionBar";

interface Props {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}

/**
 * UsersPageActionBar – page-level header for the Users module.
 *
 * Uses the shared `PageHeader` for consistent chrome (Paper + title),
 * and passes `UsersActionBar` as children so search/add controls
 * are slotted in without touching PageHeader itself.
 */
const UsersPageActionBar: React.FC<Props> = ({
  search,
  onSearchChange,
  onAdd,
  saving,
}) => {
  return (
    <PageHeader title="Users">
      <UsersActionBar
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        saving={saving}
      />
    </PageHeader>
  );
};

export default UsersPageActionBar;
