// src/components/leads/types/LeadsActionBarTypes.ts
export interface LeadsActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewMode: "table" | "cards";
  setViewMode: (mode: "table" | "cards") => void;
  onAdd: () => void;
  saving: boolean;
  loadLeads: () => void;
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  dateFilter?: {
    startDate?: Date | null;
    endDate?: Date | null;
  };
  onDateFilterChange?: (dateRange: {
    startDate?: Date | null;
    endDate?: Date | null;
  }) => void;
}

export interface FilterState {
  mobileAnchor: HTMLElement | null;
  actionsAnchor: HTMLElement | null;
  filterMenuAnchor: HTMLElement | null;
  uploadStatusOpen: boolean;
  dateFilterOpen: boolean;
  tempDateRange: {
    startDate?: Date | null;
    endDate?: Date | null;
  };
}

export interface FilterControlsProps {
  isTablet: boolean;
  filterState: FilterState;
  filterButtonRef: React.RefObject<HTMLButtonElement>;
  onOpenMobileMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onOpenFilterMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onCloseFilterMenu: () => void;
  onCloseMobileMenu: () => void;
  onClearAllFilters: () => void;
  onOpenDateFilterDialog: () => void;
  onStatusesChange: (statuses: string[]) => void;
  selectedStatuses: string[];
  dateFilter?: {
    startDate?: Date | null;
    endDate?: Date | null;
  };
}