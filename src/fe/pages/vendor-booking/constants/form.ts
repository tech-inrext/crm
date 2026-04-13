import * as Yup from "yup";

export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

export const VENDOR_BOOKING_INITIAL_VALUES = {
  cabOwner: "",
  driverName: "",
  aadharNumber: "",
  dlNumber: "",
  startKm: "",
  endKm: "",
  odometerStart: null as File | string | null,
  odometerEnd: null as File | string | null,
  fare: "",
  pickupPoint: "",
  dropPoint: "",
};

export const VENDOR_BOOKING_VALIDATION_SCHEMA = Yup.object()
  .shape({
    cabOwner: Yup.string()
      .trim()
      .min(3, "Please provide the cab owner's full name (minimum 3 characters).")
      .required("Cab owner's name is required."),
    driverName: Yup.string()
      .trim()
      .min(3, "Please provide the driver's full name (minimum 3 characters).")
      .required("Driver name is required."),
    aadharNumber: Yup.string()
      .nullable()
      .transform((v) => (v ? String(v).replace(/\D/g, "") : ""))
      .test(
        "aadhar-length",
        "Aadhar number must contain 12 digits.",
        (val) => !val || val.length >= 12
      ),
    dlNumber: Yup.string()
      .nullable()
      .transform((v) => (v ? String(v) : ""))
      .test(
        "dl-length",
        "Driver's license must contain 10 alphanumeric characters.",
        (val) => !val || String(val).replace(/[^a-zA-Z0-9]/g, "").length >= 10
      ),
    pickupPoint: Yup.string()
      .trim()
      .min(3, "Please enter a valid pickup location (minimum 3 characters).")
      .required("Pickup point is required."),
    dropPoint: Yup.string()
      .trim()
      .min(3, "Please enter a valid drop location (minimum 3 characters).")
      .required("Drop point is required."),
    startKm: Yup.number()
      .typeError("Please enter the start odometer reading as a number.")
      .required("Start kilometers is required."),
    endKm: Yup.number()
      .typeError("Please enter the end odometer reading as a number.")
      .required("End kilometers is required."),
    fare: Yup.number()
      .nullable()
      .transform((v) => (v === "" ? null : Number(v))),
    odometerStart: Yup.mixed()
      .nullable()
      .test("fileSize", "File size must be 1 MB or smaller.", (value) => {
        if (!value || typeof value === "string") return true;
        return value.size <= MAX_FILE_SIZE;
      }),
    odometerEnd: Yup.mixed()
      .nullable()
      .test("fileSize", "File size must be 1 MB or smaller.", (value) => {
        if (!value || typeof value === "string") return true;
        return value.size <= MAX_FILE_SIZE;
      }),
  })
  .test(
    "end-gte-start",
    "End kilometers must be greater than or equal to start kilometers.",
    function (values) {
      const { startKm, endKm } = values as any;
      if (startKm === undefined || endKm === undefined) return true;
      const s = Number(startKm);
      const e = Number(endKm);
      if (Number.isNaN(s) || Number.isNaN(e)) return true;
      return e >= s;
    }
  );
