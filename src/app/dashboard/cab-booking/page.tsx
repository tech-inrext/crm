"use client";
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaCar, FaTruck, FaCheck, FaTimes } from "react-icons/fa";
import { cabBookingApi, projectApi } from "@/services/api";
import dbConnect from "@/lib/mongodb";

// Project type
type Project = { _id: string; name: string };

// Booking type (partial, expand as needed)
type Booking = {
  _id: string;
  project: string | Project;
  projectDetails?: Project;
  clientName: string;
  numberOfClients: number;
  pickupPoint: string;
  dropPoint: string;
  employeeName?: string;
  requestedDateTime: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  status: "pending" | "approved" | "completed" | "cancelled" | "rejected";
  driverDetails?: {
    _id: string;
    username: string;
    phoneNumber?: string;
  };
  vehicleDetails?: {
    model: string;
    registrationNumber: string;
    type: string;
    capacity: number;
  };
  teamLeader?: string;
  teamLeaderDetails?: {
    username: string;
    phoneNumber?: string;
  };
  currentLocation?: string;
  estimatedArrival?: string;
  ownerName?: string;
  driverName?: string;
  teamHead?: string;
  totalKm?: number;
};

interface CabBookingProps {
  defaultView?: "form" | "tracking" | "vendortracking";
}

const DEFAULT_PROJECTS: Project[] = [
  { _id: "1", name: "Urbainia Trinity NX" },
  { _id: "2", name: "Migsun Rohini Central" },
  { _id: "3", name: "KW Blue Pearl" },
  { _id: "4", name: "KW Delhi-6" },
  { _id: "5", name: "Eco Village Cottage & Resort" },
  { _id: "6", name: "Sui Generis Residenncy" },
  { _id: "7", name: "Sky Harbor" },
  { _id: "8", name: "The Adriatico" },
  { _id: "9", name: "Sun Rise" },
  { _id: "10", name: "Sai Kunj" },
];

