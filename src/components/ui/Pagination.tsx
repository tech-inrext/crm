import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

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
  pageSizeOptions = [5, 10, 15, 25],
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
        gap: 2,
        mt: 2,
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Previous Button */}
      <IconButton
        size="small"
        onClick={() => canPrev && onPageChange(page - 1)}
        disabled={!canPrev}
        sx={{
          bgcolor: "#232b36",
          color: "#fff",
          "&:hover": { bgcolor: "#283046" },
        }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      {/* Page Input */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ color: "#bfc9d9", fontSize: 14 }}>Page</Typography>
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handlePageSubmit}
          onBlur={triggerPageChange} // ✅ trigger onBlur
          style={{
            width: "60px",
            padding: "2px 5px",
            borderRadius: 6,
            border: "1px solid #232b36",
            background: "#181d23",
            color: "#bfc9d9",
            fontWeight: 500,
            textAlign: "center",
          }}
        />
        <Typography sx={{ color: "#bfc9d9", fontSize: 14 }}>
          of {totalPages}
        </Typography>
      </Box>

      {/* Next Button */}
      <IconButton
        size="small"
        onClick={() => canNext && onPageChange(page + 1)}
        disabled={!canNext}
        sx={{
          bgcolor: "#232b36",
          color: "#fff",
          "&:hover": { bgcolor: "#283046" },
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>

      {/* Page Size Selector */}
      {onPageSizeChange && (
        <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: "#bfc9d9", fontSize: 14 }}>Rows:</Typography>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: "2px 8px",
              borderRadius: 6,
              border: "1px solid #232b36",
              background: "#181d23",
              color: "#bfc9d9",
              fontWeight: 500,
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Box>
      )}
    </Box>
  );
};

export default Pagination;
