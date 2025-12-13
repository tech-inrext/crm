// hooks/useBookingLogin.ts
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { BOOKING_LOGIN_API_BASE, DEFAULT_PAGE_SIZE } from "@/constants/bookingLogin";

export interface BookingLogin {
  _id?: string;
  projectName: string;
  product?: string;
  customer1Name: string;
  customer2Name?: string;
  address: string;
  phoneNo: string;
  email?: string;
  unitNo: string;
  area: number;
  floor: string;
  plcPercentage?: number;
  plcAmount?: number;
  otherCharges1?: number;
  otherCharges2?: number;
  paymentPlan?: string;
  projectRate: number;
  companyDiscount?: number;
  actualLoggedInRate?: number;
  salesPersonDiscountBSP?: number;
  salesPersonDiscountPLC?: number;
  salesPersonDiscountClub?: number;
  salesPersonDiscountOthers?: number;
  soldPriceBSP?: number;
  soldPricePLC?: number;
  soldPriceClub?: number;
  soldPriceOthers?: number;
  netSoldCopAmount?: number;
  bookingAmount?: number;
  chequeTransactionDetails?: string;
  transactionDate?: string;
  bankDetails?: string;
  slabPercentage: string;
  totalDiscountFromComm?: number;
  netApplicableComm?: number;
  salesPersonName?: string;
  teamHeadName?: string;
  teamLeaderName?: string;
  businessHead?: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  panImage?: { url: string; public_id: string };
  aadharImage?: Array<{ url: string; public_id: string }>;
  createdBy?: any;
  approvedBy?: any;
  rejectionReason?: string;
  [key: string]: any;
}

// File validation constants
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

