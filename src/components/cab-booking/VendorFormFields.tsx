"use client";

import React, { useState } from "react";
import { useFormikContext } from "formik";
import Image from "next/image";

interface Values {
  cabOwner: string;
  driverName: string;
  aadharNumber: string;
  dlNumber: string;
  startKm: string | number;
  endKm: string | number;
  odometerStart: File | string | null;
  odometerEnd: File | string | null;
  fare: string | number | null;
  pickupPoint: string;
  dropPoint: string;
}

interface Props {
  disabled?: boolean;
  inputClass: string;

  totalKm?: number | string;
}

const VendorFormFields: React.FC<Props> = ({
  disabled,
  inputClass,
  totalKm,
}) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    setFieldValue,
    setFieldError,
    setFieldTouched,
  } = useFormikContext<Values>();

  // Local file error state to ensure immediate visibility
  const [odometerStartLocalError, setOdometerStartLocalError] = useState<
    string | null
  >(null);
  const [odometerEndLocalError, setOdometerEndLocalError] = useState<
    string | null
  >(null);

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

  const shouldShowError = (name: keyof Values) => {
    const val = (values as any)[name];
    const t = (touched as any)[name];
    const hasStartedTyping = val !== undefined && val !== null && val !== "";
    return !!(t || hasStartedTyping);
  };

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
          value={values.cabOwner}
          onChange={(e) => {
            setFieldTouched("cabOwner", true, false);
            handleChange(e);
          }}
          disabled={disabled}
          className={inputClass}
        />
        {shouldShowError("cabOwner") && errors.cabOwner && (
          <p className="mt-1 text-sm text-red-600">{errors.cabOwner}</p>
        )}
      </div>

      {/* Driver Name */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Driver Name *</label>
        <input
          type="text"
          name="driverName"
          value={values.driverName}
          onChange={(e) => {
            setFieldTouched("driverName", true, false);
            handleChange(e);
          }}
          disabled={disabled}
          className={inputClass}
        />
        {shouldShowError("driverName") && errors.driverName && (
          <p className="mt-1 text-sm text-red-600">{errors.driverName}</p>
        )}
      </div>

      {/* Aadhar Number (optional) */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">
          Aadhar Number (Driver)
        </label>
        <input
          type="text"
          name="aadharNumber"
          value={values.aadharNumber as string}
          onChange={(e) => {
            setFieldTouched("aadharNumber", true, false);
            setFieldValue(
              "aadharNumber",
              String(e.target.value).replace(/\D/g, "")
            );
          }}
          disabled={disabled}
          className={inputClass}
        />
        {shouldShowError("aadharNumber") && errors.aadharNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.aadharNumber}</p>
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
          value={values.dlNumber as string}
          onChange={(e) => {
            setFieldTouched("dlNumber", true, false);
            handleChange(e);
          }}
          disabled={disabled}
          className={inputClass}
        />
        {shouldShowError("dlNumber") && errors.dlNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.dlNumber}</p>
        )}
      </div>

      {/* Pickup Point */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Pickup Point *</label>
        <input
          type="text"
          name="pickupPoint"
          value={values.pickupPoint}
          onChange={(e) => {
            setFieldTouched("pickupPoint", true, false);
            handleChange(e);
          }}
          disabled={disabled}
          className={inputClass}
        />
        {shouldShowError("pickupPoint") && errors.pickupPoint && (
          <p className="mt-1 text-sm text-red-600">{errors.pickupPoint}</p>
        )}
      </div>

      {/* Drop Point */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">Drop Point *</label>
        <input
          type="text"
          name="dropPoint"
          value={values.dropPoint}
          onChange={(e) => {
            setFieldTouched("dropPoint", true, false);
            handleChange(e);
          }}
          disabled={disabled}
          className={inputClass}
        />
        {shouldShowError("dropPoint") && errors.dropPoint && (
          <p className="mt-1 text-sm text-red-600">{errors.dropPoint}</p>
        )}
      </div>

      {/* Start Kilometers */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">
          Start Kilometers *
        </label>
        <input
          type="number"
          name="startKm"
          value={values.startKm as any}
          onChange={(e) => {
            setFieldTouched("startKm", true, false);
            handleChange(e);
          }}
          disabled={disabled}
          className={inputClass}
        />
        {shouldShowError("startKm") && errors.startKm && (
          <p className="mt-1 text-sm text-red-600">{errors.startKm}</p>
        )}
      </div>

      {/* Odometer Start (driver) - image upload */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">
          Odometer Start Image (Max 1 MB)
        </label>
        <div className="relative">
          <label
            className={`${inputClass} flex items-center justify-between bg-gray-100 cursor-pointer`}
          >
            <span className="text-sm font-medium">Choose File</span>
            <span className="text-sm text-gray-600 ml-2">
              {values.odometerStart
                ? typeof values.odometerStart === "string"
                  ? "Selected"
                  : (values.odometerStart as File).name
                : "No file chosen"}
            </span>
            <input
              type="file"
              name="odometerStart"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                setFieldTouched("odometerStart", true, false);
                if (file) {
                  if (file.size > MAX_FILE_SIZE) {
                    setFieldValue("odometerStart", null);
                    setFieldError(
                      "odometerStart",
                      "File size must be 1 MB or smaller."
                    );
                    setOdometerStartLocalError(
                      "File size must be 1 MB or smaller."
                    );
                  } else {
                    setFieldValue("odometerStart", file);
                    setFieldError("odometerStart", undefined as any);
                    setOdometerStartLocalError(null);
                  }
                } else {
                  setFieldValue("odometerStart", null);
                  setFieldError("odometerStart", undefined as any);
                  setOdometerStartLocalError(null);
                }
              }}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>
        {values.odometerStart && typeof values.odometerStart === "string" && (
          <Image
            src={values.odometerStart}
            alt="start-odo"
            width={128}
            height={80}
            className="mt-2 w-32 h-20 object-cover rounded"
          />
        )}
        {values.odometerStart && typeof values.odometerStart !== "string" && (
          <Image
            src={URL.createObjectURL(values.odometerStart as File)}
            alt="start-odo-file"
            width={128}
            height={80}
            className="mt-2 w-32 h-20 object-cover rounded"
          />
        )}
        {(odometerStartLocalError || errors.odometerStart) && (
          <p className="mt-1 text-sm text-red-600">
            {odometerStartLocalError || errors.odometerStart}
          </p>
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
          value={values.endKm as any}
          onChange={(e) => {
            setFieldTouched("endKm", true, false);
            handleChange(e);
          }}
          disabled={disabled}
          className={inputClass}
        />
        {shouldShowError("endKm") && errors.endKm && (
          <p className="mt-1 text-sm text-red-600">{errors.endKm}</p>
        )}
      </div>

      {/* Odometer End (driver) - image upload */}
      <div className="form-group">
        <label className="block text-sm font-medium mb-1">
          Odometer End Image (Max 1 MB)
        </label>
        <div className="relative">
          <label
            className={`${inputClass} flex items-center justify-between bg-gray-100 cursor-pointer`}
          >
            <span className="text-sm font-medium">Choose File</span>
            <span className="text-sm text-gray-600 ml-2">
              {values.odometerEnd
                ? typeof values.odometerEnd === "string"
                  ? "Selected"
                  : (values.odometerEnd as File).name
                : "No file chosen"}
            </span>
            <input
              type="file"
              name="odometerEnd"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                setFieldTouched("odometerEnd", true, false);
                if (file) {
                  if (file.size > MAX_FILE_SIZE) {
                    setFieldValue("odometerEnd", null);
                    setFieldError(
                      "odometerEnd",
                      "File size must be 1 MB or smaller."
                    );
                    setOdometerEndLocalError(
                      "File size must be 1 MB or smaller."
                    );
                  } else {
                    setFieldValue("odometerEnd", file);
                    setFieldError("odometerEnd", undefined as any);
                    setOdometerEndLocalError(null);
                  }
                } else {
                  setFieldValue("odometerEnd", null);
                  setFieldError("odometerEnd", undefined as any);
                  setOdometerEndLocalError(null);
                }
              }}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>
        {values.odometerEnd && typeof values.odometerEnd === "string" && (
          <Image
            src={values.odometerEnd}
            alt="end-odo"
            width={128}
            height={80}
            className="mt-2 w-32 h-20 object-cover rounded"
          />
        )}
        {values.odometerEnd && typeof values.odometerEnd !== "string" && (
          <Image
            src={URL.createObjectURL(values.odometerEnd as File)}
            alt="end-odo-file"
            width={128}
            height={80}
            className="mt-2 w-32 h-20 object-cover rounded"
          />
        )}
        {(odometerEndLocalError || errors.odometerEnd) && (
          <p className="mt-1 text-sm text-red-600">
            {odometerEndLocalError || errors.odometerEnd}
          </p>
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
          value={values.fare as any}
          onChange={(e) => {
            setFieldTouched("fare", true, false);
            handleChange(e);
          }}
          disabled={disabled}
          className={inputClass}
        />
        {shouldShowError("fare") && errors.fare && (
          <p className="mt-1 text-sm text-red-600">{errors.fare}</p>
        )}
      </div>
    </div>
  );
};

export default VendorFormFields;
