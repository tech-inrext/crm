import React, { useState } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
} from "@/components/ui/Component";
import { LeadsActionBarProps } from "./types/LeadsActionBarTypes";
import DateFilterDialog from "./LeadsActionBar/DateFilterDialog";
import UploadStatusDialog from "./LeadsActionBar/UploadStatusDialog";
import ActionButtonsRow from "./LeadsActionBar/ActionButtonsRow";
import FilterControls from "./LeadsActionBar/FilterControls";
import SearchBar from "@/components/ui/search/SearchBar";
import { useFilterState } from "./hooks/useFilterState";

const LeadsActionBar: React.FC<LeadsActionBarProps> = (props) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  
  const {
    filterState,
    filterButtonRef,
    handleDateFilterApply,
    handleClearDateFilter,
    handleClearAllFilters,
    handleOpenDateFilterDialog,
    openMobileMenu,
    openFilterMenu,
    openActionsMenu,
    closeMobileMenu,
    closeFilterMenu,
    closeActionsMenu,
    setTempDateRange,
    setDateFilterOpen,
    setUploadStatusOpen,
  } = useFilterState(props);

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-6 items-stretch md:items-center w-full overflow-visible">
      {/* Controls Row */}
      <div className="flex flex-row gap-2 items-center justify-start w-full">
        {/* Search Bar */}
        <div className="w-full max-w-[300px] flex-grow min-w-0 order-1 sm:order-1">
          <SearchBar
            className="w-full min-w-0 max-w-[300px]"
            value={props.search}
            onChange={props.onSearchChange}
            placeholder="Search leads by name, email, phone..."
          />
        </div>

        {/* Filter Controls */}
        <FilterControls
          isTablet={isTablet}
          filterState={filterState}
          filterButtonRef={filterButtonRef}
          onOpenMobileMenu={openMobileMenu}
          onOpenFilterMenu={openFilterMenu}
          onCloseFilterMenu={closeFilterMenu}
          onCloseMobileMenu={closeMobileMenu}
          onClearAllFilters={handleClearAllFilters}
          onOpenDateFilterDialog={handleOpenDateFilterDialog}
          onStatusesChange={props.onStatusesChange}
          selectedStatuses={props.selectedStatuses}
          dateFilter={props.dateFilter}
        />

        {/* Action Buttons */}
        <ActionButtonsRow
          isTablet={isTablet}
          onAdd={props.onAdd}
          saving={props.saving}
          loadLeads={props.loadLeads}
          filterState={filterState}
          onOpenActionsMenu={openActionsMenu}
          onCloseActionsMenu={closeActionsMenu}
          onSetUploadStatusOpen={setUploadStatusOpen}
        />
      </div>

      {/* Dialogs */}
      <DateFilterDialog
        open={filterState.dateFilterOpen}
        onClose={() => setDateFilterOpen(false)}
        tempDateRange={filterState.tempDateRange}
        onTempDateRangeChange={setTempDateRange}
        onApply={handleDateFilterApply}
        onClear={handleClearDateFilter}
      />

      <UploadStatusDialog
        open={filterState.uploadStatusOpen}
        onClose={() => setUploadStatusOpen(false)}
      />
    </div>
  );
};

export default LeadsActionBar;