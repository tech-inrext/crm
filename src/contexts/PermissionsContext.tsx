"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface UserPermissions {
  read: string[];
  write: string[];
  delete: string[];
}

interface PermissionsContextType {
  permissions: UserPermissions | null;
  loading: boolean;
  hasReadAccess: (module: string) => boolean;
  hasWriteAccess: (module: string) => boolean;
  hasDeleteAccess: (module: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchUserPermissions = useCallback(async () => {
    // Get current role from user object
    const currentRole = user?.currentRole;

    if (!currentRole) {
      console.log("🔍 PermissionsContext: No active role found");
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      console.log(
        `🔍 PermissionsContext: Using permissions from role "${currentRole.name}"`
      );

      // Check if the role object has permissions
      if (
        currentRole.read !== undefined &&
        currentRole.write !== undefined &&
        currentRole.delete !== undefined
      ) {
        const rolePermissions = {
          read: currentRole.read || [],
          write: currentRole.write || [],
          delete: currentRole.delete || [],
        };

        setPermissions(rolePermissions);
        console.log("✅ User permissions loaded from role:", rolePermissions);
      } else {
        console.log(
          "❌ Current role doesn't have permission details, fetching from API"
        );

        // Fallback: Use the permissions API endpoint if role doesn't have permissions
        const response = await axios.get("/api/v0/employee/permissions", {
          withCredentials: true,
        });

        if (response.data.success && response.data.data) {
          setPermissions(response.data.data);
          console.log(
            "✅ User permissions loaded from API:",
            response.data.data
          );
        } else {
          console.error("❌ Failed to fetch permissions");
          setPermissions(null);
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Error fetching permissions:", errorMessage);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, [user?.currentRole]);

  const hasReadAccess = (module: string): boolean => {
    if (!permissions) return false;
    return permissions.read.includes(module);
  };

  const hasWriteAccess = (module: string): boolean => {
    if (!permissions) return false;
    return permissions.write.includes(module);
  };

  const hasDeleteAccess = (module: string): boolean => {
    if (!permissions) return false;
    return permissions.delete.includes(module);
  };
  const refreshPermissions = useCallback(async () => {
    await fetchUserPermissions();
  }, [fetchUserPermissions]);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    } else {
      setPermissions(null);
      setLoading(false);
    }
  }, [user, fetchUserPermissions]);

  const value: PermissionsContextType = {
    permissions,
    loading,
    hasReadAccess,
    hasWriteAccess,
    hasDeleteAccess,
    refreshPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