export function useBookingLogin(
  debouncedSearch: string, 
  projectFilter: string = "", 
  teamHeadFilter: string = "",
  statusFilter: string = "" 
) {
  const [bookings, setBookings] = useState<BookingLogin[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({});

  const loadBookings = useCallback(
    async (page = 1, limit = DEFAULT_PAGE_SIZE, search = "", project = "", teamHead = "", status = "") => {
      setLoading(true);
      try {
        const response = await axios.get(BOOKING_LOGIN_API_BASE, {
          params: {
            page,
            limit,
            search: search.trim() || undefined,
            projectName: project || undefined,
            teamHeadName: teamHead || undefined,
            status: status || undefined,
            _t: Date.now(),
          },
        });

        const { data, pagination } = response.data;
        setBookings(data || []);
        setTotalItems(pagination?.totalItems || 0);
      } catch (error) {
        console.error("Failed to load bookings:", error);
        setBookings([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadBookings(page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter);
  }, [page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter, loadBookings]);

  // Enhanced file upload function with validation
  const uploadFileToS3 = async (file: File): Promise<{ url: string; public_id: string }> => {
    if (!file) throw new Error("No file provided");

    // Server-side validation
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} exceeds 1MB size limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(`File ${file.name} must be JPEG, PNG, WebP, or PDF format`);
    }

    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `booking-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;

    const presignRes = await axios.post(
      "/api/v0/s3/upload-url",
      { 
        fileName: uniqueFileName, 
        fileType: file.type 
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const { uploadUrl, fileUrl } = presignRes.data;

    await fetch(uploadUrl, { 
      method: "PUT", 
      headers: { 
        "Content-Type": file.type,
        "Content-Length": file.size.toString()
      }, 
      body: file 
    });

    return { url: fileUrl, public_id: uniqueFileName };
  };

  const uploadFiles = async (files: File[]): Promise<Array<{ url: string; public_id: string }>> => {
    const uploadPromises = files.map(file => uploadFileToS3(file));
    return Promise.all(uploadPromises);
  };

  const addBooking = useCallback(
    async (bookingData: any) => {
      setSaving(true);
      try {
        const payload = { ...bookingData };
        
        // Upload PAN image if it's a new file
        if (bookingData.panImage instanceof File) {
          try {
            payload.panImage = await uploadFileToS3(bookingData.panImage);
          } catch (error) {
            console.error("Failed to upload PAN image:", error);
            throw new Error(`PAN card upload failed: ${error.message}`);
          }
        }

        // Upload Aadhar images if they are new files
        if (bookingData.aadharImages && bookingData.aadharImages.length > 0) {
          const aadharFiles = bookingData.aadharImages.filter((file: any) => file instanceof File);
          
          if (aadharFiles.length > 0) {
            try {
              const uploadedAadharImages = await uploadFiles(aadharFiles);
              payload.aadharImage = uploadedAadharImages;
            } catch (error) {
              console.error("Failed to upload Aadhar images:", error);
              throw new Error(`Aadhar card upload failed: ${error.message}`);
            }
          }
        }

        // Remove temporary file objects before sending to API
        delete payload.aadharImages;
        delete payload.panFile;

        console.log("Final payload for API:", {
          ...payload,
          panImage: payload.panImage ? "Uploaded" : "None",
          aadharImage: payload.aadharImage ? `${payload.aadharImage.length} images` : "None"
        });

        await axios.post(BOOKING_LOGIN_API_BASE, payload);
        await loadBookings(page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter);
        
      } catch (error) {
        console.error("Failed to add booking:", error);
        if (error && error.response) {
          const { status, data } = error.response;
          const message = data?.message || error.message || "Request failed";
          const err = new Error(message);
          (err as any).status = status;
          throw err;
        }
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter, loadBookings]
  );

  const updateBooking = useCallback(
    async (id: string, bookingData: any) => {
      setSaving(true);
      try {
        const payload = { ...bookingData };
        
        // Handle PAN image update
        if (bookingData.panImage instanceof File) {
          try {
            payload.panImage = await uploadFileToS3(bookingData.panImage);
          } catch (error) {
            console.error("Failed to upload PAN image:", error);
            throw new Error(`PAN card upload failed: ${error.message}`);
          }
        } else if (typeof bookingData.panImage === 'string' || bookingData.panImage?.url) {
          // Keep existing PAN image
          payload.panImage = typeof bookingData.panImage === 'string' 
            ? { url: bookingData.panImage, public_id: `pan-${id}` }
            : bookingData.panImage;
        }

        // Handle Aadhar images update
        if (bookingData.aadharImages && bookingData.aadharImages.length > 0) {
          const existingAadharImages = bookingData.aadharImages
            .filter((img: any) => typeof img === 'string' || img?.url)
            .map((img: any) => typeof img === 'string' ? { url: img, public_id: `aadhar-${id}` } : img);
          
          const newAadharFiles = bookingData.aadharImages.filter((file: any) => file instanceof File);
          
          if (newAadharFiles.length > 0) {
            try {
              const uploadedAadharImages = await uploadFiles(newAadharFiles);
              payload.aadharImage = [...existingAadharImages, ...uploadedAadharImages];
            } catch (error) {
              console.error("Failed to upload Aadhar images:", error);
              throw new Error(`Aadhar card upload failed: ${error.message}`);
            }
          } else {
            payload.aadharImage = existingAadharImages;
          }
        }

        // Remove temporary file objects
        delete payload.aadharImages;
        delete payload.panFile;

        await axios.patch(`${BOOKING_LOGIN_API_BASE}/${id}`, payload);
        await loadBookings(page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter);
        
      } catch (error) {
        console.error("Failed to update booking:", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter, loadBookings]
  );

  const updateBookingStatus = useCallback(
    async (id: string, status: string, rejectionReason?: string) => {
      try {
        await axios.patch(`${BOOKING_LOGIN_API_BASE}/status?id=${id}`, {
          status,
          rejectionReason,
        });
        await loadBookings(page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter);
      } catch (error) {
        console.error("Failed to update booking status:", error);
        throw error;
      }
    },
    [page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter, loadBookings]
  );

  const deleteBooking = useCallback(
    async (id: string) => {
      try {
        await axios.delete(`${BOOKING_LOGIN_API_BASE}/${id}`);
        await loadBookings(page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter);
      } catch (error: any) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message || "Failed to delete booking";
        
        // Handle specific error cases
        if (status === 403) {
          throw new Error("Access denied: " + message);
        }
        throw error;
      }
    },
    [page, rowsPerPage, debouncedSearch, projectFilter, teamHeadFilter, statusFilter, loadBookings]
  );

  return {
    bookings,
    loading,
    saving,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    open,
    setOpen,
    editId,
    setEditId,
    form,
    setForm,
    addBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
    loadBookings,
  };
}