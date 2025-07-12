"use client";

// React & Core
import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Fab,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useLeads } from "@/hooks/useLeads";
import {
  GRADIENTS,
  ROWS_PER_PAGE_OPTIONS,
  COMMON_STYLES,
} from "@/constants/leads";
import PermissionGuard from "@/components/PermissionGuard";
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
const BulkUpload = dynamic(() => import("@/components/leads/bulkUpload"), {
  ssr: false,
});
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import { leadsTableHeader } from "@/components/leads/LeadsTableHeaderConfig";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import {
  getDefaultLeadFormData,
  transformAPILeadToForm,
} from "@/utils/leadUtils";
import Pagination from "@/components/ui/Pagination";

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
    loadLeads,
    saveLead,
  } = useLeads();
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filtered leads (search)
  const filteredLeads = useMemo(() => {
    if (!search) return leads;
    return leads.filter(
      (lead) =>
        lead.name?.toLowerCase().includes(search.toLowerCase()) ||
        lead.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [leads, search]);

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, page, rowsPerPage]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        setSearch(value);
        setPage(1);
      }, 300);
    },
    [setSearch]
  );
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
  // When editId changes, update formData to show existing details in dialog
  React.useEffect(() => {
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
    <Box
      sx={{
        p: { xs: 0.5, sm: 1, md: 2 },
        pt: { xs: 1, sm: 2, md: 3 },
        minHeight: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          borderRadius: { xs: 1, sm: 2, md: 3 },
          mb: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 0.5, sm: 1, md: 2 },
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            fontSize: { xs: "1.3rem", sm: "2rem", md: "2.5rem" },
            mb: { xs: 1.5, md: 3 },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Leads
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: { xs: 1, sm: 2, md: 3 },
            mb: { xs: 1, sm: 2, md: 3 },
          }}
        >
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
          search={search}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAdd={() => setOpen(true)}
          saving={saving}
          loadLeads={loadLeads}
        />
      </Paper>
      {loading ? (
        <LoadingSkeleton />
      ) : isMobile || viewMode === "cards" ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: { xs: 1.5, sm: 2, md: 3 },
            mb: { xs: 2, sm: 3 },
          }}
        >
          {paginatedLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={() => {
                setEditId(lead._id);
                setOpen(true);
              }}
              onDelete={() => { }}
            />
          ))}
          <Pagination
            total={filteredLeads.length}
            page={page}
            onPageChange={setPage}
            pageSize={rowsPerPage}
            onPageSizeChange={(size) => {
              setRowsPerPage(size);
              setPage(1);
            }}
            pageSizeOptions={[3, 6, 12, 24]}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            overflowX: { xs: "auto", md: "visible" },
            mb: { xs: 2, sm: 3 },
          }}
        >
          <TableContainer
            component={Paper}
            elevation={8}
            sx={{
              ...COMMON_STYLES.roundedPaper,
              minWidth: 600,
              width: "100%",
              overflow: "auto",
            }}
          >
            <Table
              size={
                typeof window !== "undefined" && window.innerWidth < 600
                  ? "small"
                  : "medium"
              }
            >
              <LeadsTableHeader header={leadsTableHeaderWithActions} />
              <TableBody>
                {paginatedLeads.map((row) => (
                  <LeadsTableRow
                    key={row.id}
                    row={row}
                    header={leadsTableHeaderWithActions}
                    onEdit={() => {
                      setEditId(row._id);
                      setOpen(true);
                    }}
                    onDelete={() => { }}
                  />
                ))}
              </TableBody>
            </Table>
            <Pagination
              total={filteredLeads.length}
              page={page}
              onPageChange={setPage}
              pageSize={rowsPerPage}
              onPageSizeChange={(size) => {
                setRowsPerPage(size);
                setPage(1);
              }}
              pageSizeOptions={[3, 6, 12, 24]}
            />
          </TableContainer>
        </Box>
      )}
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
            // Optionally show a notification or error dialog here
            console.error("Failed to save lead:", error);
          }
        }}
      />
      <PermissionGuard module="lead" action="write" fallback={<></>}>
        <Fab
          color="primary"
          aria-label="add lead"
          onClick={() => setOpen(true)}
          disabled={saving}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: GRADIENTS.button,
            display: { xs: "flex", md: "none" },
            zIndex: 1201,
            boxShadow: 3,
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
