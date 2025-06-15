"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

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
      // Use the working profile endpoint
      const response = await axios.get("/api/v0/employee/loggedInUserProfile", {
        withCredentials: true,
        timeout: 5000,
      });

      if (response.data.success && response.data.data) {
        console.log("✅ Authentication successful:", response.data.data);
        setUser(response.data.data);      } else {
        console.log("❌ Authentication failed:", response.data.message);
        setUser(null);
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      console.log(
        "❌ Auth check error:",
        axiosError.response?.data?.message || axiosError.message || "Unknown error"
      );
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "/api/v0/employee/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
          timeout: 10000,
        }
      );

      if (response.data.success) {
        console.log("✅ Login successful:", response.data.employee);        // Set user from login response
        setUser(response.data.employee);

        // Also verify auth check works after login
        setTimeout(() => {
          checkAuth();
        }, 100);      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      console.error(
        "❌ Login error:",
        axiosError.response?.data?.message || axiosError.message || "Unknown error"
      );
      throw new Error(axiosError.response?.data?.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "/api/v0/employee/logout",
        {},
        {
          withCredentials: true,
          timeout: 5000,
        }      );
      console.log("✅ Logout successful");
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      console.error(
        "❌ Logout error:",
        axiosError.response?.data?.message || axiosError.message || "Unknown error"
      );
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Simplified activity tracking (no aggressive session management)
  useEffect(() => {
    if (!user) return;

    // Only auto-logout after very long inactivity (2 hours)
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log("⏰ Long inactivity timeout - logging out");
        logout();
      }, 2 * 60 * 60 * 1000); // 2 hours
    };

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Track minimal user activity
    const activityEvents = ["mousedown", "keypress", "touchstart"];
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start inactivity timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
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
