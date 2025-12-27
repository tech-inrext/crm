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
      console.error('S3 URL generation error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get upload URL');
    }
  },

  // Upload file directly to S3
  uploadFile: async (file: File): Promise<UploadResponse> => {
    try {
      // Validate file size
      uploadService.validateFileSize(file, 200);

      console.log('Starting S3 upload for:', file.name);
      
      // Get pre-signed URL from your backend
      const { uploadUrl, fileUrl } = await uploadService.getUploadUrl(file.name, file.type);

      console.log('Got S3 URL, uploading...');
      
      // Upload directly to S3
      const uploadResponse = await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        withCredentials: false,
        timeout: 300000, // 5 minutes timeout for large files
      });

      console.log('Upload successful:', fileUrl);
      
      return {
        success: true,
        data: {
          url: fileUrl,
          fileName: file.name,
          originalName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
        message: 'File uploaded to S3 successfully'
      };
    } catch (error: any) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload file to S3 storage',
      };
    }
  },

  // Check if URL is base64 (for validation)
  isBase64: (url: string): boolean => {
    return url.startsWith('data:');
  },

  // Validate S3 URL format
  isValidS3Url: (url: string): boolean => {
    return url.includes('s3.amazonaws.com') || 
           url.includes('amazonaws.com/s3') ||
           url.startsWith('https://') || 
           url.startsWith('http://');
  }
};
