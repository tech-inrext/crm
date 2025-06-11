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
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log("Not authenticated:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    try {
      await axios.post("/api/v0/employee/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post("/api/v0/employee/login", {
      email,
      password,
    });

    if (response.data.success) {
      setUser(response.data.employee);
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
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Aggressive session management - clear session when user leaves page
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Page hidden - clearing session");
        clearSession();
      }
    };

    const handleWindowBlur = () => {
      console.log("Window blur - clearing session");
      clearSession();
    };

    const handleBeforeUnload = () => {
      console.log("Page unload - clearing session");
      clearSession();
    };

    const handlePageHide = () => {
      console.log("Page hide - clearing session");
      clearSession();
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    // Auto-logout after 5 minutes of inactivity
    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        console.log("Inactivity timeout - clearing session");
        clearSession();
      }, 5 * 60 * 1000); // 5 minutes
    };

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Track user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start inactivity timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);

      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
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
