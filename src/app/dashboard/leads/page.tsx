"use client";

// React & Core
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Fab,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableContainer,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Add, Edit as EditIcon } from "@mui/icons-material";
import { useDebounce } from "@/hooks/useDebounce";
import dynamic from "next/dynamic";
import { useLeads } from "@/hooks/useLeads";
import { GRADIENTS, COMMON_STYLES } from "@/constants/leads";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import PermissionGuard from "@/components/PermissionGuard";
import {
  getDefaultLeadFormData,
  transformAPILeadToForm,
} from "@/utils/leadUtils";
import Pagination from "@/components/ui/Pagination";
import { leadsTableHeader } from "@/components/leads/LeadsTableHeaderConfig";

// Lazy Load Components
const LeadDialog = dynamic(() => import("@/components/leads/LeadDialog"), {
  ssr: false,
});
const LeadsTableHeader = dynamic(
  () => import("@/components/leads/LeadsTableHeader"),
  { ssr: false }
);
const LeadsTableRow = dynamic(
  () => import("@/components/leads/LeadsTableRow"),
  { ssr: false }
);
const LeadCard = dynamic(() => import("@/components/leads/LeadCard"), {
  ssr: false,
});
const StatsCard = dynamic(() => import("@/components/leads/StatsCard"), {
  ssr: false,
});
const LoadingSkeleton = dynamic(
  () => import("@/components/leads/LoadingSkeleton"),
  { ssr: false }
);
const LeadsActionBar = dynamic(
  () => import("@/components/leads/LeadsActionBar"),
  { ssr: false }
);

const Leads: React.FC = () => {
  const {
    leads,
    loading,
    saving,
    search,
    setSearch,
    open,
    setOpen,
    editId,
    setEditId,
    formData,
    setFormData,
    stats,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    total,
    loadLeads,
    saveLead,
  } = useLeads();

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500); // Debounce for 400ms

  // Sync debounced search with actual query state
  useEffect(() => {
    setSearch(debouncedSearch);
    setPage(0);
  }, [debouncedSearch, setSearch, setPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const leadsTableHeaderWithActions = leadsTableHeader.map((col) =>
    col.label === "Actions"
      ? {
          ...col,
          component: (row, { onEdit }) => (
            <PermissionGuard module="lead" action="write" fallback={null}>
              <IconButton onClick={() => onEdit(row)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </PermissionGuard>
          ),
        }
      : col
  );

  useEffect(() => {
    if (editId) {
      const lead = leads.find(
        (l) => l.id === editId || l._id === editId || l.leadId === editId
      );
      if (lead) {
        setFormData(transformAPILeadToForm(lead));
      }
    } else {
      setFormData(getDefaultLeadFormData());
    }
  }, [editId, leads, setFormData]);

  return (
    <Box sx={MODULE_STYLES.leads.leadsContainer}>
      {/* Heading + Stats */}
      <Paper elevation={2} sx={MODULE_STYLES.layout.headerPaper}>
        <Typography variant="h4" sx={MODULE_STYLES.layout.moduleTitle}>
          Leads
        </Typography>

        <Box sx={MODULE_STYLES.leads.statsGrid}>
          <StatsCard
            value={stats.total}
            label="Total Leads"
            color="primary.main"
          />
          <StatsCard value={stats.new} label="New Leads" color="info.main" />
          <StatsCard
            value={stats.closed}
            label="Closed Deals"
            color="success.main"
          />
          <StatsCard
            value={`${stats.conversion}%`}
            label="Conversion Rate"
            color="warning.main"
          />
        </Box>

        <LeadsActionBar
          search={searchInput}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAdd={() => setOpen(true)}
          saving={saving}
          loadLeads={loadLeads}
        />
      </Paper>

      {/* Body View */}
      {loading ? (
        <LoadingSkeleton />
      ) : isMobile || viewMode === "cards" ? (
        <Box>
          <Box sx={MODULE_STYLES.leads.cardsGrid}>
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEdit={() => {
                  setEditId(lead._id);
                  setOpen(true);
                }}
                onDelete={() => {}}
              />
            ))}
          </Box>
          {/* Pagination outside the cards grid */}
          <Box sx={MODULE_STYLES.leads.paginationWrapper}>
            <Pagination
              total={total}
              page={page + 1}
              onPageChange={(p) => setPage(p - 1)}
              pageSize={rowsPerPage}
              onPageSizeChange={(size) => {
                setRowsPerPage(size);
                setPage(0);
              }}
              pageSizeOptions={[5, 10, 15, 25]}
            />
          </Box>
        </Box>
      ) : (
        <Box sx={MODULE_STYLES.leads.tableWrapper}>
          <TableContainer
            component={Paper}
            elevation={8}
            sx={{
              ...COMMON_STYLES.roundedPaper,
              ...MODULE_STYLES.leads.tableContainer,
            }}
          >
            <Table
              stickyHeader
              size={MODULE_STYLES.common.getResponsiveTableSize()}
              sx={MODULE_STYLES.leads.table}
            >
              <LeadsTableHeader header={leadsTableHeaderWithActions} />
              <TableBody>
                {leads.map((row) => (
                  <LeadsTableRow
                    key={row.id}
                    row={row}
                    header={leadsTableHeaderWithActions}
                    onEdit={() => {
                      setEditId(row._id);
                      setOpen(true);
                    }}
                    onDelete={() => {}}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination outside the scrollable table */}
          <Box sx={MODULE_STYLES.leads.paginationWrapper}>
            <Pagination
              total={total}
              page={page + 1}
              onPageChange={(p) => setPage(p - 1)}
              pageSize={rowsPerPage}
              onPageSizeChange={(size) => {
                setRowsPerPage(size);
                setPage(0);
              }}
              pageSizeOptions={[5, 10, 15, 25, 50]}
            />
          </Box>
        </Box>
      )}

      {/* Dialog */}
      <LeadDialog
        open={open}
        editId={editId}
        initialData={formData}
        saving={saving}
        onClose={() => {
          setOpen(false);
          setEditId(null);
        }}
        onSave={async (data) => {
          try {
            await saveLead(data, editId);
            setOpen(false);
            setEditId(null);
          } catch (error) {
            console.error("Failed to save lead:", error);
          }
        }}
      />

      {/* Mobile Add Button */}
      <PermissionGuard module="lead" action="write" fallback={<></>}>
        <Fab
          color="primary"
          aria-label="add lead"
          onClick={() => setOpen(true)}
          disabled={saving}
          sx={{
            ...MODULE_STYLES.layout.mobileFab,
            background: GRADIENTS.button,
            "&:hover": { background: GRADIENTS.buttonHover },
          }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : <Add />}
        </Fab>
      </PermissionGuard>
    </Box>
  );
};

export default Leads;
