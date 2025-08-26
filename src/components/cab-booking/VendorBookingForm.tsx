import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Select,
  MenuItem,
} from "@mui/material";

interface VendorBookingFormProps {
  disabled?: boolean;
  bookingId?: string | null;
}

const VendorBookingForm: React.FC<VendorBookingFormProps> = ({
  disabled,
  bookingId,
}) => {
  const { getCurrentRoleName, user } = useAuth();
  const isVendor = getCurrentRoleName() === "vendor";
  const employeeName = user?.name || "";
  const managerName = user?.managerName || "";
  // Top-level state for all form fields
  const [cabOwner, setCabOwner] = useState("");
  const [driverName, setDriverName] = useState("");
  const [teamHead, setTeamHead] = useState("");
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [dropPoint, setDropPoint] = useState("");
  const totalKm =
    startKm && endKm ? Math.max(Number(endKm) - Number(startKm), 0) : 0;

  // ...existing code...
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cab Vendor Details</h1>
      {bookingId && (
        <div className="mb-4 text-sm text-gray-600">
          <b>Booking ID:</b> {bookingId}
        </div>
      )}
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cab Owner */}
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Cab Owner Name *
            </label>
            <input
              type="text"
              name="cabOwner"
              value={cabOwner}
              onChange={(e) => setCabOwner(e.target.value)}
              disabled={disabled}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {/* Driver Name */}
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Driver Name *
            </label>
            <input
              type="text"
              name="driverName"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              disabled={disabled}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {/* Requested By */}
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Requested By *
            </label>
            <input
              type="text"
              name="employeeName"
              value={employeeName}
              disabled
              required
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              readOnly
            />
          </div>
          {/* Approved By */}
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Approved By *
            </label>
            <input
              type="text"
              name="managerName"
              value={managerName}
              disabled
              required
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              readOnly
            />
          </div>
          {/* Pickup Point */}
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Pickup Point *
            </label>
            <input
              type="text"
              name="pickupPoint"
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
              disabled={disabled}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {/* Drop Point */}
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Drop Point *
            </label>
            <input
              type="text"
              name="dropPoint"
              value={dropPoint}
              onChange={(e) => setDropPoint(e.target.value)}
              disabled={disabled}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {/* Start Kilometers */}
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Start Kilometers *
            </label>
            <input
              type="number"
              name="startKm"
              value={startKm}
              onChange={(e) => setStartKm(e.target.value)}
              disabled={disabled}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {/* End Kilometers */}
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              End Kilometers *
            </label>
            <input
              type="number"
              name="endKm"
              value={endKm}
              onChange={(e) => setEndKm(e.target.value)}
              disabled={disabled}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          {/* Total Kilometers */}
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Total Kilometers
            </label>
            <input
              type="text"
              name="totalKm"
              value={`${totalKm} km`}
              disabled
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-2 justify-end">
          <button
            type="button"
            disabled={disabled}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Submit Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorBookingForm;
