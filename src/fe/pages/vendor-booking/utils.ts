/**
 * Calculates total KM based on odometer entries or manual inputs
 */
export const calculateTotalKm = (start: any, end: any): number => {
  const isNumericString = (v: any) =>
    typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v));

  if (isNumericString(start) && isNumericString(end)) {
    return Math.max(Number(end) - Number(start), 0);
  }
  
  const startNum = Number(start);
  const endNum = Number(end);

  if (!Number.isNaN(startNum) && !Number.isNaN(endNum)) {
    return Math.max(endNum - startNum, 0);
  }

  return 0;
};

/**
 * Maps Formik values to the payload expected by the API/onSubmit handler
 */
export const mapFormValuesToPayload = (values: any) => {
  const totalKm = calculateTotalKm(
    values.odometerStart ?? values.startKm,
    values.odometerEnd ?? values.endKm
  );

  return {
    cabOwner: values.cabOwner,
    driverName: values.driverName,
    aadharNumber: values.aadharNumber,
    dlNumber: values.dlNumber,
    startKm: values.startKm,
    endKm: values.endKm,
    odometerStartPreview:
      values.odometerStart && typeof values.odometerStart !== "string"
        ? null
        : values.odometerStart,
    odometerEndPreview:
      values.odometerEnd && typeof values.odometerEnd !== "string"
        ? null
        : values.odometerEnd,
    odometerStartFile:
      values.odometerStart instanceof File ? values.odometerStart : null,
    odometerEndFile:
      values.odometerEnd instanceof File ? values.odometerEnd : null,
    fare: values.fare ? Number(values.fare) : null,
    pickupPoint: values.pickupPoint,
    dropPoint: values.dropPoint,
    totalKm,
  };
};

/** 
 * Upload a single File to S3 via the presigned-URL endpoint 
 */
export async function uploadFileToS3(file: File): Promise<{ fileUrl: string }> {
  const presignRes = await fetch("/api/v0/s3/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });
  
  if (!presignRes.ok) {
    const txt = await presignRes.text().catch(() => "");
    throw new Error(`Failed to get upload URL: ${presignRes.status} ${txt}`);
  }
  
  const { uploadUrl, fileUrl } = await presignRes.json();
  if (!uploadUrl || !fileUrl) throw new Error("Invalid presign response");

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  
  if (!uploadRes.ok) throw new Error(`S3 upload failed: ${uploadRes.status}`);
  return { fileUrl };
}
