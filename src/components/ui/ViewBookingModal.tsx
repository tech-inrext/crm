// components/ui/ViewBookingModal.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  Close,
  ZoomIn,
  ZoomOut,
  Download,
  Visibility,
  GetApp,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";

interface ViewBookingModalProps {
  open: boolean;
  booking: any;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const ViewBookingModal: React.FC<ViewBookingModalProps> = ({
  open,
  booking,
  onClose,
  onApprove,
  onReject,
}) => {
  const { hasAccountsRole } = useAuth();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!booking) return null;

  const formatCurrency = (value: any) => {
    if (!value || value === "" || isNaN(parseFloat(value))) return "₹0";
    return `₹${parseFloat(value).toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    if (typeof window === "undefined") return "Recently"; // SSR fallback
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "submitted":
        return "primary";
      default:
        return "default";
    }
  };

  const getPlcTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "PLC %";
      case "per_sq_ft":
        return "PLC / s.q.f.t";
      case "per_sq_yard":
        return "PLC / s.q.y.d";
      case "unit":
        return "PLC / unit";
      default:
        return "N/A";
    }
  };

  const getPaymentModeLabel = (mode: string) => {
    switch (mode) {
      case "cheque":
        return "Cheque";
      case "online":
        return "Online";
      case "cash":
        return "Cash";
      default:
        return "N/A";
    }
  };

  const getPaymentDetails = () => {
    switch (booking.paymentMode) {
      case "cheque":
        return booking.chequeNumber
          ? `Cheque No: ${booking.chequeNumber}`
          : "N/A";
      case "online":
        return booking.transactionId
          ? `Transaction ID: ${booking.transactionId}`
          : "N/A";
      case "cash":
        return booking.cashReceiptNumber
          ? `Receipt No: ${booking.cashReceiptNumber}`
          : "N/A";
      default:
        return "N/A";
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setZoomLevel(1);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Extract image URLs properly
  const getPanImageUrl = () => {
    if (!booking.panImage) return null;
    return typeof booking.panImage === "string"
      ? booking.panImage
      : booking.panImage.url;
  };

  // Extract aadhar image URLs properly
  const getAadharImageUrls = () => {
    if (!booking.aadharImage || !Array.isArray(booking.aadharImage)) return [];

    return booking.aadharImage
      .map((img: any) => (typeof img === "string" ? img : img.url))
      .filter(Boolean);
  };

  // Download file function
  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  // Get filename from URL
  const getFileNameFromUrl = (
    url: string,
    defaultName: string,
    index?: number
  ) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split("/").pop() || defaultName;
      const extension = filename.split(".").pop() || "jpg";

      if (index !== undefined) {
        return `${defaultName.toLowerCase().replace(/\s+/g, "-")}-${
          index + 1
        }.${extension}`;
      }
      return `${defaultName.toLowerCase().replace(/\s+/g, "-")}.${extension}`;
    } catch {
      if (index !== undefined) {
        return `${defaultName.toLowerCase().replace(/\s+/g, "-")}-${
          index + 1
        }.jpg`;
      }
      return `${defaultName.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    }
  };

