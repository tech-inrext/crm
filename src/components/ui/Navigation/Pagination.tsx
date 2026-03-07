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
        gap: 1,
        mt: 1,
        justifyContent: "center",
        flexWrap: "wrap",
        padding: { xs: "8px", sm: "6px" },
        bgcolor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 999,
      }}
    >
      {/* Previous Button */}
      <IconButton
        size="small"
        onClick={() => canPrev && onPageChange(page - 1)}
        disabled={!canPrev}
        sx={{
          bgcolor: "#fff",
          color: "#475569",
          border: "1px solid #e2e8f0",
          "&:hover": { bgcolor: "#f1f5f9" },
          fontSize: { xs: "14px", sm: "16px" },
          padding: { xs: "4px", sm: "6px" },
          boxShadow: "none",
        }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      {/* Page Input */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ color: "#64748b", fontSize: { xs: 12, sm: 14 } }}>
          Page
        </Typography>
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handlePageSubmit}
          onBlur={triggerPageChange} // Trigger onBlur
          style={{
            width: "48px",
            padding: "2px 6px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#0f172a",
            fontWeight: 500,
            textAlign: "center",
            fontSize: "13px",
          }}
        />
        <Typography sx={{ color: "#64748b", fontSize: { xs: 12, sm: 14 } }}>
          of {totalPages}
        </Typography>
      </Box>

      {/* Next Button */}
      <IconButton
        size="small"
        onClick={() => canNext && onPageChange(page + 1)}
        disabled={!canNext}
        sx={{
          bgcolor: "#fff",
          color: "#475569",
          border: "1px solid #e2e8f0",
          "&:hover": { bgcolor: "#f1f5f9" },
          fontSize: { xs: "14px", sm: "16px" },
          padding: { xs: "4px", sm: "6px" },
          boxShadow: "none",
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>

      {/* Page Size Selector */}
      {onPageSizeChange && (
        <Box sx={{ ml: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography sx={{ color: "#64748b", fontSize: { xs: 12, sm: 14 } }}>
            Rows:
          </Typography>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: "2px 8px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#0f172a",
              fontWeight: 500,
              fontSize: "13px",
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
