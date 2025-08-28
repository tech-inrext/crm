import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import VendorFormFields from "./VendorFormFields";

interface VendorBookingFormProps {
  disabled?: boolean;
  bookingId?: string | null;
  onSubmit?: (formData: any) => void;
  onClose?: () => void;
}

const VendorBookingForm: React.FC<VendorBookingFormProps> = ({
  disabled,
  bookingId,
  onSubmit,
  onClose,
}) => {
  const { getCurrentRoleName } = useAuth();
  const isVendor = getCurrentRoleName() === "vendor";

  // Form state
  const [cabOwner, setCabOwner] = useState("");
  const [driverName, setDriverName] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [dlNumber, setDlNumber] = useState("");
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [pickupPoint, setPickupPoint] = useState("");
  const [dropPoint, setDropPoint] = useState("");

  const totalKm =
    startKm && endKm ? Math.max(Number(endKm) - Number(startKm), 0) : 0;

  // validation errors
  const [aadharError, setAadharError] = useState("");
  const [dlError, setDlError] = useState("");

  const inputClass = "w-full p-2 border border-gray-300 rounded-md";

  const validateAadhar = (value: string) =>
    value.replace(/\D/g, "").length >= 12;
  const validateDL = (value: string) =>
    value.replace(/[^a-zA-Z0-9]/g, "").length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aadharNumber && !validateAadhar(aadharNumber)) {
      setAadharError("Aadhar number must contain at least 12 digits");
      return;
    }
    if (dlNumber && !validateDL(dlNumber)) {
      setDlError("DL number must contain at least 10 alphanumeric characters");
      return;
    }
    setAadharError("");
    setDlError("");

    if (onSubmit) {
      onSubmit({
        cabOwner,
        driverName,
        aadharNumber,
        dlNumber,
        startKm,
        endKm,
        pickupPoint,
        dropPoint,
        totalKm,
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cab Vendor Details</h1>
      {bookingId && (
        <div className="mb-4 text-sm text-gray-600">
          <b>Booking ID:</b> {bookingId}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <VendorFormFields
          disabled={disabled}
          inputClass={inputClass}
          cabOwner={cabOwner}
          setCabOwner={setCabOwner}
          driverName={driverName}
          setDriverName={setDriverName}
          aadharNumber={aadharNumber}
          setAadharNumber={setAadharNumber}
          dlNumber={dlNumber}
          setDlNumber={setDlNumber}
          pickupPoint={pickupPoint}
          setPickupPoint={setPickupPoint}
          dropPoint={dropPoint}
          setDropPoint={setDropPoint}
          startKm={startKm}
          setStartKm={setStartKm}
          endKm={endKm}
          setEndKm={setEndKm}
          totalKm={totalKm}
          aadharError={aadharError}
          dlError={dlError}
          clearAadharError={() => setAadharError("")}
          clearDlError={() => setDlError("")}
        />

        <div className="mt-6 flex gap-2 justify-end">
          <button
            type="button"
            disabled={disabled}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            onClick={onClose}
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
