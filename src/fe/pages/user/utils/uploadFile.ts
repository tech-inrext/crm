import { userService } from "@/fe/pages/user/user.service";

/**
 * Uploads a single file to S3 via a pre-signed URL.
 * Returns the public file URL on success, or `null` if no file is provided.
 *
 * @example
 *   const url = await uploadFile(formData.aadharFile);
 *   payload.aadharUrl = url ?? payload.aadharUrl;
 */
export async function uploadFile(file: File | null | undefined): Promise<string | null> {
    if (!file) return null;

    const { uploadUrl, fileUrl } = await userService.getUploadUrl(file.name, file.type);
    await userService.uploadFileToUrl(uploadUrl, file);
    return fileUrl;
}
