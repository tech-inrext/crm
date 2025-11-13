// components/ui/BookingLoginDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { Close, Delete, CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useAuth } from "@/contexts/AuthContext";
import {
  DEFAULT_BOOKING_LOGIN_FORM,
  SLAB_PERCENTAGE_OPTIONS,
  STATUS_OPTIONS,
  BUTTON_LABELS,
  PLC_TYPE_OPTIONS,
  PAYMENT_MODE_OPTIONS,
} from "@/constants/bookingLogin";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface BookingLoginDialogProps {
  open: boolean;
  editId: string | null;
  initialData: any;
  saving: boolean;
  onClose: () => void;
  onSave: (values: any) => Promise<void>;
}

// Helper function to ensure all fields have safe default values - MOVED OUTSIDE COMPONENT
const getSafeFormData = (initialData: any) => {
  const defaultForm = { ...DEFAULT_BOOKING_LOGIN_FORM };
  
  if (!initialData) {
    return defaultForm;
  }

  // Create a safe form data object with fallbacks for all fields
  const safeFormData = { ...defaultForm };
  
  // Override with initialData, ensuring no undefined values
  Object.keys(defaultForm).forEach(key => {
    const value = initialData[key];
    
    if (value !== undefined && value !== null) {
      safeFormData[key] = value;
    }
  });

  // Handle special cases
  safeFormData.slabPercentage = initialData.slabPercentage || '';
  safeFormData.status = initialData.status || 'draft';
  safeFormData.aadharImages = Array.isArray(initialData.aadharImages) 
    ? initialData.aadharImages 
    : [];
  safeFormData.plcType = initialData.plcType || 'percentage';
  safeFormData.paymentMode = initialData.paymentMode || 'cheque';
  safeFormData.chequeNumber = initialData.chequeNumber || '';
  safeFormData.transactionId = initialData.transactionId || '';
  safeFormData.cashReceiptNumber = initialData.cashReceiptNumber || '';

  return safeFormData;
};

