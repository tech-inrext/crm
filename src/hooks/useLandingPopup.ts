import { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface LandingPopupData {
  _id?: string;
  propertyName: string;
  location: string;
  imageUrl: string;
  buttonText: string;
  isActive: boolean;
}

export function useLandingPopup() {
  const [popup, setPopup] = useState<LandingPopupData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLandingPopup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/v0/public/landing-popup");
      if (res.data && res.data.success) {
        setPopup(res.data.data || null);
      } else {
        setPopup(null);
      }
    } catch (err: any) {
      console.error("Failed to load landing popup", err);
      setError(err.response?.data?.message || err.message || "Failed to load landing popup");
      setPopup(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLandingPopup = useCallback(async (data: LandingPopupData) => {
    try {
      const res = await axios.post("/api/v0/landing-popup", data);
      if (!res.data.success) throw new Error(res.data.message || "Failed to create");
      await loadLandingPopup();
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to create landing popup");
    }
  }, [loadLandingPopup]);

  const updateLandingPopup = useCallback(async (data: Partial<LandingPopupData>) => {
    try {
      const res = await axios.patch("/api/v0/landing-popup", data);
      if (!res.data.success) throw new Error(res.data.message || "Failed to update");
      await loadLandingPopup();
      return res.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to update landing popup");
    }
  }, [loadLandingPopup]);

  const deleteLandingPopup = useCallback(async () => {
    try {
      const res = await axios.delete("/api/v0/landing-popup");
      if (!res.data.success) throw new Error(res.data.message || "Failed to delete");
      await loadLandingPopup();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to delete landing popup");
    }
  }, [loadLandingPopup]);

  useEffect(() => {
    loadLandingPopup();
  }, [loadLandingPopup]);

  return {
    popup,
    loading,
    error,
    createLandingPopup,
    updateLandingPopup,
    deleteLandingPopup,
    refresh: loadLandingPopup,
  };
}

export type { LandingPopupData };
