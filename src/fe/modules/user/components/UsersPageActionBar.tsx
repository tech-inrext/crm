"use client";

import React from "react";
import { Paper, Typography } from "@/components/ui/Component";
import UsersActionBar from "@/fe/modules/user/components/actionBar/UsersActionBar";

interface Props {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}

const UsersPageActionBar: React.FC<Props> = ({
  search,
  onSearchChange,
  onAdd,
  saving,
}) => {
  return (
    <Paper
      elevation={2}
      className="p-4 sm:p-6 md:p-8 rounded-lg mb-4 mt-2 bg-gradient-to-br from-white to-slate-50 overflow-hidden"
    >
      <Typography
        variant="h4"
        className="font-extrabold text-gray-900 text-2xl sm:text-3xl md:text-4xl mb-3 text-center sm:text-left"
      >
        Users
      </Typography>

      <UsersActionBar
        search={search}
        onSearchChange={onSearchChange}
        onAdd={onAdd}
        saving={saving}
      />
    </Paper>
  );
};

export default UsersPageActionBar;
