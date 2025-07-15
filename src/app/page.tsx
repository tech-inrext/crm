"use client";

import React, { useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "./dashboard/page";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard/leads"); // Replace '/app' with your target route
  }, [router]);

  return null; // Or a loading spinner
}
