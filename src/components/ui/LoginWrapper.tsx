"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import RoleSelectionDialog from "./RoleSelectionDialog";

interface LoginWrapperProps {
  children: React.ReactNode;
}

const LoginWrapper: React.FC<LoginWrapperProps> = ({ children }) => {
  const { user, switchRole } = useAuth();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  useEffect(() => {
    // Show role selection if user has multiple roles and no current role is set
    if (user && user.roles && user.roles.length > 1 && !user.currentRole) {
      setShowRoleSelection(true);
    }
  }, [user]);

  const handleRoleSelect = async (role: string) => {
    try {
      await switchRole(role);
      setShowRoleSelection(false);
    } catch (error) {
      console.error("Failed to select role:", error);
    }
  };

  const handleCloseRoleSelection = () => {
    // If user doesn't select a role, use the first available role
    if (user && user.roles && user.roles.length > 0) {
      handleRoleSelect(user.roles[0]);
    }
  };

  return (
    <>
      {children}
      <RoleSelectionDialog
        open={showRoleSelection}
        userRoles={user?.roles || []}
        currentRole={user?.currentRole}
        onRoleSelect={handleRoleSelect}
        onClose={handleCloseRoleSelection}
        userName={user?.name}
      />
    </>
  );
};

export default LoginWrapper;
