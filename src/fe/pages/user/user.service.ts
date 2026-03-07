import axios from "axios";
import BaseService from "@/fe/service/BaseService";
import { USERS_API_BASE } from "@/fe/pages/user/constants/users";
import type { UploadPresignResponse } from "@/fe/pages/user/types";

class UserService extends BaseService {
  constructor() {
    super(USERS_API_BASE);
  }

  /** Request a pre-signed S3 upload URL – direct axios call (different API root) */
  async getUploadUrl(
    fileName: string,
    fileType: string,
  ): Promise<UploadPresignResponse> {
    const resp = await axios.post<UploadPresignResponse>(
      "/api/v0/s3/upload-url",
      { fileName, fileType },
      { withCredentials: true },
    );
    return resp.data;
  }

  /** Upload a file directly to S3 using a pre-signed URL */
  async uploadFileToUrl(uploadUrl: string, file: File): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      withCredentials: false,
    });
  }
}

/** Singleton – import this everywhere instead of `new UserService()` */
export const userService = new UserService();

export default userService;
