"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginWrapperProps {
  children: React.ReactNode;
}

const LoginWrapper: React.FC<LoginWrapperProps> = ({ children }) => {
  const { user, switchRole } = useAuth();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  useEffect(() => {
    // Show role selection if user has multiple roles and no current role is set
    const getAvailableRoleNames = () => {
      if (!user?.roles) return 0;
      return user.roles.length;
    };

    const getCurrentRoleName = () => {
      if (user?.currentRole) {
        if (typeof user.currentRole === "string") {
          return user.currentRole;
        }
        return user.currentRole.name;
      }
      return null;
    };

    if (user && getAvailableRoleNames() > 1 && !getCurrentRoleName()) {
      setShowRoleSelection(true);
    }
  }, [user]);

  const handleRoleSelect = async (roleName: string) => {
    try {
      // Find the role ID from the role name
      const getRoleId = (name: string) => {
        if (!user?.roles) return name;
        const role = user.roles.find((r: any) => r.name === name);
        return role ? role._id : name;
      };

      const roleId = getRoleId(roleName);
      await switchRole(roleId);
      setShowRoleSelection(false);
    } catch (error) {
      console.error("Failed to select role:", error);
    }
  };

  const handleCloseRoleSelection = () => {
    // If user doesn't select a role, use the first available role
    if (user?.roles && user.roles.length > 0) {
      const firstRoleName =
        typeof user.roles[0] === "string" ? user.roles[0] : user.roles[0].name;
      handleRoleSelect(firstRoleName);
    }
  };

  return <>{children}</>;
};

export default LoginWrapper;
