"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import {
  getProfileDetails,
  selectRole,
  createLogin,
} from "@/service/auth.service";
import LoginRoleSelector from "@/components/ui/LoginRoleSelector";
import { useRouter } from "next/navigation";

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
  currentRole?:
    | string
    | {
        _id: string;
        name: string;
        read?: string[];
        write?: string[];
        delete?: string[];
      }; // Can be either role ID (string) or full role object
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
  login: (email: string, password: string) => Promise<{ userData?: User }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  switchRole: (roleId: string) => Promise<void>; // Use roleId instead of role name
  completeRoleSelection: (roleId: string) => Promise<void>;
  cancelRoleSelection: () => void;
  setChangeRole: (value: boolean) => void;
  // Helper functions to work with role objects
  getCurrentRoleName: () => string | null;
  getAvailableRoleNames: () => string[];
  getPermissions: (module: string) => {
    hasReadAccess: boolean;
    hasWriteAccess: boolean;
    hasDeleteAccess: boolean;
  };
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
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRoleSelection, setPendingRoleSelection] =
    useState<boolean>(false); // Helper functions to safely extract role information
  const [changeRole, setChangeRole] = useState<boolean>(false);

  const getCurrentRoleName = () => {
    if (!user) return null;

    if (user.currentRole) {
      // If currentRole is a string (ID), find the role name from user.roles
      if (typeof user.currentRole === "string") {
        const role = user.roles?.find((r) => r._id === user.currentRole);
        return role?.name || null;
      }
      // If currentRole is an object, return its name
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

  const checkAuth = React.useCallback(async () => {
    try {
      // First get the basic profile to ensure authentication and get user ID
      const profileResponse = await getProfileDetails();
      if (profileResponse && profileResponse.data) {
        setUser(profileResponse.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete the role selection process after login
  const completeRoleSelection = async (roleId: string) => {
    try {
      const response = await selectRole(roleId);

      if (response.success) {
        setChangeRole(false);
        setPendingRoleSelection(false);
        setUser({
          ...user,
          currentRole: response.role._id,
        });
      } else {
        throw new Error(response.message || "Role selection failed");
      }
    } catch (error) {
      console.error("AuthContext: Failed to complete role selection:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await createLogin(email, password);

      if (response.success) {
        setUser(response.employee);
        if (!response?.employee?.currentRole) {
          setPendingRoleSelection(true);
        }
        // Redirect to dashboard after login
        router.push("/dashboard/select-role");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: unknown) {
      console.error("❌ Login error:", error);
      throw error;
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
      console.log("Logout successful");
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error(
        "Logout error:",
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
      console.error("AuthContext: Failed to switch role:", error);
      throw error;
    }
  };

  // Cancel role selection process
  const cancelRoleSelection = () => {
    console.log("AuthContext: Role selection cancelled");
    setPendingRoleSelection(null);
    // Also logout the user since they cancelled role selection
    logout();
  };

  const handleRoleSelect = async (selectedRoleId: string) => {
    try {
      await completeRoleSelection(selectedRoleId);
      setPendingRoleSelection(false);
      // Redirect to dashboard after role selection
      router.push("/");
    } catch (error) {
      console.error("Role selection failed:", error);
    }
  };

  const handleClose = () => {
    setPendingRoleSelection(false);
    setChangeRole(false);
  };

  const getPermissions = (module: string) => {
    if (!user) {
      return {
        hasReadAccess: false,
        hasWriteAccess: false,
        hasDeleteAccess: false,
      };
    }

    // If currentRole is just an ID (string), find the full role object from user.roles
    let currentRole = user.currentRole;
    if (typeof currentRole === "string" && user.roles) {
      currentRole = user.roles.find((role) => role._id === currentRole);
    }

    if (!currentRole || typeof currentRole === "string") {
      return {
        hasReadAccess: false,
        hasWriteAccess: false,
        hasDeleteAccess: false,
      };
    }

    const hasReadAccess = currentRole.read?.includes(module) || false;
    const hasWriteAccess = currentRole.write?.includes(module) || false;
    const hasDeleteAccess = currentRole.delete?.includes(module) || false;

    return { hasReadAccess, hasWriteAccess, hasDeleteAccess };
  };

  useEffect(() => {
    // Let's have this failing api for now
    checkAuth();
  }, [checkAuth]);

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
    setChangeRole,
    getPermissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {(pendingRoleSelection || changeRole) && user && (
        <LoginRoleSelector
          open
          showCancel={changeRole}
          userName={user?.name}
          userEmail={user?.email}
          availableRoles={user?.roles || []}
          currentRole={user?.currentRole}
          onRoleSelect={handleRoleSelect}
          onClose={handleClose}
        />
      )}
    </AuthContext.Provider>
  );
};
