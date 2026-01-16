"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Fab,
  CircularProgress,
  Snackbar,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@/components/ui/Component";
import Alert from "@/components/ui/Component/Alert";
import {
  Add,
  Edit as EditIcon,
  Feedback as FeedbackIcon,
  Badge,
  PermissionGuard,
  LocationOn,
} from "@/components/ui/Component";
import { useDebounce } from "@/hooks/useDebounce";
import dynamic from "next/dynamic";
import { GRADIENTS } from "@/constants/leads";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import { leadsTableHeader } from "@/components/leads/LeadsTableHeaderConfig";
import { useLeadsPage } from "@/components/leads/hooks/useLeadsPage";
import { useLeadsSnackbar } from "@/components/leads/hooks/useLeadsSnackbar";
import { useLeadsFeedback } from "@/components/leads/hooks/useLeadsFeedback";
import { LeadsTableActions } from "@/components/leads/LeadsTableActions";
import { extractErrorMessage } from "@/utils/leadErrorHandler";
import LeadDetailsDialog from "@/components/leads/LeadDetailsDialog";

const LeadDialog = dynamic(() => import("@/components/leads/LeadDialog"), {
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
const FollowUpDialog = dynamic(
  () => import("@/components/leads/FollowUpDialog"),
  { ssr: false }
);
const SiteVisitDialog = dynamic(
  () => import("@/components/leads/SiteVisitDialog"),
  { ssr: false }
);
const LeadsTableView = dynamic(
  () => import("@/components/leads/LeadsTableView"),
  { ssr: false }
);
const LeadsCardsView = dynamic(
  () => import("@/components/leads/LeadsCardsView"),
  { ssr: false }
);

const Leads: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    leads,
    loading,
    saving,
    open,
    setOpen,
    editId,
    setEditId,
    formData,
    viewMode,
    setViewMode,
    searchInput,
    selectedStatuses,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    total,
    handleSearchChange,
    handleStatusChange,
    handleEdit,
    saveLead,
    updateLeadStatus,
    loadLeads,
    dialogMode,
    handleCloseDialog,
  } = useLeadsPage();

  const {
    showSnackbar,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleClose,
  } = useLeadsSnackbar();

  const { feedbackOpen, selectedLeadForFeedback, openFeedback, closeFeedback } =
    useLeadsFeedback();




  
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [selectedLeadForSiteVisit, setSelectedLeadForSiteVisit] = useState<string | null>(null);



  const leadsTableHeaderWithActions = leadsTableHeader.map((col) =>
    col.label === "Actions"
      ? {
        ...col,
        component: (row, { onEdit }) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 0.5,
              pl: 0.5,
            }}
          >
            <PermissionGuard module="lead" action="write" fallback={null}>
              <IconButton onClick={() => onEdit(row)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
            </PermissionGuard>

            {/* Site Visit Action */}
            <PermissionGuard module="lead" action="write" fallback={null}>
              <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedLeadForSiteVisit(row.leadId || row._id || row.id);
                    setSiteVisitOpen(true);
                  }}
                  title="Schedule Site Visit"
                >
                  <LocationOn fontSize="small" color="action" />
              </IconButton>
            </PermissionGuard>

            {/* Feedback button - available to any authenticated user */}
            <IconButton
              size="small"
              onClick={() => {
                openFeedback(row.leadId || row._id || row.id);
              }}
            >
              <Badge
                badgeContent={
                  row.followUpCount || (row.followUpNotes && row.followUpNotes.length) || 0
                }
                color="primary"
              >
                <FeedbackIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Box>
        ),
      }
      : col
  );

  const handleSaveLead = async (data: any) => {
    try {
      await saveLead(data, editId);
      showSnackbar(
        editId ? "Lead updated successfully" : "Lead created successfully",
        "success"
      );
      setOpen(false);
      setEditId(null);
    } catch (err: any) {
      const message = extractErrorMessage(err);
      showSnackbar(message, "error");
      console.error("Failed to save lead:", err);
    }
  };

  return (
    <Box sx={MODULE_STYLES.leads.leadsContainer}>
      <Paper elevation={2} sx={MODULE_STYLES.layout.headerPaper}>
        <Typography variant="h4" sx={MODULE_STYLES.layout.moduleTitle}>
          Leads
        </Typography>

        <LeadsActionBar
          search={searchInput}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAdd={() => setOpen(true)}
          saving={saving}
          loadLeads={loadLeads}
          selectedStatuses={selectedStatuses}
          onStatusesChange={handleStatusChange}
        />
      </Paper>

      {loading ? (
        <LoadingSkeleton />
      ) : isMobile || viewMode === "cards" ? (
        <LeadsCardsView
          leads={leads}
          onEdit={handleEdit}
          onStatusChange={updateLeadStatus}
          page={page}
          total={total}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onPageSizeChange={setRowsPerPage}
        />
      ) : (
        <LeadsTableView
          leads={leads}
          header={leadsTableHeaderWithActions}
          selectedStatuses={selectedStatuses}
          onStatusesChange={handleStatusChange}
          onEdit={handleEdit}
          onStatusChange={updateLeadStatus}
          page={page}
          total={total}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onPageSizeChange={setRowsPerPage}
        />
      )}

      {dialogMode === "view" ? (
        <LeadDetailsDialog
          open={open}
          onClose={handleCloseDialog}
          lead={formData}
        // We might need to pass users/employees list if needed for ID resolution, 
        // usually leads page fetches them or we can fetch them inside dialog like LeadDialog does.
        // LeadDialog fetches users on mount. We should probably do same or lift state.
        // For now, let's let LeadDetailsDialog handle it or pass empty if not available, 
        // but actually LeadDialog fetches it internally. 
        // Let's rely on name/email being present in formData or ID.
        // Ideally we pass the full `users` list if we have it in parent, but `useLeadsPage` doesn't expose it.
        // Let's update useLeadsPage to expose users if possible, or just fetch inside LeadDetailsDialog.
        />
      ) : (
        <LeadDialog
          open={open}
          editId={editId}
          initialData={formData}
          saving={saving}
          onClose={handleCloseDialog}
          readOnly={false}
          onSave={handleSaveLead}
        />
      )}

      <React.Suspense fallback={<div>Loading...</div>}>
        {feedbackOpen && selectedLeadForFeedback && (
          <FollowUpDialog
            open={feedbackOpen}
            onClose={closeFeedback}
            leadIdentifier={selectedLeadForFeedback}
            onSaved={async () => {
              await loadLeads(page + 1, rowsPerPage, searchInput);
            }}
          />
        )}
      </React.Suspense>
      
      {/* Site Visit Dialog */}
      <React.Suspense fallback={<div>Loading...</div>}>
        {siteVisitOpen && selectedLeadForSiteVisit && (
          <SiteVisitDialog
            open={siteVisitOpen}
            onClose={() => {
              setSiteVisitOpen(false);
              setSelectedLeadForSiteVisit(null);
            }}
            leadId={selectedLeadForSiteVisit}
            initialClientName={
              leads.find(l => (l.leadId || l._id || l.id) === selectedLeadForSiteVisit)?.fullName || 
              leads.find(l => (l.leadId || l._id || l.id) === selectedLeadForSiteVisit)?.name
            }
            initialProject={leads.find(l => (l.leadId || l._id || l.id) === selectedLeadForSiteVisit)?.propertyName}
            clientPhone={leads.find(l => (l.leadId || l._id || l.id) === selectedLeadForSiteVisit)?.phone}
            onSaved={async () => {
              showSnackbar("Site visit scheduled successfully", "success");
              await loadLeads(page + 1, rowsPerPage, searchInput);
            }}
          />
        )}
      </React.Suspense>

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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          handleClose();
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Leads;
