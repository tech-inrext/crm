"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get("/api/v0/employee/loggedInUserProfile");
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        // Set session marker
        sessionStorage.setItem("userActive", "true");
      } else {
        setUser(null);
        sessionStorage.removeItem("userActive");
      }
    } catch (error) {
      console.log("Not authenticated:", error);
      setUser(null);
      sessionStorage.removeItem("userActive");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post("/api/v0/employee/login", {
      email,
      password,
    });

    if (response.data.success) {
      setUser(response.data.employee);
      sessionStorage.setItem("userActive", "true");
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/v0/employee/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      sessionStorage.removeItem("userActive");
    }
  };

  useEffect(() => {
    // Check session storage first
    const wasActive = sessionStorage.getItem("userActive");
    if (!wasActive) {
      // User left and came back - force logout
      setUser(null);
      setLoading(false);
      return;
    }

    checkAuth();
  }, []);

  // Clear session when user becomes inactive or leaves
  useEffect(() => {
    if (!user) return;

    const clearSession = async () => {
      try {
        await axios.post("/api/v0/employee/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        setUser(null);
        sessionStorage.removeItem("userActive");
      }
    };

    // Clear session when tab becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sessionStorage.removeItem("userActive");
        clearSession();
      }
    };

    // Clear session when window loses focus
    const handleWindowBlur = () => {
      sessionStorage.removeItem("userActive");
      clearSession();
    };

    // Clear session on page unload
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("userActive");
    };

    // Auto-logout after 10 minutes of inactivity
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        sessionStorage.removeItem("userActive");
        clearSession();
      }, 10 * 60 * 1000); // 10 minutes
    };

    const handleActivity = () => resetTimer();

    // Activity events
    const events = ["mousedown", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Page visibility and focus events
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Start inactivity timer
    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearTimeout(inactivityTimer);
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
