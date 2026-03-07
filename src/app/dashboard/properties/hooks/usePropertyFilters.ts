import { useState, useCallback } from "react";

interface Filters {
  propertyType: string;
  status: string;
  location: string;
  builderName: string;
  visibility: string;
}

export const usePropertyFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    propertyType: "",
    status: "",
    location: "",
    builderName: "",
    visibility: "",
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleFilterChange = useCallback((filterType: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      propertyType: "",
      status: "",
      location: "",
      builderName: "",
      visibility: "",
    });
  }, []);

  const removeFilter = useCallback((filterType: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [filterType]: "" }));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // This function now just returns the event for the parent component to handle
    return e.target.value;
  }, []);

  return {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    activeFiltersCount,
    setActiveFiltersCount,
    handleFilterChange,
    clearAllFilters,
    removeFilter,
    handleSearchChange
  };
};