  const InfoRow: React.FC<{ label: string; value: any; half?: boolean }> = ({
    label,
    value,
    half = false,
  }) => (
    <Grid item xs={12} md={half ? 6 : 12}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {value || "N/A"}
      </Typography>
    </Grid>
  );

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: "primary.main",
          borderBottom: "2px solid",
          borderColor: "primary.main",
          pb: 1,
          mb: 2,
        }}
      >
        {title}
      </Typography>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );

  const DocumentViewer: React.FC<{
    title: string;
    documents: string[] | string | null;
    type?: "pan" | "aadhar";
  }> = ({ title, documents, type = "aadhar" }) => {
    // Handle different document formats
    let docArray: string[] = [];

    if (Array.isArray(documents)) {
      docArray = documents.filter(Boolean);
    } else if (documents) {
      docArray = [documents];
    }

    return (
      <Grid item xs={12}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {docArray.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
            {docArray.map((doc, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  minWidth: type === "pan" ? 220 : 180,
                  position: "relative",
                }}
              >
                {/* Document Preview */}
                <Box
                  sx={{
                    width: "100%",
                    height: type === "pan" ? 140 : 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: 1,
                    backgroundColor: "grey.50",
                    mb: 2,
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 2,
                      borderColor: "primary.main",
                    },
                  }}
                  onClick={() => handleImageClick(doc)}
                >
                  <img
                    src={doc}
                    alt={`${title} ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      console.error(`Failed to load image: ${doc}`);
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Tooltip title={`View ${title}`}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleImageClick(doc)}
                      fullWidth
                      sx={{
                        minWidth: "auto",
                        fontSize: "0.75rem",
                      }}
                    >
                      View
                    </Button>
                  </Tooltip>

                  <Tooltip title={`Download ${title}`}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<GetApp />}
                      onClick={() =>
                        downloadFile(
                          doc,
                          getFileNameFromUrl(
                            doc,
                            type === "pan" ? "pan-card" : "aadhar-card",
                            index
                          )
                        )
                      }
                      fullWidth
                      sx={{
                        minWidth: "auto",
                        fontSize: "0.75rem",
                        bgcolor: "success.main",
                        "&:hover": {
                          bgcolor: "success.dark",
                        },
                      }}
                    >
                      Download
                    </Button>
                  </Tooltip>
                </Box>

                <Typography
                  variant="caption"
                  display="block"
                  textAlign="center"
                  sx={{ mt: 1, color: "text.secondary" }}
                >
                  {type === "pan" ? "PAN Card" : `Aadhar ${index + 1}`}
                </Typography>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            No documents uploaded
          </Typography>
        )}
      </Grid>
    );
  };

  // Enhanced Image Preview Modal with Download
  const ImagePreviewModal = () => (
    <Dialog
      open={!!selectedImage}
      onClose={closeImageModal}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Document Preview</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Download">
              <IconButton
                onClick={() =>
                  selectedImage &&
                  downloadFile(
                    selectedImage,
                    getFileNameFromUrl(selectedImage, "document")
                  )
                }
                color="primary"
              >
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton onClick={closeImageModal}>
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          position: "relative",
        }}
      >
        {selectedImage && (
          <>
            <img
              src={selectedImage}
              alt="Document Preview"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: "transform 0.3s",
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
              onError={(e) => {
                console.error(
                  "Failed to load image in preview:",
                  selectedImage
                );
                const target = e.target as HTMLImageElement;
                target.alt = "Failed to load image";
              }}
            />

            {/* Download button overlay */}
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                right: 16,
                bgcolor: "rgba(0,0,0,0.7)",
                borderRadius: 2,
                p: 1,
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="white" sx={{ mr: 1 }}>
                Zoom: {Math.round(zoomLevel * 100)}%
              </Typography>
              <Tooltip title="Download Document">
                <IconButton
                  onClick={() =>
                    downloadFile(
                      selectedImage,
                      getFileNameFromUrl(selectedImage, "document")
                    )
                  }
                  sx={{ color: "white" }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {booking.projectName}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  label={booking.status?.toUpperCase()}
                  color={getStatusColor(booking.status)}
                  variant="filled"
                />
                <Typography variant="body2" color="text.secondary">
                  Created by: {booking.createdBy?.name || "N/A"}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="large">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ p: 1 }}>
            {/* Project & Customer Details */}
            <Section title="Project & Customer Details">
              <InfoRow label="Project Name" value={booking.projectName} half />
              <InfoRow label="Product" value={booking.product} half />
              <InfoRow
                label="Customer 1 Name"
                value={booking.customer1Name}
                half
              />
              <InfoRow
                label="Customer 2 Name"
                value={booking.customer2Name}
                half
              />
              <InfoRow label="Address" value={booking.address} />
              <InfoRow label="Phone Number" value={booking.phoneNo} half />
              <InfoRow label="Email" value={booking.email} half />
            </Section>

            <Divider sx={{ my: 3 }} />

            {/* Unit Details */}
            <Section title="Unit Details">
              <InfoRow label="Unit No" value={booking.unitNo} half />
              <InfoRow
                label="Area"
                value={booking.area ? `${booking.area} sq ft` : "N/A"}
                half
              />
              <InfoRow label="Floor" value={booking.floor} half />
              <InfoRow label="Payment Plan" value={booking.paymentPlan} half />
            </Section>

            <Divider sx={{ my: 3 }} />

            {/* Financial Details */}
            <Section title="Financial Details">
              <InfoRow
                label="Project Rate"
                value={formatCurrency(booking.projectRate)}
                half
              />

              {/* PLC Details - UPDATED */}
              <InfoRow
                label="PLC Type"
                value={getPlcTypeLabel(booking.plcType)}
                half
              />
              <InfoRow label="PLC Value" value={booking.plcValue} half />

              <InfoRow
                label="Other Charges"
                value={formatCurrency(booking.otherCharges1)}
                half
              />
              <InfoRow
                label="Company Discount"
                value={formatCurrency(booking.companyDiscount)}
                half
              />
              <InfoRow
                label="Company Logged In Rate"
                value={formatCurrency(booking.companyLoggedInRate)}
                half
              />
              <InfoRow
                label="Booking Amount"
                value={formatCurrency(booking.bookingAmount)}
                half
              />
              <InfoRow
                label="Net Sold COP Amount"
                value={formatCurrency(booking.netSoldCopAmount)}
                half
              />
            </Section>

            {/* Total Amount Summary */}
            <Paper
              sx={{ p: 3, mb: 3, bgcolor: "primary.light", color: "white" }}
            >
              <Typography variant="h6" gutterBottom>
                Total Amount Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    Base Amount:{" "}
                    {formatCurrency(
                      booking.projectRate && booking.area
                        ? parseFloat(booking.projectRate) *
                            parseFloat(booking.area)
                        : 0
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1">
                    Total with Charges:{" "}
                    {formatCurrency(booking.netSoldCopAmount)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Divider sx={{ my: 3 }} />

            {/* Sales & Commission Details */}
            <Section title="Sales & Commission">
              <InfoRow
                label="Sales Person Discount BSP"
                value={formatCurrency(booking.salesPersonDiscountBSP)}
                half
              />
              <InfoRow
                label="Sales Person Discount PLC"
                value={formatCurrency(booking.salesPersonDiscountPLC)}
                half
              />
              <InfoRow
                label="Sales Person Discount Club"
                value={formatCurrency(booking.salesPersonDiscountClub)}
                half
              />
              <InfoRow
                label="Sales Person Discount Others"
                value={formatCurrency(booking.salesPersonDiscountOthers)}
                half
              />
              <InfoRow
                label="Slab Percentage"
                value={booking.slabPercentage}
                half
              />
              <InfoRow
                label="Total Discount From Commission"
                value={formatCurrency(booking.totalDiscountFromComm)}
                half
              />
              <InfoRow
                label="Net Applicable Commission"
                value={formatCurrency(booking.netApplicableComm)}
                half
              />
            </Section>

            <Divider sx={{ my: 3 }} />

            {/* Transaction Details */}
            <Section title="Transaction Details">
              <InfoRow
                label="Payment Mode"
                value={getPaymentModeLabel(booking.paymentMode)}
                half
              />
              <InfoRow
                label="Payment Details"
                value={getPaymentDetails()}
                half
              />
              <InfoRow
                label="Transaction Date"
                value={formatDate(booking.transactionDate)}
                half
              />
              <InfoRow label="Bank Details" value={booking.bankDetails} />
            </Section>

            <Divider sx={{ my: 3 }} />

            {/* Team Details */}
            <Section title="Team Details">
              <InfoRow
                label="Sales Person Name"
                value={booking.salesPersonName}
                half
              />
              <InfoRow
                label="Team Head Name"
                value={booking.teamHeadName}
                half
              />
              <InfoRow
                label="Team Leader Name"
                value={booking.teamLeaderName}
                half
              />
              <InfoRow
                label="Business Head"
                value={booking.businessHead}
                half
              />
            </Section>

            {/* Documents Section */}
            <Section title="Documents">
              <DocumentViewer
                title="PAN Card"
                documents={getPanImageUrl()}
                type="pan"
              />
              <DocumentViewer
                title="Aadhar Cards"
                documents={getAadharImageUrls()}
                type="aadhar"
              />
            </Section>

            {/* Rejection Reason (if rejected) */}
            {booking.status === "rejected" && booking.rejectionReason && (
              <Section title="Rejection Details">
                <InfoRow
                  label="Rejection Reason"
                  value={
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "error.light",
                        color: "error.dark",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "error.main",
                      }}
                    >
                      {booking.rejectionReason}
                    </Box>
                  }
                />
                {booking.approvedBy && (
                  <InfoRow
                    label="Rejected By"
                    value={booking.approvedBy?.name}
                    half
                  />
                )}
              </Section>
            )}

            {/* Approval Details (if approved) */}
            {booking.status === "approved" && booking.approvedBy && (
              <Section title="Approval Details">
                <InfoRow label="Approved By" value={booking.approvedBy?.name} />
              </Section>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={onClose} variant="outlined" size="large">
            Close
          </Button>

          {/* Show approve/reject buttons only for Accounts role and when status is submitted */}
          {hasAccountsRole &&
            onApprove &&
            onReject &&
            booking.status === "submitted" && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={onApprove}
                  startIcon={<GetApp />}
                >
                  Approve Booking
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  onClick={onReject}
                  startIcon={<Close />}
                >
                  Reject Booking
                </Button>
              </>
            )}
        </DialogActions>
      </Dialog>

      {/* Enhanced Image Preview Modal */}
      <ImagePreviewModal />
    </>
  );
};

export default ViewBookingModal;
