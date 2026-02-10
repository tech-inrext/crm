import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Pillar, PillarFormData, PillarsResponse, ApiResponse } from "@/types/pillar";

interface UsePillarsParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export function usePillars({
  search = "",
  category = "",
  page = 1,
  limit = 12
}: UsePillarsParams = {}) {
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);

  const loadPillars = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<PillarsResponse>("/api/v0/pillars", {
        params: {
          search,
          category,
          page,
          limit,
        },
      });

      const { data, pagination } = response.data;
      setPillars(data || []);
      setTotalItems(pagination?.totalItems || 0);
    } catch (err: any) {
      console.error("Failed to load pillars:", err);
      setError(err.response?.data?.message || "Failed to load pillars");
      setPillars([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [search, category, page, limit]);

  const createPillar = useCallback(async (pillarData: PillarFormData): Promise<Pillar> => {
    try {
      const response = await axios.post<ApiResponse<Pillar>>("/api/v0/pillars", pillarData);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create pillar");
      }
      await loadPillars(); // Refresh the list
      return response.data.data!;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to create pillar");
    }
  }, [loadPillars]);

  const updatePillar = useCallback(async (id: string, pillarData: Partial<PillarFormData>): Promise<Pillar> => {
    try {
      const response = await axios.patch<ApiResponse<Pillar>>(`/api/v0/pillars/${id}`, pillarData);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update pillar");
      }
      await loadPillars(); 
      return response.data.data!;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to update pillar");
    }
  }, [loadPillars]);

  const deletePillar = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await axios.delete<ApiResponse<void>>(`/api/v0/pillars/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete pillar");
      }
      await loadPillars(); 
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to delete pillar");
    }
  }, [loadPillars]);

  useEffect(() => {
    loadPillars();
  }, [loadPillars]);

  return {
    pillars,
    loading,
    error,
    totalItems,
    createPillar,
    updatePillar,
    deletePillar,
    refresh: loadPillars,
  };
}

