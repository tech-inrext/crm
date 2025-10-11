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
        padding: { xs: "8px", sm: "4px" }, // Add padding adjustment for small screens
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
          fontSize: { xs: "14px", sm: "16px" }, // Adjust icon size for small screens
          padding: { xs: "4px", sm: "8px" }, // Adjust padding for smaller icons on mobile
        }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      {/* Page Input */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography sx={{ color: "#bfc9d9", fontSize: { xs: 12, sm: 14 } }}>
          Page
        </Typography>
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onKeyDown={handlePageSubmit}
          onBlur={triggerPageChange} // Trigger onBlur
          style={{
            width: "50px", // Smaller input box on mobile
            padding: "2px 5px",
            borderRadius: 6,
            border: "1px solid #232b36",
            background: "#181d23",
            color: "#bfc9d9",
            fontWeight: 500,
            textAlign: "center",
            fontSize: "14px", // Smaller text for mobile
          }}
        />
        <Typography sx={{ color: "#bfc9d9", fontSize: { xs: 12, sm: 14 } }}>
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
          fontSize: { xs: "14px", sm: "16px" }, // Adjust icon size for small screens
          padding: { xs: "4px", sm: "8px" }, // Adjust padding for smaller icons on mobile
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>

      {/* Page Size Selector */}
      {onPageSizeChange && (
        <Box sx={{ ml: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: "#bfc9d9", fontSize: { xs: 12, sm: 14 } }}>
            Rows:
          </Typography>
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
              fontSize: "14px", // Smaller font size for mobile
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
