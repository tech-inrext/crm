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
  roles?: string[]; // Multiple roles
  currentRole?: string; // Active role for current session
  designation?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  pendingRoleSelection: User | null; // New state for role selection
  login: (
    email: string,
    password: string
  ) => Promise<{ needsRoleSelection: boolean; userData?: User }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  switchRole: (role: string) => Promise<void>; // New method to switch roles
  completeRoleSelection: (role: string) => Promise<void>; // Complete role selection process
  cancelRoleSelection: () => void; // Cancel role selection
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
  const [pendingRoleSelection, setPendingRoleSelection] = useState<User | null>(
    null
  );
  const checkAuth = async () => {
    try {
      // Use the working profile endpoint
      const response = await axios.get("/api/v0/employee/loggedInUserProfile", {
        withCredentials: true,
        timeout: 5000,
      });
      if (response.data.success && response.data.data) {
        console.log("✅ Authentication successful:", response.data.data);
        console.log("🔍 Auth Debug - User roles:", response.data.data.roles);
        console.log(
          "🔍 Auth Debug - User currentRole:",
          response.data.data.currentRole
        );
        setUser(response.data.data);
      } else {
        console.log("❌ Authentication failed:", response.data.message);
        setUser(null);
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.log(
        "❌ Auth check error:",
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Unknown error"
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
        console.log("✅ Login successful:", response.data.employee);
        const userData = response.data.employee;

        // Check if user has multiple roles and needs role selection
        if (userData.roles && userData.roles.length > 1) {
          console.log(
            "🔄 Multiple roles detected, showing role selection:",
            userData.roles
          );
          setPendingRoleSelection(userData);
          return { needsRoleSelection: true, userData };
        } else {
          // Single role or no roles array, proceed with default behavior
          console.log("✅ Single role detected, proceeding with login");
          setUser(userData);

          // Also verify auth check works after login
          setTimeout(() => {
            checkAuth();
          }, 100);

          return { needsRoleSelection: false };
        }
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error(
        "❌ Login error:",
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Unknown error"
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
        }
      );
      console.log("✅ Logout successful");
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error(
        "❌ Logout error:",
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Unknown error"
      );
    } finally {
      setUser(null);
    }
  };
  // Method to switch user's current role
  const switchRole = async (role: string) => {
    try {
      console.log("🔄 AuthContext: Switching role to:", role);
      console.log("🔄 AuthContext: Current user:", user);

      const response = await axios.post(
        "/api/v0/employee/switchRole",
        {
          role,
        },
        {
          withCredentials: true,
          timeout: 10000,
        }
      );

      console.log("✅ AuthContext: Switch role API response:", response.data);

      if (response.data.success && user) {
        const updatedUser = { ...user, currentRole: role };
        console.log("✅ AuthContext: Updated user state:", updatedUser);
        setUser(updatedUser);
      } else {
        throw new Error(response.data.message || "Role switch failed");
      }
    } catch (error) {
      console.error("❌ AuthContext: Failed to switch role:", error);
      console.error("❌ AuthContext: Error response:", error.response?.data);
      throw error;
    }
  };

  // Complete the role selection process after login
  const completeRoleSelection = async (role: string) => {
    if (!pendingRoleSelection) {
      throw new Error("No pending role selection");
    }

    try {
      console.log("🔄 AuthContext: Completing role selection with role:", role);

      // Set the selected role as current role
      const response = await axios.post(
        "/api/v0/employee/switchRole",
        {
          role,
        },
        {
          withCredentials: true,
          timeout: 10000,
        }
      );

      if (response.data.success) {
        const userWithRole = { ...pendingRoleSelection, currentRole: role };
        console.log("✅ AuthContext: Role selection completed:", userWithRole);
        setUser(userWithRole);
        setPendingRoleSelection(null);

        // Verify auth check works after role selection
        setTimeout(() => {
          checkAuth();
        }, 100);
      } else {
        throw new Error(response.data.message || "Role selection failed");
      }
    } catch (error) {
      console.error(
        "❌ AuthContext: Failed to complete role selection:",
        error
      );
      throw error;
    }
  };

  // Cancel role selection process
  const cancelRoleSelection = () => {
    console.log("❌ AuthContext: Role selection cancelled");
    setPendingRoleSelection(null);
    // Also logout the user since they cancelled role selection
    logout();
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
    pendingRoleSelection,
    login,
    logout,
    checkAuth,
    switchRole, // Provide switchRole in context
    completeRoleSelection, // Provide completeRoleSelection in context
    cancelRoleSelection, // Provide cancelRoleSelection in context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
