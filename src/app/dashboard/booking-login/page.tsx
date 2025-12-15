// app/dashboard/booking-login/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Fab,
  CircularProgress,
  useTheme,
  useMediaQuery,
  TableContainer,
  Snackbar,
  Button,
} from "@/components/ui/Component";
import Alert from "@/components/ui/Component/Alert";
import { Add, Delete, Edit, Visibility, Check, Close, Download } from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useBookingLogin } from "@/hooks/useBookingLogin";
import { useAuth } from "@/contexts/AuthContext";
import PermissionGuard from "@/components/PermissionGuard";
import BookingLoginDialog from "@/components/ui/BookingLoginDialog";
import BookingLoginActionBar from "@/components/ui/BookingLoginActionBar";
import BookingLoginCard from "@/components/ui/BookingLoginCard";
import ViewBookingModal from "@/components/ui/ViewBookingModal";
import {
  GRADIENTS,
  COMMON_STYLES,
  BOOKING_LOGIN_ROWS_PER_PAGE_OPTIONS,
  SEARCH_DEBOUNCE_DELAY,
  FAB_POSITION,
  BOOKING_LOGIN_PERMISSION_MODULE,
} from "@/constants/bookingLogin";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import { useDebounce } from "@/hooks/useDebounce";

const TableMap = dynamic(() => import("@/components/ui/table/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(() => import("@/components/ui/Navigation/Pagination"), {
  ssr: false,
});

const BookingLogin: React.FC = () => {
  const { hasAccountsRole, user } = useAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);
  const [projectFilter, setProjectFilter] = useState("");
  const [teamHeadFilter, setTeamHeadFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); 
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [projectOptions, setProjectOptions] = useState<string[]>([]);
  const [teamHeadOptions, setTeamHeadOptions] = useState<string[]>([]);

  const {
    bookings,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    saving,
    setOpen,
    open,
    editId,
    setEditId,
    addBooking,
    updateBooking,
    deleteBooking,
    updateBookingStatus,
    loadBookings,
    exportBookings,
  } = useBookingLogin(debouncedSearch, projectFilter, teamHeadFilter, statusFilter);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Extract unique project names and team heads from bookings
  useEffect(() => {
    if (bookings.length > 0) {
      // Extract unique project names
      const projects = [...new Set(bookings.map(booking => booking.projectName).filter(Boolean))] as string[];
      setProjectOptions(projects);

      // Extract unique team head names
      const teamHeads = [...new Set(bookings.map(booking => booking.teamHeadName).filter(Boolean))] as string[];
      setTeamHeadOptions(teamHeads);
    } else {
      setProjectOptions([]);
      setTeamHeadOptions([]);
    }
  }, [bookings]);

  // Handle Export
  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      // Prepare filters for export
      const exportFilters = {
        startDate: startDateFilter,
        endDate: endDateFilter,
        projectFilter,
        teamHeadFilter,
        statusFilter
      };

      await exportBookings(exportFilters);
      
      setSnackbarMessage("Export completed successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Export failed:", error);
      setSnackbarMessage("Failed to export bookings");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setExportLoading(false);
    }
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    [setSearch, setPage]
  );

  const handleProjectFilterChange = useCallback((value: string) => {
    setProjectFilter(value);
    setPage(1);
  }, [setPage]);

  const handleTeamHeadFilterChange = useCallback((value: string) => {
    setTeamHeadFilter(value);
    setPage(1);
  }, [setPage]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    setPage(1);
  }, [setPage]);

  const handleClearFilters = useCallback(() => {
    setProjectFilter("");
    setTeamHeadFilter("");
    setStatusFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
    setPage(1);
  }, [setPage]);

  // Calculate filter summary
  const getFilterSummary = () => {
    const summary = [];
    
    if (projectFilter) summary.push(`Project: ${projectFilter}`);
    if (teamHeadFilter) summary.push(`Team Head: ${teamHeadFilter}`);
    if (statusFilter) {
      const statusLabel = STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label || statusFilter;
      summary.push(`Status: ${statusLabel}`);
    }
    if (startDateFilter || endDateFilter) {
      const dateRange = [];
      if (startDateFilter) dateRange.push(`From: ${new Date(startDateFilter).toLocaleDateString()}`);
      if (endDateFilter) dateRange.push(`To: ${new Date(endDateFilter).toLocaleDateString()}`);
      summary.push(dateRange.join(' '));
    }
    
    return summary;
  };

  const handlePageSizeChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setPage(1);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedBooking(null);
    setEditId(null);
  };

  const hasAdminAccess = () => {
  const roleName = user?.currentRole?.name?.toLowerCase();
  const isSystemAdmin = user?.isSystemAdmin;
  
  return roleName === 'accounts' || roleName === 'admin' || isSystemAdmin;
};

