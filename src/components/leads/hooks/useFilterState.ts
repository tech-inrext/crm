// src/components/leads/hooks/useFilterState.ts
import { useState, useRef } from "react";
import { LeadsActionBarProps, FilterState } from "../types/LeadsActionBarTypes";

export const useFilterState = (props: LeadsActionBarProps) => {
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  
  const [filterState, setFilterState] = useState<FilterState>({
    mobileAnchor: null,
    actionsAnchor: null,
    filterMenuAnchor: null,
    uploadStatusOpen: false,
    dateFilterOpen: false,
    tempDateRange: {
      startDate: props.dateFilter?.startDate || null,
      endDate: props.dateFilter?.endDate || null,
    },
  });

  const isFilterActive =
    props.selectedStatuses.length > 0 ||
    (props.dateFilter && (props.dateFilter.startDate || props.dateFilter.endDate));

  const openMobileMenu = (e: React.MouseEvent<HTMLElement>) => {
    if (e.currentTarget === filterButtonRef.current) {
      setFilterState(prev => ({ ...prev, mobileAnchor: e.currentTarget }));
    } else {
      if (filterButtonRef.current) {
        setFilterState(prev => ({ ...prev, mobileAnchor: filterButtonRef.current }));
      }
    }
  };

  const openFilterMenu = (e: React.MouseEvent<HTMLElement>) =>
    setFilterState(prev => ({ ...prev, filterMenuAnchor: e.currentTarget }));

  const openActionsMenu = (e: React.MouseEvent<HTMLElement>) =>
    setFilterState(prev => ({ ...prev, actionsAnchor: e.currentTarget }));

  const closeMobileMenu = () => setFilterState(prev => ({ ...prev, mobileAnchor: null }));
  const closeFilterMenu = () => setFilterState(prev => ({ ...prev, filterMenuAnchor: null }));
  const closeActionsMenu = () => setFilterState(prev => ({ ...prev, actionsAnchor: null }));

  const setTempDateRange = (dateRange: FilterState["tempDateRange"]) =>
    setFilterState(prev => ({ ...prev, tempDateRange: dateRange }));

  const setDateFilterOpen = (open: boolean) =>
    setFilterState(prev => ({ ...prev, dateFilterOpen: open }));

  const setUploadStatusOpen = (open: boolean) =>
    setFilterState(prev => ({ ...prev, uploadStatusOpen: open }));

  const handleDateFilterApply = () => {
    if (props.onDateFilterChange) {
      props.onDateFilterChange(filterState.tempDateRange);
    }
    setDateFilterOpen(false);
  };

  const handleClearDateFilter = () => {
    setTempDateRange({ startDate: null, endDate: null });
    if (props.onDateFilterChange) {
      props.onDateFilterChange({ startDate: null, endDate: null });
    }
    setDateFilterOpen(false);
  };

  const handleClearAllFilters = () => {
    props.onStatusesChange([]);
    if (props.onDateFilterChange) {
      props.onDateFilterChange({ startDate: null, endDate: null });
    }
    closeFilterMenu();
    closeMobileMenu();
  };

  const handleOpenDateFilterDialog = () => {
    setTempDateRange({
      startDate: props.dateFilter?.startDate || null,
      endDate: props.dateFilter?.endDate || null,
    });
    setDateFilterOpen(true);
    closeFilterMenu();
  };

  return {
    filterState,
    filterButtonRef,
    isFilterActive,
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
  };
};