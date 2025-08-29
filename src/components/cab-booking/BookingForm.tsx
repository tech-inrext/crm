import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
} from "react";
import axios from "axios";
import { Project, BookingFormData } from "@/types/cab-booking";
import { getCurrentDateTime } from "@/constants/cab-booking";

interface Employee {
  _id: string;
  name: string;
}

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  let managerName = "";
  try {
    if (typeof window !== "undefined" && window.user) {
      if (
        window.user.getCurrentRoleName &&
        window.user.getCurrentRoleName() !== "vendor"
      ) {
        managerName = window.user.managerName || "";
      }
    }
  } catch (e) {
    managerName = "";
  }

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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!showEmployeeDropdown) return;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      axios
        .get("/api/v0/employee", {
          params: employeeSearch ? { search: employeeSearch } : {},
        })
        .then((res) => setEmployees(res.data.data || []))
        .catch(() => setEmployees([]));
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [employeeSearch, showEmployeeDropdown]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
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
    } finally {
      setSubmitting(false);
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
          {/* <div className="form-group">
            <label className="block text-sm font-medium mb-1">
              Approved By *
            </label>
            <input
              type="text"
              name="managerName"
              value={managerName}
              disabled
              required
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
              readOnly
            />
          </div> */}
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
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading || submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting || isLoading ? "Submitting..." : "Create Booking"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
