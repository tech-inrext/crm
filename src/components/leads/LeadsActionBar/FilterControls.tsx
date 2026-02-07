// src/components/leads/LeadsActionBar/FilterControls.tsx
import React from "react";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@/components/ui/Component";
import { FilterAltIcon } from "@/components/ui/Component";
import { CalendarToday } from "@mui/icons-material";
import { FilterControlsProps } from "../types/LeadsActionBarTypes";
import { LEAD_STATUSES } from "@/constants/leads";
import { formatDateForDisplay } from "../utils/dateUtils";

const FilterControls: React.FC<FilterControlsProps> = ({
  isTablet,
  filterState,
  filterButtonRef,
  onOpenMobileMenu,
  onOpenFilterMenu,
  onCloseFilterMenu,
  onCloseMobileMenu,
  onClearAllFilters,
  onOpenDateFilterDialog,
  onStatusesChange,
  selectedStatuses,
  dateFilter,
}) => {
  const isFilterActive = selectedStatuses.length > 0 ||
    (dateFilter && (dateFilter.startDate || dateFilter.endDate));

  const handleStatusFilterClick = (e: React.MouseEvent<HTMLElement>) => {
    onOpenMobileMenu(e);
    onCloseFilterMenu();
  };

  return (
    <div className="flex items-center ml-1">
      <Tooltip title="Filter leads">
        <IconButton
          ref={filterButtonRef}
          size="small"
          onClick={onOpenFilterMenu}
          className={`relative ${isFilterActive ? "bg-primary-main text-white" : "bg-white text-inherit"} shadow-sm hover:${isFilterActive ? "bg-primary-dark" : "bg-gray-50"}`}
          aria-controls={filterState.filterMenuAnchor ? "filter-options-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={!!filterState.filterMenuAnchor}
        >
          <FilterAltIcon fontSize="small" />
          {isFilterActive && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error-main border border-white" />
          )}
        </IconButton>
      </Tooltip>

      {/* Filter Options Menu */}
      <Menu
        id="filter-options-menu"
        anchorEl={filterState.filterMenuAnchor}
        open={!!filterState.filterMenuAnchor}
        onClose={onCloseFilterMenu}
        MenuListProps={{ className: "min-w-[200px] py-0.5" }}
        PaperProps={{ className: "rounded-lg shadow-xl mt-1 overflow-hidden" }}
      >
        {/* Date Filter Option */}
        <MenuItem
          onClick={onOpenDateFilterDialog}
          className="flex items-center gap-3 py-1 px-3 rounded mx-1 my-0.5 hover:bg-action-hover"
        >
          <CalendarToday fontSize="small" />
          <div className="flex-grow">
            <span className="font-semibold text-sm block">Date Filter</span>
            {(dateFilter?.startDate || dateFilter?.endDate) && (
              <span className="text-xs text-gray-600 block mt-0.5">
                {dateFilter.startDate && formatDateForDisplay(dateFilter.startDate)}
                {dateFilter.startDate && dateFilter.endDate && " - "}
                {dateFilter.endDate && formatDateForDisplay(dateFilter.endDate)}
              </span>
            )}
          </div>
          {(dateFilter?.startDate || dateFilter?.endDate) && (
            <div className="w-2 h-2 rounded-full bg-primary-main" />
          )}
        </MenuItem>

        {/* Status Filter Option */}
        <MenuItem
          onClick={handleStatusFilterClick}
          className="flex items-center gap-3 py-1 px-3 rounded mx-1 my-0.5 hover:bg-action-hover"
        >
          <FilterAltIcon fontSize="small" />
          <div className="flex-grow">
            <span className="font-semibold text-sm block">Status Filter</span>
            {selectedStatuses.length > 0 && (
              <span className="text-xs text-gray-600 block mt-0.5">
                {selectedStatuses.length} selected
              </span>
            )}
          </div>
          {selectedStatuses.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-primary-main" />
          )}
        </MenuItem>

        {/* Clear All Filters Option */}
        {isFilterActive && (
          <MenuItem
            onClick={onClearAllFilters}
            className="text-error-main justify-center border-t border-gray-200 mt-0.5 py-2 font-semibold text-sm hover:bg-red-50"
          >
            Clear All Filters
          </MenuItem>
        )}
      </Menu>

      {/* Status Filter Menu */}
      <Menu
        id="mobile-status-menu"
        anchorEl={filterState.mobileAnchor}
        open={!!filterState.mobileAnchor}
        onClose={onCloseMobileMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        MenuListProps={{ className: "min-w-[220px] py-0.5" }}
        PaperProps={{ className: "rounded-lg shadow-xl mt-1 overflow-hidden" }}
      >
        <MenuItem
          onClick={() => {
            onStatusesChange([]);
            onCloseMobileMenu();
          }}
          className="font-bold text-sm border-b border-gray-200 py-2 px-3 hover:bg-transparent"
        >
          All Statuses
        </MenuItem>
        {LEAD_STATUSES.filter(Boolean).map((s) => (
          <MenuItem
            key={s}
            onClick={() => {
              const newStatuses = selectedStatuses.includes(s)
                ? selectedStatuses.filter((st) => st !== s)
                : [...selectedStatuses, s];
              onStatusesChange(newStatuses);
            }}
            className="flex items-center gap-3 py-1 px-3 rounded mx-1 my-0.5 hover:bg-action-hover"
          >
            <input
              type="checkbox"
              checked={selectedStatuses.includes(s)}
              readOnly
              className="cursor-pointer w-4 h-4 accent-primary-main"
            />
            <span className="capitalize font-semibold text-sm flex-grow">
              {s}
            </span>
          </MenuItem>
        ))}
        {selectedStatuses.length > 0 && (
          <MenuItem
            onClick={() => {
              onStatusesChange([]);
              onCloseMobileMenu();
            }}
            className="text-error-main justify-center border-t border-gray-200 mt-0.5 py-2 font-semibold text-sm hover:bg-red-50"
          >
            Clear Status
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default FilterControls;