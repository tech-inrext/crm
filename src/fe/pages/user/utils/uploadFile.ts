import axios from "axios";

const REQUEST_TIMEOUT = 60000; // 60 seconds for presigned URL request
const UPLOAD_TIMEOUT = 300000; // 5 minutes for file upload

/**
 * Uploads a single file to S3 via a pre-signed URL.
 * Returns the public file URL on success, or `null` if no file is provided.
 *
 * @example
 *   const url = await uploadFile(formData.aadharFile);
 *   payload.aadharUrl = url ?? payload.aadharUrl;
 */
export async function uploadFile(
  file: File | null | undefined,
): Promise<string | null> {
  if (!file) return null;

  try {
    // Step 1: Get presigned upload URL (with timeout)
    const uploadUrlResponse = await axios.post<{
      uploadUrl: string;
      fileUrl: string;
    }>(
      "/api/v0/s3/upload-url",
      {
        fileName: file.name,
        fileType: file.type,
      },
      {
        timeout: REQUEST_TIMEOUT,
      },
    );

    const { uploadUrl, fileUrl } = uploadUrlResponse.data;

    // Step 2: Upload file to S3 (with extended timeout for large files)
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      withCredentials: false,
      timeout: UPLOAD_TIMEOUT,
    });

    return fileUrl;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED") {
        throw new Error("Upload timeout - please try again");
      }
      throw new Error(err.response?.data?.message || "File upload failed");
    }
    const error = err instanceof Error ? err : new Error("File upload failed");
    throw error;
  }
}
