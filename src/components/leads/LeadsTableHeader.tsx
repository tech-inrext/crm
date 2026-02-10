import React, { useCallback, useMemo, useState } from "react";
import { LEAD_STATUSES } from "@/constants/leads";
import {
  TableHead,
  TableRow,
  TableCell,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from "@/components/ui/Component";

type HeaderCol = {
  label: string;
  dataKey?: string;
  component?: (row: unknown, handlers: unknown) => React.ReactNode;
};

interface LeadsTableHeaderProps {
  header: HeaderCol[];
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
}

const headerRowStyles = {
  fontWeight: 800,
  color: "white",
  fontSize: { xs: 13, sm: 15, md: 16 },
  px: { xs: 1.5, sm: 2.5 },
  py: { xs: 2, sm: 2.5 },
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  background: "transparent",
  borderBottom: "none",
};

const LeadsTableHeader: React.FC<LeadsTableHeaderProps> = ({
  header,
  selectedStatuses = [],
  onStatusesChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleOpenMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => setAnchorEl(null), []);

  const handleSelect = useCallback(
    (value: string) => {
      if (!value) {
        onStatusesChange([]);
        handleCloseMenu();
        return;
      }

      const newStatuses = selectedStatuses.includes(value)
        ? selectedStatuses.filter((s) => s !== value)
        : [...selectedStatuses, value];

      onStatusesChange(newStatuses);
    },
    [selectedStatuses, onStatusesChange, handleCloseMenu]
  );

  const renderedHeader = useMemo(
    () =>
      header.map((col) => {
        const isActions = col.label === "Actions";
        const isStatus = col.label === "Status";

        return (
          <TableCell
            key={col.label}
            sx={{
              ...headerRowStyles,
              textAlign: isActions ? "center" : "left",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isStatus ? (
                <>
                  <Box component="span" sx={{ fontWeight: 800 }}>
                    {col.label}
                  </Box>

                  <Tooltip title="Open status filter">
                    <IconButton
                      size="small"
                      onClick={handleOpenMenu}
                      sx={{ p: 0.5, background: "rgba(255,255,255,0.06)" }}
                      aria-controls={open ? "status-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
                      </svg>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    id="status-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleCloseMenu}
                    MenuListProps={{ sx: { minWidth: 200, py: 0.5 } }}
                  >
                    <MenuItem
                      onClick={() => handleSelect("")}
                      sx={{ fontWeight: "bold", borderBottom: "1px solid rgba(0,0,0,0.08)" }}
                    >
                      All Statuses
                    </MenuItem>
                    {LEAD_STATUSES.filter(Boolean).map((opt) => (
                      <MenuItem
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes(opt)}
                            readOnly
                            style={{ cursor: "pointer" }}
                          />
                          <Box component="span" sx={{ textTransform: "capitalize" }}>
                            {opt}
                          </Box>
                        </Box>
                        {selectedStatuses.includes(opt) && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                            }}
                          />
                        )}
                      </MenuItem>
                    ))}
                    {selectedStatuses.length > 0 && (
                      <MenuItem
                        onClick={() => {
                          onStatusesChange([]);
                          handleCloseMenu();
                        }}
                        sx={{
                          color: "error.main",
                          fontSize: "0.8rem",
                          justifyContent: "center",
                          borderTop: "1px solid rgba(0,0,0,0.08)",
                          mt: 0.5,
                        }}
                      >
                        Clear All
                      </MenuItem>
                    )}
                  </Menu>
                </>
              ) : (
                col.label
              )}
            </Box>
          </TableCell>
        );
      }),
    [header, anchorEl, open, handleOpenMenu, handleCloseMenu, handleSelect]
  );

  return (
    <TableHead>
      <TableRow
        sx={{
          "& .MuiTableCell-head": {
            backgroundColor: "#1976d2",
            color: "white",
            fontWeight: "bold",
            borderBottom: "none",
          }
        }}
      >
        {renderedHeader}
      </TableRow>

    </TableHead>
  );
};

export default React.memo(LeadsTableHeader);
