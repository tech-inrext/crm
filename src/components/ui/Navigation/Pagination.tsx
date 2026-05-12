import React, { useState, useEffect } from "react";
import Box from "@/components/ui/Component/Box";
import IconButton from "@/components/ui/Component/IconButton";
import Typography from "@/components/ui/Component/Typography";
import ArrowBackIosNewIcon from "@/components/ui/Component/ArrowBackIosNewIcon";
import ArrowForwardIosIcon from "@/components/ui/Component/ArrowForwardIosIcon";

interface PaginationProps {
  page: number; // 1-based page number
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions = [8, 16, 24, 32],
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const [inputPage, setInputPage] = useState(page.toString());

  // Sync inputPage when parent updates page
  useEffect(() => {
    setInputPage(page.toString());
  }, [page]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) setInputPage(val); // Allow only digits
  };

  const triggerPageChange = () => {
    const parsed = parseInt(inputPage);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      onPageChange(parsed);
    } else {
      setInputPage(page.toString()); // Reset if invalid
    }
  };

  const handlePageSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      triggerPageChange();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mt: 1,
        justifyContent: "center",
        flexWrap: "wrap",
        padding: { xs: "8px", sm: "6px" },
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 999,
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? "0 4px 20px rgba(0,0,0,0.5)" 
          : "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      {/* Previous Button */}
      <IconButton
        size="small"
        onClick={() => canPrev && onPageChange(page - 1)}
        disabled={!canPrev}
        sx={{
          bgcolor: "background.default",
          color: "text.secondary",
          border: "1px solid",
          borderColor: "divider",
          "&:hover": { bgcolor: "action.hover" },
          fontSize: { xs: "14px", sm: "16px" },
          padding: { xs: "4px", sm: "6px" },
          boxShadow: "none",
        }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      {/* Page Input */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ color: "text.secondary", fontSize: { xs: 12, sm: 14 } }}>
          Page
        </Typography>
        <Box
          component="input"
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handlePageSubmit}
          onBlur={triggerPageChange}
          sx={{
            width: "48px",
            padding: "2px 6px",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
            color: "text.primary",
            fontWeight: 500,
            textAlign: "center",
            fontSize: "13px",
            outline: "none",
            "&:focus": {
              borderColor: "primary.main",
            }
          }}
        />
        <Typography sx={{ color: "text.secondary", fontSize: { xs: 12, sm: 14 } }}>
          of {totalPages}
        </Typography>
      </Box>

      {/* Next Button */}
      <IconButton
        size="small"
        onClick={() => canNext && onPageChange(page + 1)}
        disabled={!canNext}
        sx={{
          bgcolor: "background.default",
          color: "text.secondary",
          border: "1px solid",
          borderColor: "divider",
          "&:hover": { bgcolor: "action.hover" },
          fontSize: { xs: "14px", sm: "16px" },
          padding: { xs: "4px", sm: "6px" },
          boxShadow: "none",
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>
      
      {/* Total Count */}
      <Typography sx={{ color: "text.secondary", fontSize: { xs: 12, sm: 14 }, mx: 1 }}>
        Total: {total}
      </Typography>

      {/* Page Size Selector */}
      {onPageSizeChange && (
        <Box sx={{ ml: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography sx={{ color: "text.secondary", fontSize: { xs: 12, sm: 14 } }}>
            Rows:
          </Typography>
          <Box
            component="select"
            value={pageSize}
            onChange={(e: any) => onPageSizeChange(Number(e.target.value))}
            sx={{
              padding: "2px 8px",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
              color: "text.primary",
              fontWeight: 500,
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
              "&:focus": {
                borderColor: "primary.main",
              }
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt} style={{ background: 'inherit', color: 'inherit' }}>
                {opt}
              </option>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Pagination;
