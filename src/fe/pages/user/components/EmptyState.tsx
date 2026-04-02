import React from "react";
import People from "@/components/ui/Component/People";

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <People className="w-12 h-12 mb-3 opacity-40" />
    <p className="text-sm font-medium">No users found</p>
    <p className="text-xs mt-1 opacity-60">
      Try adjusting your search or add a new user
    </p>
  </div>
);

export default EmptyState;
