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
  status?: string | null;
  onStatusChange?: (status: string | null) => void;
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
  status = null,
  onStatusChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleOpenMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => setAnchorEl(null), []);

  const handleSelect = useCallback(
    (value: string) => {
      onStatusChange?.(value || null);
      handleCloseMenu();
    },
    [onStatusChange, handleCloseMenu]
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
                    MenuListProps={{ sx: { minWidth: 160 } }}
                  >
                    {LEAD_STATUSES.map((opt) => (
                      <MenuItem key={opt} onClick={() => handleSelect(opt)}>
                        {opt || "All Statuses"}
                      </MenuItem>
                    ))}
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