const CabBooking: React.FC<CabBookingProps> = ({ defaultView = "form" }) => {
  const router = useRouter();

  const [activeView, setActiveView] = useState<CabBookingProps["defaultView"]>(defaultView);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vendorBookings, setVendorBookings] = useState<Booking[]>([]);
  const [vendorFilter, setVendorFilter] = useState("all");
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [filter, setFilter] = useState("all");
  const [trackingData, setTrackingData] = useState({
    currentLocation: "",
    estimatedArrival: "",
  });

  const formRef = useRef({
    project: "",
    clientName: "",
    numberOfClients: 1,
    pickupPoint: "",
    dropPoint: "",
    employeeName: "",
    requestedDateTime: "",
    notes: "",
  });

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        try {
          // Use projectApi.getAllProjects instead of axios
          const projectsRes = await projectApi.getAllProjects();
          if (projectsRes.data?.data?.projects?.length > 0) {
            setProjects(projectsRes.data.data.projects);
          }
        } catch {
          // fallback to DEFAULT_PROJECTS
        }
        await fetchBookings();
      } catch (err) {
        setError("Failed to load initial data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch vendor bookings for team head/cab management
  const fetchVendorBookings = async () => {
    setIsLoadingVendor(true);
    setError("");
    try {
      // You may need to implement vendor bookings in your API service if needed
      // For now, fallback to direct axios if not present
      // let endpoint = "/vendor-bookings";
      // let params: Record<string, string> = {};
      // const res = await api.get(endpoint, { params });
      // setVendorBookings(Array.isArray(res.data.data) ? res.data.data : []);
      // ...existing code...
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load vendor bookings");
    } finally {
      setIsLoadingVendor(false);
    }
  };

  // Update vendor booking status
  const updateVendorStatus = async (id: string, status: string) => {
    try {
      setIsLoading(true);
      await cabBookingApi.updateStatus(id, { status });
      await fetchVendorBookings();
      setSuccess(`Booking ${status} successfully`);
    } catch {
      setError(`Failed to ${status} booking`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorBookings();
  }, [activeView, router]);

  // Fetch bookings with optional filters
  const fetchBookings = async (statusFilter = filter) => {
    try {
      setIsLoading(true);
      setError("");
      // Use cabBookingApi.getAllBookings
      const params: Record<string, string> = {};
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const res = await cabBookingApi.getAllBookings(params);
      setBookings(res.data.data.bookings || []);
    } catch {
      setError("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (status: string) => {
    setFilter(status);
    await fetchBookings(status);
  };

  // Booking Form Component
  const BookingForm: React.FC = () => {
    const [localFormData, setLocalFormData] = useState({
      project: "",
      clientName: "",
      numberOfClients: 1,
      pickupPoint: "",
      dropPoint: "",
      employeeName: "",
      requestedDateTime: getCurrentDateTime(),
      notes: "",
    });

    const handleLocalChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setLocalFormData((prev) => ({ ...prev, [name]: value }));
      formRef.current = { ...formRef.current, [name]: value };
    };

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      setSuccess("");
       
      try {
        // Ensure numberOfClients is a number and requestedDateTime is ISO string
        await cabBookingApi.createBooking({
          ...localFormData,
          requestedDateTime: new Date(localFormData.requestedDateTime).toISOString(),
          numberOfClients: Number(localFormData.numberOfClients),
        });
        setSuccess("Booking created successfully!");
        setLocalFormData({
          project: "",
          clientName: "",
          numberOfClients: 1,
          pickupPoint: "",
          dropPoint: "",
          employeeName: "",
          requestedDateTime: getCurrentDateTime(),
          notes: "",
        });
        await fetchBookings();
        setActiveView("tracking");
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to create booking");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">New Cab Booking</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm font-medium mb-1">Project *</label>
              <select
                name="project"
                value={localFormData.project}
                onChange={handleLocalChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="" className="text-black">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id} className="text-black">
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium  mb-1">Client Name *</label>
              <input type="text" name="clientName" value={localFormData.clientName} onChange={handleLocalChange} required className="w-full p-2 border border-gray-300 rounded-md" onFocus={e => e.target.select()} />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium  mb-1">Number of Clients *</label>
              <input type="number" name="numberOfClients" min="1" max="20" value={localFormData.numberOfClients}
                onChange={handleLocalChange} required className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium  mb-1">Pickup Point *</label>
              <input type="text" name="pickupPoint" value={localFormData.pickupPoint} onChange={handleLocalChange} required className="w-full p-2 border border-gray-300 rounded-md" onFocus={e => e.target.select()} />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium  mb-1">Drop Point *</label>
              <input type="text" name="dropPoint" value={localFormData.dropPoint} onChange={handleLocalChange} required className="w-full p-2 border border-gray-300 rounded-md" onFocus={e => e.target.select()} />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium  mb-1">Employee Name</label>
              <input type="text" name="employeeName" value={localFormData.employeeName} onChange={handleLocalChange} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium  mb-1">Requested Date & Time *</label>
              <input type="datetime-local" name="requestedDateTime" value={localFormData.requestedDateTime} onChange={handleLocalChange} min={getCurrentDateTime()} required className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium  mb-1">Notes</label>
              <textarea name="notes" value={localFormData.notes} onChange={handleLocalChange} rows={2} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="mt-6">
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? "Submitting..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const handleTrackingChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTrackingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTrackingUpdate = async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError("");
      // Use cabBookingApi.updateTracking
      await cabBookingApi.updateTracking(bookingId, trackingData);
      setSuccess("Tracking info updated!");
      setTrackingData({ currentLocation: "", estimatedArrival: "" });
      await fetchBookings();
    } catch {
      setError("Failed to update tracking info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      setIsLoading(true);
      setError("");
      // Use cabBookingApi.updateStatus
      await cabBookingApi.updateStatus(bookingId, { status });
      setSuccess("Booking status updated!");
      await fetchBookings();
    } catch {
      setError("Failed to update booking status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setIsLoading(true);
      setError("");
      // Use cabBookingApi.cancelBooking
      await cabBookingApi.cancelBooking(bookingId);
      setSuccess("Booking cancelled!");
      await fetchBookings();
    } catch {
      setError("Failed to cancel booking");
    } finally {
      setIsLoading(false);
    }
  };

  // ...existing code...
  return (
    <div className="container mx-auto px-4 py-6">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setActiveView("form")} className={`px-4 py-2 rounded-md ${activeView === "form" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-950"}`}>New Booking</button>
        <button onClick={() => setActiveView("tracking")} className={`px-4 py-2 rounded-md ${activeView === "tracking" ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-950"}`}>View Bookings</button>
        {/* Remove user?.role check for Vendor Bookings button, show only if needed */}
        {/* <button onClick={() => setActiveView("vendortracking")} ...>Vendor Bookings</button> */}
      </div>
      {activeView === "form" ? (
        <div className={`p-6 rounded-lg shadow bg-white`}>
          <BookingForm />
        </div>
      ) : activeView === "tracking" ? (
        <div className={`p-6 rounded-lg shadow bg-white`}>
          {/* <BookingTracking /> */}
        </div>
      ) : (
        // <VendorBookingsView />
        <></>
      )}
    </div>
  );
};

export default CabBooking;