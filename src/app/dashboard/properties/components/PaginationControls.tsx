import React from "react";
import {
  Box,
  Button,
  Typography,
} from "@mui/material";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, gap: 2 }}>
      <Typography variant="body2" color="text.secondary">Showing {startItem}-{endItem} of {totalItems} projects</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Button variant="outlined" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button key={page} variant={currentPage === page ? "contained" : "outlined"} onClick={() => onPageChange(page)}>
            {page}
          </Button>
        ))}
        <Button variant="outlined" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
      </Box>
    </Box>
  );
};

export default PaginationControls;

