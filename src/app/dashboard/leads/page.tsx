"use client";

<<<<<<< HEAD
import React, { useMemo, useState, useEffect } from "react";
=======
import React, { useMemo, useState } from "react";
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
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
<<<<<<< HEAD
=======
  { ssr: false }
);
const LeadsTableView = dynamic(
  () => import("@/components/leads/LeadsTableView"),
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
  { ssr: false }
);
const LeadsCardsView = dynamic(
  () => import("@/components/leads/LeadsCardsView"),
  { ssr: false }
);
const LeadsTableView = dynamic(
  () => import("@/components/leads/LeadsTableView"),
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
    setSelectedStatuses,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    total,
    search,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
    handleSearchChange,
    handleStatusChange,
    handleEdit,
    saveLead: handleSaveLead,
    updateLeadStatus,
    loadLeads,
<<<<<<< HEAD
    handleClose,
=======
    dialogMode,
    handleCloseDialog,
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
  } = useLeadsPage();

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedLeadForFeedback, setSelectedLeadForFeedback] = useState<
    string | null
  >(null);
  
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

<<<<<<< HEAD
            {/* Site Visit Action */}
            <PermissionGuard module="lead" action="write" fallback={null}>
              <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedLeadForSiteVisit(row.leadId || row._id || row.id);
=======
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [selectedLeadForSiteVisit, setSelectedLeadForSiteVisit] = useState<
    string | null
  >(null);

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
                    setSelectedLeadForSiteVisit(
                      row.leadId || row._id || row.id
                    );
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
                    setSiteVisitOpen(true);
                  }}
                  title="Schedule Site Visit"
                >
                  <LocationOn fontSize="small" color="action" />
<<<<<<< HEAD
              </IconButton>
            </PermissionGuard>

            {/* Feedback button - available to any authenticated user */}
            <IconButton
              size="small"
              onClick={() => {
                setSelectedLeadForFeedback(row.leadId || row._id || row.id);
                setFeedbackOpen(true);
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
=======
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
                    row.followUpCount ||
                    (row.followUpNotes && row.followUpNotes.length) ||
                    0
                  }
                  color="primary"
                >
                  <FeedbackIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Box>
          ),
        }
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
      : col
  );

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
            onClose={() => {
              setFeedbackOpen(false);
              setSelectedLeadForFeedback(null);
            }}
            leadIdentifier={selectedLeadForFeedback}
            onSaved={async () => {
              // refresh leads after saving follow-up
              await loadLeads(page + 1, rowsPerPage, search);
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
              setSnackbarMessage("Site visit scheduled successfully");
              setSnackbarSeverity("success");
              setSnackbarOpen(true);
              await loadLeads(page + 1, rowsPerPage, search);
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
              leads.find(
                (l) => (l.leadId || l._id || l.id) === selectedLeadForSiteVisit
              )?.fullName ||
              leads.find(
                (l) => (l.leadId || l._id || l.id) === selectedLeadForSiteVisit
              )?.name
            }
            initialProject={
              leads.find(
                (l) => (l.leadId || l._id || l.id) === selectedLeadForSiteVisit
              )?.propertyName
            }
            clientPhone={
              leads.find(
                (l) => (l.leadId || l._id || l.id) === selectedLeadForSiteVisit
              )?.phone
            }
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
