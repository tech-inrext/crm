import React, { useState } from "react";
import Box from "@/components/ui/Component/Box";
import Typography from "@/components/ui/Component/Typography";
import Paper from "@/components/ui/Component/Paper";

import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

interface LeadsBySourceMetrics {
  map: Record<string, any>;
  sourcesOrder: string[];
  slices: Array<{ label: string; value: number; color?: string }>;
}


const LeadsBySourceList: React.FC<{ leadsBySourceMetrics: LeadsBySourceMetrics }> = ({
  leadsBySourceMetrics,
}) => {
  const { map, sourcesOrder, slices } = leadsBySourceMetrics;

  // Pagination state
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(sourcesOrder.length / rowsPerPage));
  const paginatedSources = sourcesOrder.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleChangePage = (_: any, value: number) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

  return (
    <Box width="100%" maxWidth={400}>
      {/* Header */}
      <Typography
        sx={{
          fontSize: "0.95rem",
          color: "#666",
          mb: 1,
          textAlign: "left",
        }}
      >
        Cost per lead & conversion by source
      </Typography>

      {/* List */}
      <Box display="flex" flexDirection="column" gap={1}>
        {sourcesOrder.length === 0 && (
          <Typography sx={{ color: "#666" }}>No leads available</Typography>
        )}

        {paginatedSources.map((src) => {
          const m = map[src];
          const count = m?.count || 0;
          const converted = m?.converted || 0;
          const conversion =
            count > 0 ? Math.round((converted / count) * 100) : 0;
          const avgCost =
            count > 0 ? Math.round((m.totalCost || 0) / count) : 0;

          const color =
            slices.find((s) => s.label === src)?.color || "#ddd";

          return (
            <Paper
              key={src}
              elevation={0}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: "8px 10px",
                borderRadius: 1.5,
                background: "#fff",
                border: "1px solid #f3f3f3",
              }}
            >
              {/* Left source label */}
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    background: color,
                    borderRadius: 1,
                  }}
                />
                <Typography sx={{ fontWeight: 600 }}>{src}</Typography>
              </Box>

              {/* Metrics */}
              <Box
                display="flex"
                gap={2}
                minWidth={160}
                justifyContent="flex-end"
                alignItems="center"
              >
                <Typography sx={{ fontSize: "0.95rem", color: "#222" }}>
                  {count}
                </Typography>

                <Typography sx={{ fontSize: "0.9rem", color: "#666" }}>
                  {avgCost > 0 ? `₹${avgCost}` : "—"}
                </Typography>

                <Typography sx={{ fontSize: "0.9rem", color: "#08c4a6" }}>
                  {conversion}%
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Pagination Controls */}
      <Box display="flex" alignItems="center" justifyContent="flex-end" mt={2} gap={2}>
        <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>Page</Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
          size="small"
          sx={{
            '& .Mui-selected': {
              backgroundColor: '#181c20',
              color: '#fff',
              borderRadius: '8px',
            },
            '& .MuiPaginationItem-root': {
              minWidth: '32px',
              height: '32px',
              fontWeight: 600,
            },
          }}
        />
        <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>Rows:</Typography>
        <FormControl size="small" sx={{ minWidth: 60 }}>
          <Select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            sx={{
              background: '#181c20',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              '& .MuiSelect-icon': { color: '#fff' },
              '& .MuiOutlinedInput-notchedOutline': { border: 0 },
              height: '32px',
              fontSize: '1rem',
              pl: 1,
              pr: 2,
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  background: '#181c20',
                  color: '#fff',
                  borderRadius: '8px',
                },
              },
            }}
          >
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={4}>4</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default LeadsBySourceList;
