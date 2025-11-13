import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { TrainingVideo, Category, TrainingVideoFormData, TrainingVideosResponse, ApiResponse } from "@/types/trainingVideo";

interface UseTrainingVideosParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export function useTrainingVideos({
  search = "",
  category = "",
  page = 1,
  limit = 12,
  sortBy = "uploadDate",
  sortOrder = "desc"
}: UseTrainingVideosParams = {}) {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);

  const loadVideos = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<TrainingVideosResponse>("/api/v0/training-videos", {
        params: {
          search,
          category,
          page,
          limit,
          sortBy,
          sortOrder,
        },
      });

      const { data, featured, pagination } = response.data;
      setVideos(data || []);
      setFeaturedVideos(featured || []);
      setTotalItems(pagination?.totalItems || 0);
    } catch (err: any) {
      console.error("Failed to load training videos:", err);
      setError(err.response?.data?.message || "Failed to load videos");
      setVideos([]);
      setFeaturedVideos([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [search, category, page, limit, sortBy, sortOrder]);

  const createVideo = useCallback(async (videoData: TrainingVideoFormData): Promise<TrainingVideo> => {
    try {
      const response = await axios.post<ApiResponse<TrainingVideo>>("/api/v0/training-videos", videoData);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create video");
      }
      await loadVideos(); // Refresh the list
      return response.data.data!;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to create video");
    }
  }, [loadVideos]);

  const updateVideo = useCallback(async (id: string, videoData: Partial<TrainingVideoFormData>): Promise<TrainingVideo> => {
    try {
      const response = await axios.patch<ApiResponse<TrainingVideo>>(`/api/v0/training-videos/${id}`, videoData);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update video");
      }
      await loadVideos(); // Refresh the list
      return response.data.data!;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to update video");
    }
  }, [loadVideos]);

  const deleteVideo = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await axios.delete<ApiResponse<void>>(`/api/v0/training-videos/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete video");
      }
      await loadVideos(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to delete video");
    }
  }, [loadVideos]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  return {
    videos,
    featuredVideos,
    loading,
    error,
    totalItems,
    createVideo,
    updateVideo,
    deleteVideo,
    refresh: loadVideos,
  };
}

export function useTrainingVideoCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse<Category[]>>("/api/v0/training-videos/categories");
      if (response.data.success) {
        setCategories(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to load categories");
      }
    } catch (err: any) {
      console.error("Failed to load categories:", err);
      setError(err.response?.data?.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { 
    categories, 
    loading, 
    error,
    refresh: loadCategories 
  };
}