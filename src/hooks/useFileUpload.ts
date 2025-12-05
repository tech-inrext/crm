// hooks/useFileUpload.ts
import { useState } from 'react';
import axios from 'axios';
import { UploadUrlResponse } from '@/types/trainingVideo';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    setUploading(true);
    setError(null);

    try {
      const response = await axios.post<UploadUrlResponse>('/api/v0/s3/upload-url', {
        fileName: file.name,
        fileType: file.type,
      });

      const { uploadUrl, fileUrl } = response.data;

      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        withCredentials: false 
      });

      setUploading(false);
      return fileUrl;
    } catch (err: any) {
      setUploading(false);
      setError(err.response?.data?.message || 'Failed to upload file');
      throw new Error(err.response?.data?.message || 'Failed to upload file');
    }
  };

  return {
    uploadFile,
    uploading,
    error,
  };
}
