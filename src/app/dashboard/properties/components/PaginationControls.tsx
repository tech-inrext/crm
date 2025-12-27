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

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }
    
    let prev: number | null = null;
    for (const i of range) {
      if (prev !== null && i - prev !== 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      prev = i;
    }
    
    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      mb: 4, 
      mt: 4,
      gap: 2,
      width: '100%',
      p: 3,
      backgroundColor: '#f8fafc',
      borderRadius: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0'
    }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        Showing <Typography component="span" sx={{ color: '#1976d2', fontWeight: 600 }}>{startItem}-{endItem}</Typography> of <Typography component="span" sx={{ color: '#1976d2', fontWeight: 600 }}>{totalItems}</Typography> projects
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 1,
        flexWrap: 'wrap'
      }}>
        {/* Previous Button */}
        <Button
          variant="outlined"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          sx={{
            minWidth: '40px',
            height: '40px',
            borderRadius: '8px',
            borderColor: '#d1d5db',
            color: currentPage === 1 ? '#9ca3af' : '#374151',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            },
            '&:disabled': {
              borderColor: '#e5e7eb',
              backgroundColor: '#f9fafb'
            }
          }}
        >
          Previous
        </Button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNumber, index) => (
          typeof pageNumber === 'number' ? (
            <Button
              key={index}
              variant={currentPage === pageNumber ? "contained" : "outlined"}
              onClick={() => onPageChange(pageNumber)}
              sx={{
                minWidth: '40px',
                height: '40px',
                borderRadius: '8px',
                fontWeight: currentPage === pageNumber ? 700 : 600,
                fontSize: '0.875rem',
                borderColor: currentPage === pageNumber ? '#1976d2' : '#d1d5db',
                backgroundColor: currentPage === pageNumber 
                  ? '#1976d2' 
                  : 'transparent',
                color: currentPage === pageNumber 
                  ? 'white' 
                  : '#374151',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: currentPage === pageNumber 
                    ? '#1565c0' 
                    : 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              {pageNumber}
            </Button>
          ) : (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                height: '40px',
                color: '#6b7280',
                fontWeight: 600
              }}
            >
              {pageNumber}
            </Box>
          )
        ))}

        {/* Next Button */}
        <Button
          variant="outlined"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          sx={{
            minWidth: '40px',
            height: '40px',
            borderRadius: '8px',
            borderColor: '#d1d5db',
            color: currentPage === totalPages ? '#9ca3af' : '#374151',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            },
            '&:disabled': {
              borderColor: '#e5e7eb',
              backgroundColor: '#f9fafb'
            }
          }}
        >
          Next
        </Button>
      </Box>
      
      {/* Page Info */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        Page {currentPage} of {totalPages}
      </Typography>
    </Box>
  );
};

export default PaginationControls;


