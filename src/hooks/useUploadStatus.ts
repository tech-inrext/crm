// hooks/useUploadStatus.ts
import { useEffect, useState } from "react";
import axios from "axios";

interface Upload {
  _id: string;
  createdAt: string;
  totalRecords: number;
  uploaded: number;
  duplicates: number;
  invalidPhones: number;
  uploadedBy?: {
    name: string;
  };
  status?: string;
}

interface UseUploadsResult {
  uploads: Upload[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  fetchUploads: (page?: number, limit?: number) => void;
}

const apiClient = axios.create({
  timeout: 5000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


export function useUploadStatus(): UseUploadsResult {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUploads = async (page = 1, limit = 5) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/api/v0/lead/upload-status?page=${page}&limit=${limit}`);
      setUploads(res.data.data);
      setCurrentPage(res.data.pagination.currentPage);
      setItemsPerPage(res.data.pagination.itemsPerPage);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.totalItems);
      return res.data;
    } catch (err: any) {
      setError("Failed to fetch uploads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchUploads(currentPage, itemsPerPage);
}, [currentPage, itemsPerPage]);


 return {
  uploads,
  loading,
  error,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  fetchUploads,
  setCurrentPage,
  setItemsPerPage,
};
}
