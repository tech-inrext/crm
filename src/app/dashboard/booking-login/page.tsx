// app/dashboard/booking-login/page.tsx

"use client";

import React, { useState, useCallback } from "react";
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
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { Add, Delete, Edit, Visibility, Check, Close } from "@mui/icons-material";
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

const TableMap = dynamic(() => import("@/components/ui/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(() => import("@/components/ui/Pagination"), {
  ssr: false,
});

const BookingLogin: React.FC = () => {
  const { hasAccountsRole } = useAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);
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
  } = useBookingLogin(debouncedSearch);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    [setSearch, setPage]
  );

  const handlePageSizeChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setPage(1);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedBooking(null);
    setEditId(null);
  };

  const handleEditBooking = (booking: any) => {
    // Prevent editing of approved/rejected bookings for non-accounts users
    if (!hasAccountsRole() && (booking.status === 'approved' || booking.status === 'rejected')) {
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
          
          {/* Show approve/reject buttons only for Accounts role and submitted status */}
          {hasAccountsRole() && row.status === 'submitted' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<Check />}
                onClick={() => handleApproveBooking(row._id)}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<Close />}
                onClick={() => handleRejectBooking(row._id)}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                Reject
              </Button>
            </>
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
              sx={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'secondary.main',
                p: 0.5,
                borderRadius: 1,
                '&:hover': { backgroundColor: 'secondary.light', color: 'white' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 32,
                minHeight: 32,
              }}
              title="Edit Booking"
            >
              <Edit/>
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
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            mb: { xs: 2, md: 3 },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Booking Login
        </Typography>
        <BookingLoginActionBar
          search={search}
          onSearchChange={handleSearchChange}
          onAdd={() => setOpen(true)}
          saving={saving}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : bookings.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No bookings found.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {search ? "Try adjusting your search criteria" : "Create your first booking to get started"}
          </Typography>
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
        {/* <Fab
          color="primary"
          aria-label="add booking"
          onClick={() => setOpen(true)}
          disabled={saving}
          sx={{
            position: "fixed",
            bottom: FAB_POSITION.bottom,
            right: FAB_POSITION.right,
            background: GRADIENTS.button,
            display: { xs: "flex", md: "none" },
            zIndex: FAB_POSITION.zIndex,
            boxShadow: 3,
            "&:hover": { background: GRADIENTS.buttonHover },
          }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : <Add />}
        </Fab> */}
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



