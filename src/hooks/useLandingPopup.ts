import { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface LandingPopupData {
  _id?: string;
  propertyName: string;
  location: string;
  imageUrl: string;
  buttonText: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useLandingPopup() {
  const [popups, setPopups] = useState<LandingPopupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLandingPopups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/v0/landing-popup");
      if (res.data && res.data.success) {
        setPopups(res.data.data || []);
      } else {
        setPopups([]);
      }
    } catch (err: any) {
      console.error("Failed to load landing popups", err);
      setError(err.response?.data?.message || err.message || "Failed to load landing popups");
      setPopups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLandingPopup = useCallback(async (data: LandingPopupData) => {
    try {
      const res = await axios.post("/api/v0/landing-popup", data);
      if (!res.data.success) throw new Error(res.data.message || "Failed to create");
      setPopups((current) => [res.data.data, ...current]);
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to create landing popup");
    }
  }, []);

  const updateLandingPopup = useCallback(async (id: string, data: Partial<LandingPopupData>) => {
    try {
      const res = await axios.patch(`/api/v0/landing-popup/${id}`, data);
      if (!res.data.success) throw new Error(res.data.message || "Failed to update");
      setPopups((current) =>
        current.map((popup) =>
          popup._id === id ? { ...popup, ...res.data.data } : popup,
        ),
      );
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to update landing popup");
    }
  }, []);

  const deleteLandingPopup = useCallback(async (id: string) => {
    try {
      const res = await axios.delete(`/api/v0/landing-popup/${id}`);
      if (!res.data.success) throw new Error(res.data.message || "Failed to delete");
      setPopups((current) => current.filter((popup) => popup._id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to delete landing popup");
    }
  }, []);

  useEffect(() => {
    loadLandingPopups();
  }, [loadLandingPopups]);

  return {
    popups,
    loading,
    error,
    createLandingPopup,
    updateLandingPopup,
    deleteLandingPopup,
    refresh: loadLandingPopups,
  };
}

export type { LandingPopupData };
