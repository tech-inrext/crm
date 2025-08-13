import React from "react";

interface ViewSwitcherProps {
  activeView: "form" | "tracking" | "vendortracking";
  onViewChange: (view: "form" | "tracking" | "vendortracking") => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  activeView,
  onViewChange,
}) => {
  const views = [
    { key: "form" as const, label: "New Booking" },
    { key: "tracking" as const, label: "View Bookings" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {views.map((view) => (
        <button
          key={view.key}
          onClick={() => onViewChange(view.key)}
          className={`px-4 py-2 rounded-md ${
            activeView === view.key
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-950"
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
};

export default ViewSwitcher;
