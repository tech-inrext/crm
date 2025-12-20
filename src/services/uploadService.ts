// services/uploadService.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v0';

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number;
  };
  message?: string;
}

export const uploadService = {
  // Validate file size
  validateFileSize: (file: File, maxSizeMB = 200): boolean => {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB`);
    }
    return true;
  },

  // Get upload URL from backend
  getUploadUrl: async (fileName: string, fileType: string): Promise<{ uploadUrl: string; fileUrl: string }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/s3/upload-url`, {
        fileName,
        fileType,
      });
      
      if (response.data.uploadUrl && response.data.fileUrl) {
        return {
          uploadUrl: response.data.uploadUrl,
          fileUrl: response.data.fileUrl,
        };
      }
      throw new Error('Failed to get upload URL');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get upload URL');
    }
  },

  // Upload file directly to S3
  uploadFileDirect: async (file: File): Promise<UploadResponse> => {
    try {
      // Validate file size
      uploadService.validateFileSize(file, 200);

      // Get pre-signed URL from your backend
      const { uploadUrl, fileUrl } = await uploadService.getUploadUrl(file.name, file.type);

      // Upload directly to S3
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        withCredentials: false,
        timeout: 300000, 
      });

      return {
        success: true,
        data: {
          url: fileUrl,
          fileName: file.name,
          originalName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
      };
    } catch (error: any) {
      console.error('Direct upload error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload file to storage',
      };
    }
  },

  // Base64 upload for small files
  uploadFileBase64: async (file: File): Promise<UploadResponse> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve({
          success: true,
          data: {
            url: base64,
            fileName: file.name,
            originalName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
        });
      };
      reader.onerror = () => resolve({
        success: false,
        message: 'Failed to read file'
      });
      reader.readAsDataURL(file);
    });
  },

  // Main upload function - chooses method based on file size
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const MAX_BASE64_SIZE = 5 * 1024 * 1024; // 5MB
    
    try {
      if (file.size > MAX_BASE64_SIZE) {
        return await uploadService.uploadFileDirect(file);
      } else {
        return await uploadService.uploadFileBase64(file);
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Upload failed',
      };
    }
  },
};