const BookingLoginDialog: React.FC<BookingLoginDialogProps> = ({
  open,
  editId,
  initialData,
  saving,
  onClose,
  onSave,
}) => {
  const { hasAccountsRole } = useAuth();
  const [form, setForm] = useState(() => getSafeFormData(null));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get status options based on user role
  const getStatusOptions = () => {
    if (hasAccountsRole()) {
      // Accounts role can see all status options
      return STATUS_OPTIONS;
    } else {
      // Non-accounts role can only see draft and submitted
      return STATUS_OPTIONS.filter(option => 
        option.value === 'draft' || option.value === 'submitted'
      );
    }
  };

  useEffect(() => {
    if (open) {
      const safeFormData = getSafeFormData(initialData);
      setForm(safeFormData);
      setErrors({});
    }
  }, [open, initialData]);

  // Auto-calculate netSoldCopAmount when relevant fields change
  useEffect(() => {
    if (open && (form.area || form.projectRate || form.otherCharges1 || form.companyDiscount || form.plcValue)) {
      calculateNetSoldCopAmount();
    }
  }, [form.area, form.projectRate, form.otherCharges1, form.companyDiscount, form.plcType, form.plcValue, open]);

  const calculateNetSoldCopAmount = () => {
    const area = parseFloat(form.area) || 0;
    const projectRate = parseFloat(form.projectRate) || 0;
    const otherCharges1 = parseFloat(form.otherCharges1) || 0;
    const companyDiscount = parseFloat(form.companyDiscount) || 0;
    const plcValue = parseFloat(form.plcValue) || 0;
    
    let baseAmount = area * projectRate;
    baseAmount += otherCharges1;
    baseAmount -= companyDiscount;
    
    if (form.plcType && plcValue > 0) {
      switch (form.plcType) {
        case "percentage":
          baseAmount -= (baseAmount * plcValue) / 100;
          break;
        case "per_sq_ft":
          baseAmount -= (plcValue * area);
          break;
        case "per_sq_yard":
          baseAmount -= (plcValue * area * 0.111111);
          break;
        case "unit":
          baseAmount -= plcValue;
          break;
      }
    }
    
    const netAmount = Math.max(0, baseAmount);
    setForm(prev => ({
      ...prev,
      netSoldCopAmount: netAmount.toString()
    }));
  };

  const handleChange = (field: string) => (event: any) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const newErrors: { [key: string]: string } = { ...errors };

    if (field === "aadharImages") {
      setForm((prev) => ({
        ...prev,
        aadharImages: [...(prev.aadharImages || []), ...fileList],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: fileList[0],
      }));
    }
    
    if (newErrors[field]) {
      delete newErrors[field];
      setErrors(newErrors);
    }
    event.target.value = '';
  };

  const removeFile = (field: string, index?: number) => () => {
    if (field === "aadharImages" && index !== undefined) {
      setForm((prev) => ({
        ...prev,
        aadharImages: (prev.aadharImages || []).filter((_, i) => i !== index),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
    
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.projectName?.trim()) newErrors.projectName = "Project name is required";
    if (!form.customer1Name?.trim()) newErrors.customer1Name = "Customer 1 name is required";
    if (!form.address?.trim()) newErrors.address = "Address is required";
    if (!form.phoneNo?.trim()) newErrors.phoneNo = "Phone number is required";
    if (!form.unitNo?.trim()) newErrors.unitNo = "Unit number is required";
    if (!form.area) newErrors.area = "Area is required";
    if (!form.projectRate) newErrors.projectRate = "Project rate is required";

    if (form.paymentMode === 'cheque' && !form.chequeNumber?.trim()) {
      newErrors.chequeNumber = "Cheque number is required for cheque payments";
    }
    if (form.paymentMode === 'online' && !form.transactionId?.trim()) {
      newErrors.transactionId = "Transaction ID is required for online payments";
    }
    if (form.paymentMode === 'cash' && !form.cashReceiptNumber?.trim()) {
      newErrors.cashReceiptNumber = "Cash receipt number is required for cash payments";
    }

    if (form.phoneNo && !/^[0-9]{10}$/.test(form.phoneNo)) {
      newErrors.phoneNo = "Phone number must be 10 digits";
    }

    if (form.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSave(form);
    } catch (error) {
      console.error("Failed to save booking:", error);
    }
  };

  const getFileDisplayName = (file: any, index: number) => {
    if (typeof file === 'string') {
      return `Aadhar Card ${index + 1}`;
    }
    const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
    return `${file.name} (${sizeInMB}MB)`;
  };

  const renderPaymentModeFields = () => {
    switch (form.paymentMode) {
      case 'cheque':
        return (
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Cheque Number *"
              value={form.chequeNumber || ''}
              onChange={handleChange("chequeNumber")}
              error={!!errors.chequeNumber}
              helperText={errors.chequeNumber}
            />
          </Grid>
        );
      case 'online':
        return (
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Transaction ID *"
              value={form.transactionId || ''}
              onChange={handleChange("transactionId")}
              error={!!errors.transactionId}
              helperText={errors.transactionId}
            />
          </Grid>
        );
      case 'cash':
        return (
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Cash Receipt Number *"
              value={form.cashReceiptNumber || ''}
              onChange={handleChange("cashReceiptNumber")}
              error={!!errors.cashReceiptNumber}
              helperText={errors.cashReceiptNumber}
            />
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      sx={{ '& .MuiDialog-paper': { maxHeight: '90vh' } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {editId ? BUTTON_LABELS.EDIT_BOOKING : BUTTON_LABELS.ADD_BOOKING}
          </Typography>
          <IconButton onClick={onClose} disabled={saving}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Project Details */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
              Project Details
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Project Name *"
              value={form.projectName || ''}
              onChange={handleChange("projectName")}
              error={!!errors.projectName}
              helperText={errors.projectName}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Product"
              value={form.product || ''}
              onChange={handleChange("product")}
            />
          </Grid>

          {/* Customer Details */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Customer Details
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Customer 1 Name *"
              value={form.customer1Name || ''}
              onChange={handleChange("customer1Name")}
              error={!!errors.customer1Name}
              helperText={errors.customer1Name}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Customer 2 Name"
              value={form.customer2Name || ''}
              onChange={handleChange("customer2Name")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Address *"
              multiline
              rows={2}
              value={form.address || ''}
              onChange={handleChange("address")}
              error={!!errors.address}
              helperText={errors.address}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Phone Number *"
              value={form.phoneNo || ''}
              onChange={handleChange("phoneNo")}
              error={!!errors.phoneNo}
              helperText={errors.phoneNo}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email || ''}
              onChange={handleChange("email")}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>

          {/* Unit Details */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Unit Details
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Unit No *"
              value={form.unitNo || ''}
              onChange={handleChange("unitNo")}
              error={!!errors.unitNo}
              helperText={errors.unitNo}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Area *"
              value={form.area || ''}
              onChange={handleChange("area")}
              error={!!errors.area}
              helperText={errors.area}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Floor"
              value={form.floor || ''}
              onChange={handleChange("floor")}
            />
          </Grid>

          {/* Financial Details */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Financial Details
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Project Rate *"
              value={form.projectRate || ''}
              onChange={handleChange("projectRate")}
              error={!!errors.projectRate}
              helperText={errors.projectRate}
            />
          </Grid>

          {/* PLC Fields */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>PLC Type</InputLabel>
              <Select
                value={form.plcType || 'percentage'}
                label="PLC Type"
                onChange={handleChange("plcType")}
              >
                {PLC_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="PLC Value"
              value={form.plcValue || ''}
              onChange={handleChange("plcValue")}
              helperText={`Enter value for ${PLC_TYPE_OPTIONS.find(opt => opt.value === form.plcType)?.label}`}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Other Charges"
              value={form.otherCharges1 || ''}
              onChange={handleChange("otherCharges1")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Payment Plan"
              value={form.paymentPlan || ''}
              onChange={handleChange("paymentPlan")}
            />
          </Grid>

          {/* Auto-calculated Net Sold COP Amount */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Net Sold COP Amount"
              value={form.netSoldCopAmount || ''}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiInputBase-input': {
                  backgroundColor: 'action.hover',
                  fontWeight: 'bold',
                }
              }}
              helperText="Auto-calculated based on area, rate, charges, discount and PLC"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Booking Amount"
              value={form.bookingAmount || ''}
              onChange={handleChange("bookingAmount")}
            />
          </Grid>

          {/* Discounts and Pricing */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Discounts & Pricing
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Company Discount"
              value={form.companyDiscount || ''}
              onChange={handleChange("companyDiscount")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Company Logged In Rate"
              value={form.companyLoggedInRate || ''}
              onChange={handleChange("companyLoggedInRate")}
            />
          </Grid>

          {/* Sales Person Discounts */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Sales Person Discounts
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="BSP Discount"
              value={form.salesPersonDiscountBSP || ''}
              onChange={handleChange("salesPersonDiscountBSP")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="PLC Discount"
              value={form.salesPersonDiscountPLC || ''}
              onChange={handleChange("salesPersonDiscountPLC")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Club Discount"
              value={form.salesPersonDiscountClub || ''}
              onChange={handleChange("salesPersonDiscountClub")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Others Discount"
              value={form.salesPersonDiscountOthers || ''}
              onChange={handleChange("salesPersonDiscountOthers")}
            />
          </Grid>

          {/* Sold Prices */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Sold Prices
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Sold Price BSP"
              value={form.soldPriceBSP || ''}
              onChange={handleChange("soldPriceBSP")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Sold Price PLC"
              value={form.soldPricePLC || ''}
              onChange={handleChange("soldPricePLC")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Sold Price Club"
              value={form.soldPriceClub || ''}
              onChange={handleChange("soldPriceClub")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Sold Price Others"
              value={form.soldPriceOthers || ''}
              onChange={handleChange("soldPriceOthers")}
            />
          </Grid>

          {/* Transaction Details */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Transaction Details
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Payment Mode *</InputLabel>
              <Select
                value={form.paymentMode || 'cheque'}
                label="Payment Mode *"
                onChange={handleChange("paymentMode")}
              >
                {PAYMENT_MODE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Payment Mode Specific Fields */}
          {renderPaymentModeFields()}

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Transaction Date"
              type="date"
              value={form.transactionDate || ''}
              onChange={handleChange("transactionDate")}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Bank Details"
              multiline
              rows={2}
              value={form.bankDetails || ''}
              onChange={handleChange("bankDetails")}
            />
          </Grid>

          {/* Commission Details */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Commission Details
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Slab Percentage</InputLabel>
              <Select
                value={form.slabPercentage || ''}
                label="Slab Percentage"
                onChange={handleChange("slabPercentage")}
              >
                <MenuItem value="">
                  <em>Select Slab Percentage</em>
                </MenuItem>
                {SLAB_PERCENTAGE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Total Discount From Commission"
              value={form.totalDiscountFromComm || ''}
              onChange={handleChange("totalDiscountFromComm")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Net Applicable Commission"
              value={form.netApplicableComm || ''}
              onChange={handleChange("netApplicableComm")}
            />
          </Grid>

          {/* Team Details */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Team Details
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Sales Person Name"
              value={form.salesPersonName || ''}
              onChange={handleChange("salesPersonName")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Team Head Name"
              value={form.teamHeadName || ''}
              onChange={handleChange("teamHeadName")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Team Leader Name"
              value={form.teamLeaderName || ''}
              onChange={handleChange("teamLeaderName")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Business Head"
              value={form.businessHead || ''}
              onChange={handleChange("businessHead")}
            />
          </Grid>

          {/* Status - updated for role base access */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status || 'draft'}
                label="Status"
                onChange={handleChange("status")}
                disabled={
                  // Disable status field for non-accounts users when editing approved/rejected bookings
                  editId && !hasAccountsRole() && 
                  (form.status === 'approved' || form.status === 'rejected')
                }
              >
                {getStatusOptions().map((option) => (
                  <MenuItem 
                    key={option.value} 
                    value={option.value}
                    disabled={
                      // Disable approved/rejected for non-accounts users
                      !hasAccountsRole() && 
                      (option.value === 'approved' || option.value === 'rejected')
                    }
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {!hasAccountsRole() && (
                <FormHelperText>
                  Only Accounts role can set status to Approved or Rejected
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* File Uploads */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Document Uploads
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Maximum file size: 1MB per file. Allowed formats: JPEG, PNG, WebP, PDF
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={!!errors.panImage}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mb: 1 }}
                fullWidth
              >
                Upload PAN Card
                <VisuallyHiddenInput
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange("panImage")}
                />
              </Button>
              {form.panImage && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={typeof form.panImage === 'string' ? 'PAN Uploaded' : `${form.panImage.name} (${(form.panImage.size / 1024 / 1024).toFixed(2)}MB)`}
                    onDelete={removeFile("panImage")}
                  />
                </Box>
              )}
              {errors.panImage && (
                <FormHelperText error>{errors.panImage}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={!!errors.aadharImages}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mb: 1 }}
                fullWidth
              >
                Upload Aadhar Cards
                <VisuallyHiddenInput
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange("aadharImages")}
                />
              </Button>
              
              <Box display="flex" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                {(form.aadharImages || []).map((file: any, index: number) => (
                  <Chip
                    key={index}
                    label={getFileDisplayName(file, index)}
                    onDelete={removeFile("aadharImages", index)}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
              
              {errors.aadharImages && (
                <FormHelperText error>{errors.aadharImages}</FormHelperText>
              )}
              <FormHelperText>
                You can upload multiple Aadhar cards (front & back). Max 1MB per file.
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={saving}>
          {BUTTON_LABELS.CANCEL}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
          sx={{ minWidth: 100 }}
        >
          {saving ? "Saving..." : BUTTON_LABELS.SAVE}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingLoginDialog;