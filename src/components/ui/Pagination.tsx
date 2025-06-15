import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface PaginationProps {
  page: number;
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
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        mt: 2,
        justifyContent: "center",
      }}
    >
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
      <Typography sx={{ color: "#bfc9d9", fontWeight: 500, fontSize: 15 }}>
        Page {page} of {totalPages}
      </Typography>
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
