"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roles: {
    _id: string;
    name: string;
    read?: string[];
    write?: string[];
    delete?: string[];
  }[]; // Backend returns array of role objects
  currentRole?: {
    _id: string;
    name: string;
    read?: string[];
    write?: string[];
    delete?: string[];
  }; // Current active role from session with permissions
  designation?: string;
  departmentId?: string;
  managerId?: string;
  joiningDate?: string;
  gender?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  pendingRoleSelection: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ needsRoleSelection: boolean; userData?: User }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  switchRole: (roleId: string) => Promise<void>; // Use roleId instead of role name
  completeRoleSelection: (roleId: string) => Promise<void>;
  cancelRoleSelection: () => void;
  // Helper functions to work with role objects
  getCurrentRoleName: () => string | null;
  getAvailableRoleNames: () => string[];
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
  ); // Helper functions to safely extract role information
  const getCurrentRoleName = () => {
    if (!user) return null;
    if (user.currentRole) {
      return user.currentRole.name;
    }
    return null;
  };

  const getAvailableRoleNames = () => {
    if (!user?.roles) return [];
    return user.roles.map((role) => role.name);
  };

  const getRoleId = (role: any): string => {
    return typeof role === "string" ? role : role._id;
  };

  const checkAuth = async () => {
    try {
      // First get the basic profile to ensure authentication and get user ID
      const profileResponse = await axios.get(
        "/api/v0/employee/loggedInUserProfile",
        {
          withCredentials: true,
          timeout: 5000,
        }
      );

      if (profileResponse.data.success && profileResponse.data.data) {
        const profileData = profileResponse.data.data;
        console.log("✅ Profile authentication successful:", profileData);

        // Now get full employee data with roles populated
        try {
          const employeeResponse = await axios.get(
            `/api/v0/employee/${profileData.id}`,
            {
              withCredentials: true,
              timeout: 5000,
            }
          );

          if (employeeResponse.data.success && employeeResponse.data.data) {
            const fullEmployeeData = employeeResponse.data.data;
            console.log("✅ Full employee data retrieved:", fullEmployeeData);
            // Combine profile data (which has current role info) with full employee data
            const userData = {
              ...fullEmployeeData,
              _id: fullEmployeeData._id,
              currentRole: profileData.role
                ? { _id: "", name: profileData.role }
                : undefined,
            };

            setUser(userData);
          } else {
            console.log("❌ Failed to get full employee data");
            setUser(null);
          }
        } catch (employeeError) {
          console.log(
            "❌ Error fetching full employee data, using profile only"
          );
          // Fallback to profile data only if employee endpoint fails
          setUser({
            _id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            roles: [], // No roles available in profile endpoint
            currentRole: profileData.role
              ? { _id: "", name: profileData.role }
              : undefined,
            designation: profileData.designation,
            departmentId: profileData.departmentId,
            managerId: profileData.managerId,
            joiningDate: profileData.joiningDate,
            gender: profileData.gender,
            address: profileData.address,
          });
        }
      } else {
        console.log("❌ Authentication failed:", profileResponse.data.message);
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

  // Complete the role selection process after login
  const completeRoleSelection = async (roleId: string) => {
    if (!pendingRoleSelection) {
      throw new Error("No pending role selection");
    }

    try {
      console.log(
        "🔄 AuthContext: Completing role selection with role:",
        roleId
      );

      // Since backend login doesn't support direct role selection,
      // we need to call switch-role after login
      const response = await axios.post(
        "/api/v0/employee/switch-role",
        {
          roleId: roleId, // Backend expects 'roleId' field
        },
        {
          withCredentials: true,
          timeout: 10000,
        }
      );
      if (response.data.success) {
        console.log("✅ Role selection completed successfully");
        setPendingRoleSelection(null);

        // Update user with the selected role including permissions
        if (response.data.role && pendingRoleSelection) {
          setUser({
            ...pendingRoleSelection,
            currentRole: response.data.role, // This includes permissions
          });
        } else {
          // Fallback: refresh user data to get updated role information
          await checkAuth();
        }
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
        } else if (userData.roles && userData.roles.length === 1) {
          // Single role, automatically switch to it
          console.log(
            "✅ Single role detected, auto-selecting:",
            userData.roles[0]
          );
          setPendingRoleSelection(userData);

          // Auto-select the single role
          await completeRoleSelection(userData.roles[0]._id);

          return { needsRoleSelection: false };
        } else {
          throw new Error("No roles assigned to user");
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
  const switchRole = async (roleId: string) => {
    try {
      console.log("🔄 AuthContext: Switching role to:", roleId);
      console.log("🔄 AuthContext: Current user:", user);

      const response = await axios.post(
        "/api/v0/employee/switch-role",
        {
          roleId: roleId, // Backend expects 'roleId' field
        },
        {
          withCredentials: true,
          timeout: 10000,
        }
      );

      console.log("✅ AuthContext: Switch role API response:", response.data);

      if (response.data.success) {
        // Update user's current role with the full role object from backend
        if (response.data.role && user) {
          setUser({
            ...user,
            currentRole: response.data.role, // This includes permissions
          });
        } else {
          // Fallback: refresh user data to get updated role information
          await checkAuth();
        }
      } else {
        throw new Error(response.data.message || "Role switch failed");
      }
    } catch (error) {
      console.error("❌ AuthContext: Failed to switch role:", error);
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
    switchRole,
    completeRoleSelection,
    cancelRoleSelection,
    getCurrentRoleName,
    getAvailableRoleNames,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
