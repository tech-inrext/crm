"use client";

import { useState, useCallback } from "react";

export function useNoticePagination(initialPage = 1, initialRows = 6) {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRows);
  const [totalItems, setTotalItems] = useState(0);

  const handlePageChange = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage + 1);
    },
    []
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(1);
    },
    []
  );

  return {
    page,
    rowsPerPage,
    totalItems,
    setTotalItems,
    setPage,
    setRowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
  };
}