const handleEditBooking = (booking: any) => {
  // Prevent editing of submitted/approved/rejected bookings for non-accounts users
  if (!hasAccountsRole() && booking.status !== 'draft') {
    setSnackbarMessage("Cannot edit submitted booking. Only draft bookings can be edited.");
    setSnackbarSeverity("warning");
    setSnackbarOpen(true);
    return;
  }
  
  // Prevent editing of approved/rejected bookings for accounts users
  if (hasAccountsRole() && (booking.status === 'approved' || booking.status === 'rejected')) {
    setSnackbarMessage("Cannot edit approved or rejected bookings");
    setSnackbarSeverity("warning");
    setSnackbarOpen(true);
    return;
  }
  
  setSelectedBooking(booking);
  setEditId(booking._id);
  setOpen(true);
};

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedBooking(null);
  };

  const handleDeleteBooking = async (booking: any) => {
    if (window.confirm(`Are you sure you want to delete booking for ${booking.customer1Name}?`)) {
      try {
        await deleteBooking(booking._id);
        setSnackbarMessage("Booking deleted successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage("Failed to delete booking");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  // Handle approve booking
  const handleApproveBooking = async (bookingId: string) => {
    if (!hasAccountsRole()) {
      setSnackbarMessage("Only Accounts role can approve bookings");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      await updateBookingStatus(bookingId, 'approved');
      setSnackbarMessage("Booking approved successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      await loadBookings();
    } catch (error) {
      setSnackbarMessage("Failed to approve booking");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Handle reject booking
  const handleRejectBooking = async (bookingId: string) => {
    if (!hasAccountsRole()) {
      setSnackbarMessage("Only Accounts role can reject bookings");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const rejectionReason = prompt('Please enter rejection reason:');
    if (!rejectionReason) {
      setSnackbarMessage("Rejection reason is required");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      await updateBookingStatus(bookingId, 'rejected', rejectionReason);
      setSnackbarMessage("Booking rejected successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      await loadBookings();
    } catch (error) {
      setSnackbarMessage("Failed to reject booking");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const getInitialBookingForm = (booking: any) => {
    if (!booking) return {};

    const safeBooking = Object.fromEntries(
      Object.entries(booking || {}).filter(
        ([_, v]) => v !== undefined && v !== null
      )
    );

    return {
      ...safeBooking,
      transactionDate: safeBooking.transactionDate 
        ? new Date(safeBooking.transactionDate).toISOString().slice(0, 10)
        : "",
    };
  };

  const bookingTableHeader = [
    { label: "Project", dataKey: "projectName" },
    { label: "Customer", dataKey: "customer1Name" },
    { label: "Phone", dataKey: "phoneNo" },
    { label: "Unit No", dataKey: "unitNo" },
    { label: "Area", dataKey: "area" },
    { 
      label: "Status", 
      dataKey: "status",
      component: (row: any) => (
        <Box display="flex" gap={1} alignItems="center">
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              backgroundColor: 
                row.status === 'approved' ? 'success.light' :
                row.status === 'rejected' ? 'error.light' :
                row.status === 'submitted' ? 'primary.light' : 'grey.300',
              color: 
                row.status === 'approved' ? 'success.dark' :
                row.status === 'rejected' ? 'error.dark' :
                row.status === 'submitted' ? 'primary.dark' : 'grey.700',
            }}
          >
            {row.status}
          </Box>
        </Box>
      )
    },
    { 
      label: "Created By", 
      dataKey: "createdBy.name",
      component: (row: any) => (
        <Box>
          {row.createdBy?.name || "N/A"}
          {row.createdBy?.employeeProfileId && (
            <Typography variant="caption" display="block" color="text.secondary">
              ID: {row.createdBy.employeeProfileId}
            </Typography>
          )}
        </Box>
      )
    },
    { 
      label: "Actions", 
      component: (row: any) => (
        <Box display="flex" gap={1}>
          <PermissionGuard
            module={BOOKING_LOGIN_PERMISSION_MODULE}
            action="read"
            fallback={null}
          >
            <Box
              component="button"
              onClick={() => handleViewBooking(row)}
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'primary.main',
                p: 0.5,
                borderRadius: 1,
                '&:hover': { backgroundColor: 'primary.light', color: 'white' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 32,
                minHeight: 32,
              }}
              title="View Booking"
            >
              <Visibility/>
            </Box>
          </PermissionGuard>
          <PermissionGuard
            module={BOOKING_LOGIN_PERMISSION_MODULE}
            action="write"
            fallback={null}
          >
            <Box
              component="button"
              onClick={() => handleEditBooking(row)}
              disabled={(!hasAccountsRole() && row.status !== 'draft') || 
              (hasAccountsRole() && (row.status === 'approved' || row.status === 'rejected'))}
              sx={{
                border: 'none',
                background: 'none',
                cursor: ((!hasAccountsRole() && row.status !== 'draft') || 
               (hasAccountsRole() && (row.status === 'approved' || row.status === 'rejected'))) 
                ? 'not-allowed' : 'pointer',
                color: ((!hasAccountsRole() && row.status !== 'draft') || 
              (hasAccountsRole() && (row.status === 'approved' || row.status === 'rejected'))) 
               ? 'grey.400' : 'secondary.main',
                p: 0.5,
                borderRadius: 1,
                '&:hover': { 
        backgroundColor: ((!hasAccountsRole() && row.status !== 'draft') || 
                         (hasAccountsRole() && (row.status === 'approved' || row.status === 'rejected'))) 
                          ? 'transparent' : 'secondary.light', 
        color: ((!hasAccountsRole() && row.status !== 'draft') || 
                (hasAccountsRole() && (row.status === 'approved' || row.status === 'rejected'))) 
                 ? 'grey.400' : 'white' 
      },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 32,
                minHeight: 32,
              }}
              title={
      (!hasAccountsRole() && row.status !== 'draft') 
        ? "Cannot edit submitted booking. Only draft bookings can be edited." 
        : (hasAccountsRole() && (row.status === 'approved' || row.status === 'rejected'))
          ? "Cannot edit approved or rejected bookings"
          : "Edit Booking"
    }
            >
              <Edit fontSize="small" />
            </Box>
          </PermissionGuard>
          <PermissionGuard
            module={BOOKING_LOGIN_PERMISSION_MODULE}
            action="delete"
            fallback={null}
          >
            <Box
              component="button"
              onClick={() => handleDeleteBooking(row)}
              disabled={!hasAccountsRole() && row.status !== 'draft'}
              sx={{
                border: 'none',
                background: 'none',
                cursor: (!hasAccountsRole() && row.status !== 'draft') ? 'not-allowed' : 'pointer',
                color: (!hasAccountsRole() && row.status !== 'draft') ? 'grey.400' : 'error.main',
                p: 0.5,
                borderRadius: 1,
                '&:hover': { 
                  backgroundColor: (!hasAccountsRole() && row.status !== 'draft') ? 'transparent' : 'error.light', 
                  color: (!hasAccountsRole() && row.status !== 'draft') ? 'grey.400' : 'white' 
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 32,
                minHeight: 32,
              }}
              title={
                (!hasAccountsRole() && row.status !== 'draft') 
                  ? "Only draft bookings can be deleted" 
                  : "Delete Booking"
              }
            >
              <Delete/>
            </Box>
          </PermissionGuard>
        </Box>
      )
    },
  ];

  return (
    <Box sx={MODULE_STYLES.users.usersContainer}>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                mb: 0.5,
              }}
            >
              Booking Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasAccountsRole() 
                ? "All bookings (Admin/Accounts View)" 
                : "Your bookings (Personal View)"}
            </Typography>
          </Box>
          
          {!hasAccountsRole() && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="primary.main" fontWeight="bold">
                Note:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                You can only see bookings created by you
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Action Bar with Filters */}
        <BookingLoginActionBar
          search={search}
          onSearchChange={handleSearchChange}
          onAdd={() => setOpen(true)}
          saving={saving}
          projectFilter={projectFilter}
          onProjectFilterChange={handleProjectFilterChange}
          teamHeadFilter={teamHeadFilter}
          onTeamHeadFilterChange={handleTeamHeadFilterChange}
          statusFilter={statusFilter} 
          onStatusFilterChange={handleStatusFilterChange}
          endDateFilter={endDateFilter}
          onEndDateFilterChange={setEndDateFilter}
          onExport={handleExport}
          exportLoading={exportLoading} 
          projectOptions={projectOptions}
          teamHeadOptions={teamHeadOptions}
        />

        {/* Filter Summary */}
        {getFilterSummary().length > 0 && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.dark">
              Active Filters: {getFilterSummary().join(' | ')}
            </Typography>
          </Box>
        )}

        {/* Clear Filters Button */}
        {getFilterSummary().length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleClearFilters}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.light',
                }
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}

        {/* Clear Filters Button when any filter is active */}
        {(projectFilter || teamHeadFilter || statusFilter) && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleClearFilters}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.light',
                }
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4, p: 3 }}>
          <Box sx={{ maxWidth: 400, margin: '0 auto' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {hasAccountsRole() 
                ? "No bookings found" 
                : "No bookings created yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {hasAccountsRole() 
                ? (search || projectFilter || teamHeadFilter || statusFilter 
                    ? "Try adjusting your search or filter criteria" 
                    : "No bookings have been created by any user yet")
                : (search || projectFilter || teamHeadFilter || statusFilter 
                    ? "Try adjusting your search or filter criteria" 
                    : "You haven't created any bookings yet")}
            </Typography>
            
            {!hasAccountsRole() && (
              <PermissionGuard module="booking-login" action="write" fallback={null}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpen(true)}
                  sx={{ 
                    borderRadius: 2,
                    background: "#1976d2",
                    "&:hover": {
                      background: "#1976d2",
                    },
                  }}
                >
                  Create Your First Booking
                </Button>
              </PermissionGuard>
            )}
          </Box>
        </Box>
      ) : isMobile ? (
        <Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 1.5,
              mb: 2,
            }}
          >
            {bookings.map((booking) => (
              <BookingLoginCard
                key={booking._id}
                booking={booking}
                onEdit={() => handleEditBooking(booking)}
                onView={() => handleViewBooking(booking)}
                onDelete={() => handleDeleteBooking(booking)}
                onApprove={hasAccountsRole() ? () => handleApproveBooking(booking._id) : undefined}
                onReject={hasAccountsRole() ? () => handleRejectBooking(booking._id) : undefined}
                hasAccountsRole={hasAccountsRole()}
              />
            ))}
          </Box>
          <Box sx={MODULE_STYLES.leads.paginationWrapper}>
            <Pagination
              page={page}
              pageSize={rowsPerPage}
              total={totalItems}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={BOOKING_LOGIN_ROWS_PER_PAGE_OPTIONS}
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
            <TableMap
              data={bookings}
              header={bookingTableHeader}
              onEdit={() => {}}
              onDelete={() => {}}
              size={
                typeof window !== "undefined" && window.innerWidth < 600
                  ? "small"
                  : "medium"
              }
              stickyHeader
            />
          </TableContainer>

          <Box sx={MODULE_STYLES.leads.paginationWrapper}>
            <Pagination
              page={page}
              pageSize={rowsPerPage}
              total={totalItems}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={BOOKING_LOGIN_ROWS_PER_PAGE_OPTIONS}
            />
          </Box>
        </Box>
      )}

      {/* View Booking Modal */}
      <ViewBookingModal
        open={viewModalOpen}
        booking={selectedBooking}
        onClose={handleCloseViewModal}
        onApprove={hasAccountsRole() ? () => selectedBooking && handleApproveBooking(selectedBooking._id) : undefined}
        onReject={hasAccountsRole() ? () => selectedBooking && handleRejectBooking(selectedBooking._id) : undefined}
      />

      <PermissionGuard
        module={BOOKING_LOGIN_PERMISSION_MODULE}
        action="write"
        fallback={<></>}
      >
        <BookingLoginDialog
          open={open}
          editId={editId}
          initialData={getInitialBookingForm(selectedBooking)}
          saving={saving}
          onClose={handleCloseDialog}
          onSave={async (values) => {
            try {
              if (editId) {
                await updateBooking(editId, values);
                setSnackbarMessage("Booking updated successfully");
              } else {
                await addBooking(values);
                setSnackbarMessage("Booking created successfully");
              }

              setSnackbarSeverity("success");
              setSnackbarOpen(true);

              handleCloseDialog();
              setPage(1);
              setSearch("");
              await loadBookings();
            } catch (err: any) {
              const status = err?.status || (err?.response && err.response.status);
              const message = err?.message || 
                (err?.response && err.response.data && err.response.data.message) ||
                "Failed to save booking";
              
              setSnackbarMessage(message);
              setSnackbarSeverity("error");
              setSnackbarOpen(true);
            }
          }}
        />
      </PermissionGuard>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingLogin;

