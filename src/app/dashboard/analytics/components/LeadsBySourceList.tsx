import React, { useState, useMemo } from "react";
import Box from "@/components/ui/Component/Box";
import Typography from "@/components/ui/Component/Typography";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

interface LeadsBySourceMetrics {
  map: Record<string, any>;
  sourcesOrder?: string[];
  slices?: Array<{ label: string; value: number; color?: string }>;
}

const LeadsBySourceList: React.FC<{
  leadsBySourceMetrics: LeadsBySourceMetrics;
}> = ({ leadsBySourceMetrics }) => {
  const { map = {}, slices = [] } = leadsBySourceMetrics;

  // 🔥 Always derive sources from map keys (more reliable)
  const sources = useMemo(() => Object.keys(map), [map]);

  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(sources.length / rowsPerPage));

  const paginatedSources = sources.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const handleChangePage = (_: any, value: number) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

  return (
    <Box width="100%" maxWidth={400}>
      <Box display="flex" flexDirection="column" gap={1}>
        {sources.length === 0 && (
          <Typography sx={{ color: "#666" }}>No leads available</Typography>
        )}

        {paginatedSources.map((src) => {
          const m = map[src] || {};
          const count = m.count || 0;
          const converted = m.converted || 0;

          // ✅ Correct conversion %
          const conversion =
            count > 0 ? Math.round((converted / count) * 100) : 0;

          const avgCost =
            count > 0 ? Math.round((m.totalCost || 0) / count) : 0;

          const color = slices.find((s) => s.label === src)?.color || "#ddd";

          return (
            <div
              key={src}
              className="flex justify-between items-center px-[10px] py-2 rounded-xl bg-white border border-[#f3f3f3]"
            >
              {/* Source Label */}
              <div className="flex items-center gap-2">
                <div
                  className="rounded"
                  style={{
                    width: 12,
                    height: 12,
                    background: color,
                  }}
                />
                <span className="font-semibold">{src}</span>
              </div>

              {/* Metrics */}
              <div className="flex gap-5 min-w-[170px] justify-end items-center">
                <span className="text-[0.95rem] text-[#222]">{count}</span>
                {/* <span className="text-[0.9rem] text-[#666]">
                  {avgCost > 0 ? `₹${avgCost}` : "—"}
                </span> */}
                {/* <span className="text-[0.9rem] text-[#08c4a6]">
                  {conversion}%
                </span> */}
              </div>
            </div>
          );
        })}
      </Box>

      {/* Pagination */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        mt={2}
        gap={2}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          size="small"
        />

        <FormControl size="small" sx={{ minWidth: 60 }}>
          <Select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={6}>6</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default LeadsBySourceList;
