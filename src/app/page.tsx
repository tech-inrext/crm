"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading, pendingRoleSelection, roleSelected } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
    } else if (pendingRoleSelection || !roleSelected) {
      router.replace("/dashboard/select-role");
    } else {
      router.replace("/dashboard/leads");
    }
  }, [user, loading, pendingRoleSelection, roleSelected, router]);

  return null;
}
