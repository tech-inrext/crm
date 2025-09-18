import React from "react";

interface Props {
  disabled?: boolean;
  inputClass: string;
  cabOwner: string;
  setCabOwner: React.Dispatch<React.SetStateAction<string>>;
  driverName: string;
  setDriverName: React.Dispatch<React.SetStateAction<string>>;
  aadharNumber: string;
  setAadharNumber: React.Dispatch<React.SetStateAction<string>>;
  dlNumber: string;
  setDlNumber: React.Dispatch<React.SetStateAction<string>>;
  pickupPoint: string;
  setPickupPoint: React.Dispatch<React.SetStateAction<string>>;
  dropPoint: string;
  setDropPoint: React.Dispatch<React.SetStateAction<string>>;
  startKm: string;
  setStartKm: React.Dispatch<React.SetStateAction<string>>;
  endKm: string;
  setEndKm: React.Dispatch<React.SetStateAction<string>>;
  odometerStart?: string;
  setOdometerStart?: React.Dispatch<React.SetStateAction<string>>;
  odometerEnd?: string;
  setOdometerEnd?: React.Dispatch<React.SetStateAction<string>>;
  fare?: string;
  setFare?: React.Dispatch<React.SetStateAction<string>>;
  totalKm?: number | string;
  aadharError?: string;
  dlError?: string;
  clearAadharError: () => void;
  clearDlError: () => void;
}

const VendorFormFields: React.FC<Props> = ({
  disabled,
  inputClass,
  cabOwner,
  setCabOwner,
  driverName,
  setDriverName,
  aadharNumber,
  setAadharNumber,
  dlNumber,
  setDlNumber,
  pickupPoint,
  setPickupPoint,
  dropPoint,
  setDropPoint,
  startKm,
  setStartKm,
  endKm,
  setEndKm,
  totalKm,
  aadharError,
  dlError,
  clearAadharError,
  clearDlError,
  odometerStart,
  setOdometerStart,
  odometerEnd,
  setOdometerEnd,
  fare,
  setFare,
}) => {
  return (
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
          className={inputClass}
        />
      </div>

      {/* Driver Name */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Driver Name *</label>
        <input
          type="text"
          name="driverName"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          disabled={disabled}
          required
          className={inputClass}
        />
      </div>

      {/* Aadhar Number (optional) */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">
          Aadhar Number(Driver)
        </label>
        <input
          type="text"
          name="aadharNumber"
          value={aadharNumber}
          onChange={(e) => {
            setAadharNumber(e.target.value);
            clearAadharError();
          }}
          disabled={disabled}
          className={inputClass}
        />
        {aadharError && (
          <p className="mt-1 text-sm text-red-600">{aadharError}</p>
        )}
      </div>

      {/* DL Number (optional) */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">
          DL Number (Driver)
        </label>
        <input
          type="text"
          name="dlNumber"
          value={dlNumber}
          onChange={(e) => {
            setDlNumber(e.target.value);
            clearDlError();
          }}
          disabled={disabled}
          className={inputClass}
        />
        {dlError && <p className="mt-1 text-sm text-red-600">{dlError}</p>}
      </div>

      {/* Pickup Point */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Pickup Point *</label>
        <input
          type="text"
          name="pickupPoint"
          value={pickupPoint}
          onChange={(e) => setPickupPoint(e.target.value)}
          disabled={disabled}
          required
          className={inputClass}
        />
      </div>

      {/* Drop Point */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Drop Point *</label>
        <input
          type="text"
          name="dropPoint"
          value={dropPoint}
          onChange={(e) => setDropPoint(e.target.value)}
          disabled={disabled}
          required
          className={inputClass}
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
          className={inputClass}
        />
      </div>

      {/* Odometer Start (driver) - image upload */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">
          Odometer Start (Driver) Image
        </label>
        <div className="relative">
          <label
            className={`${inputClass} flex items-center justify-between bg-gray-100 cursor-pointer`}
          >
            <span className="text-sm font-medium">Choose File</span>
            <span className="text-sm text-gray-600 ml-2">
              {odometerStart
                ? typeof odometerStart === "string"
                  ? "Selected"
                  : (odometerStart as File).name
                : "No file chosen"}
            </span>
            <input
              type="file"
              name="odometerStart"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file && setOdometerStart) {
                  setOdometerStart(file as any);
                }
              }}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>
        {odometerStart && typeof odometerStart === "string" && (
          <img
            src={odometerStart}
            alt="start-odo"
            className="mt-2 w-32 h-20 object-cover rounded"
          />
        )}
        {odometerStart && typeof odometerStart !== "string" && (
          <img
            src={URL.createObjectURL(odometerStart as File)}
            alt="start-odo-file"
            className="mt-2 w-32 h-20 object-cover rounded"
          />
        )}
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
          className={inputClass}
        />
      </div>

      {/* Odometer End (driver) - image upload */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">
          Odometer End (Driver) Image
        </label>
        <div className="relative">
          <label
            className={`${inputClass} flex items-center justify-between bg-gray-100 cursor-pointer`}
          >
            <span className="text-sm font-medium">Choose File</span>
            <span className="text-sm text-gray-600 ml-2">
              {odometerEnd
                ? typeof odometerEnd === "string"
                  ? "Selected"
                  : (odometerEnd as File).name
                : "No file chosen"}
            </span>
            <input
              type="file"
              name="odometerEnd"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file && setOdometerEnd) {
                  setOdometerEnd(file as any);
                }
              }}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>
        {odometerEnd && typeof odometerEnd === "string" && (
          <img
            src={odometerEnd}
            alt="end-odo"
            className="mt-2 w-32 h-20 object-cover rounded"
          />
        )}
        {odometerEnd && typeof odometerEnd !== "string" && (
          <img
            src={URL.createObjectURL(odometerEnd as File)}
            alt="end-odo-file"
            className="mt-2 w-32 h-20 object-cover rounded"
          />
        )}
      </div>

      {/* Total Kilometers */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">
          Total Kilometers
        </label>
        <input
          type="text"
          name="totalKm"
          value={typeof totalKm !== "undefined" ? String(totalKm) : ""}
          disabled
          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
        />
      </div>

      {/* Fare */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Fare</label>
        <input
          type="number"
          name="fare"
          value={fare || ""}
          onChange={(e) => setFare && setFare(e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </div>
    </div>
  );
};

export default VendorFormFields;
