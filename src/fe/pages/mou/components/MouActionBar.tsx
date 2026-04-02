"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { Box, Button } from "@/components/ui/Component";
import SearchBar from "@/components/ui/search/SearchBar";
import { MouActionBarProps } from "../types";
import {
  searchContainerSx,
  actionBarButtonsSx,
  actionBarButtonSx,
} from "../styles";

const SEARCH_PLACEHOLDER = "Search MOU by employee name or email...";

const MouActionBar: React.FC<MouActionBarProps> = ({
  search,
  onSearchChange,
  view,
  onViewChange,
}) => {
  return (
    <PageHeader title="MOU">
      <Box sx={searchContainerSx}>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </Box>

      <Box sx={actionBarButtonsSx}>
        <Button
          variant={view === "pending" ? "contained" : "outlined"}
          onClick={() => onViewChange("pending")}
          sx={actionBarButtonSx}
        >
          Pending
        </Button>
        <Button
          variant={view === "completed" ? "contained" : "outlined"}
          onClick={() => onViewChange("completed")}
          sx={actionBarButtonSx}
        >
          Completed
        </Button>
      </Box>
    </PageHeader>
  );
};

export default MouActionBar;
