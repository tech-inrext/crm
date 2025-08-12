import React, { useState, ChangeEvent, FormEvent } from "react";
import { Project, BookingFormData } from "@/types/cab-booking";
import { getCurrentDateTime } from "@/constants/cab-booking";

interface BookingFormProps {
  projects: Project[];
  isLoading: boolean;
  onSubmit: (formData: BookingFormData) => Promise<boolean>;
}

const BookingForm: React.FC<BookingFormProps> = ({
  projects,
  isLoading,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    project: "",
    clientName: "",
    numberOfClients: 1,
    pickupPoint: "",
    dropPoint: "",
    employeeName: "",
    requestedDateTime: getCurrentDateTime(),
    notes: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);

    if (success) {
      // Reset form on success
      setFormData({
        project: "",
        clientName: "",
        numberOfClients: 1,
        pickupPoint: "",
        dropPoint: "",
        employeeName: "",
        requestedDateTime: getCurrentDateTime(),
        notes: "",
      });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Cab Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Project *</label>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="" className="text-black">
                Select Project
              </option>
              {projects.map((project) => (
                <option
                  key={project._id}
                  value={project._id}
                  className="text-black"
                >
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Client Name *
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Number of Clients *
            </label>
            <input
              type="number"
              name="numberOfClients"
              min="1"
              max="20"
              value={formData.numberOfClients}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Pickup Point *
            </label>
            <input
              type="text"
              name="pickupPoint"
              value={formData.pickupPoint}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Drop Point *
            </label>
            <input
              type="text"
              name="dropPoint"
              value={formData.dropPoint}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Employee Name
            </label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Requested Date & Time *
            </label>
            <input
              type="datetime-local"
              name="requestedDateTime"
              value={formData.requestedDateTime}
              onChange={handleChange}
              min={getCurrentDateTime()}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Create Booking"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
