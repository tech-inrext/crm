"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import LoginRoleSelector from "./LoginRoleSelector";

/**
 * Global wrapper component that shows role selection dialog
 * when a user needs to select a role after login
 */
const RoleSelectionWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { pendingRoleSelection, completeRoleSelection, cancelRoleSelection } =
    useAuth();
  const router = useRouter();

  const handleRoleSelect = async (role: string) => {
    try {
      await completeRoleSelection(role);
      // Navigate to dashboard after successful role selection
      router.push("/dashboard");
    } catch (error) {
      console.error("Role selection failed:", error);
      // Could show a toast notification here
    }
  };

  const handleRoleSelectionCancel = () => {
    cancelRoleSelection();
    // Navigate back to login
    router.push("/login");
  };

  return (
    <>
      {children}

      {/* Global Role Selection Dialog */}
      {pendingRoleSelection && (
        <LoginRoleSelector
          open={true}
          userName={pendingRoleSelection.name}
          userEmail={pendingRoleSelection.email}
          availableRoles={
            pendingRoleSelection.roles || [pendingRoleSelection.role]
          }
          defaultRole={pendingRoleSelection.role}
          onRoleSelect={handleRoleSelect}
          onClose={handleRoleSelectionCancel}
        />
      )}
    </>
  );
};

export default RoleSelectionWrapper;
