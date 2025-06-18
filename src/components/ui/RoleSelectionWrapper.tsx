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
  const handleRoleSelect = async (roleName: string) => {
    try {
      // Find the role ID from the role name
      const getRoleId = (name: string) => {
        if (!pendingRoleSelection?.roles) return name;
        const role = pendingRoleSelection.roles.find(
          (r) => (typeof r === "string" ? r : r.name) === name
        );
        return role ? (typeof role === "string" ? role : role._id) : name;
      };

      const roleId = getRoleId(roleName);
      await completeRoleSelection(roleId);
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
      {children} {/* Global Role Selection Dialog */}
      {pendingRoleSelection && (
        <LoginRoleSelector
          open={true}
          userName={pendingRoleSelection.name}
          userEmail={pendingRoleSelection.email}
          availableRoles={
            pendingRoleSelection.roles
              ? pendingRoleSelection.roles.map((role) => role.name)
              : []
          }
          defaultRole={
            pendingRoleSelection.roles && pendingRoleSelection.roles.length > 0
              ? pendingRoleSelection.roles[0].name
              : undefined
          }
          onRoleSelect={handleRoleSelect}
          onClose={handleRoleSelectionCancel}
        />
      )}
    </>
  );
};

export default RoleSelectionWrapper;
