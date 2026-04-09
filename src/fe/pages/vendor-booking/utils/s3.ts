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
