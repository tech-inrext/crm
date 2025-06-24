"use client";

import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "./dashboard/page";

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
