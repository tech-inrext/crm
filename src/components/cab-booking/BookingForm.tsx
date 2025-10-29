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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

    // update form data
    const newData = { ...formData, [name]: value };
    setFormData(newData);

    // mark field as touched on first change
    setTouched((prev) => ({ ...prev, [name]: true }));

    // validate only this field so user sees errors while typing
    const validationErrors = validate(newData);
    setErrors((prev) => {
      const copy = { ...prev };
      if (validationErrors[name]) {
        copy[name] = validationErrors[name];
      } else {
        delete copy[name];
      }
      return copy;
    });
  };

  const validate = (data: BookingFormData) => {
    const e: Record<string, string> = {};
    if (!data.project || String(data.project).trim() === "") {
      e.project = "Project is required";
    }
    if (!data.clientName || String(data.clientName).trim() === "") {
      e.clientName = "Client name is required";
    } else if (String(data.clientName).trim().length < 3) {
      e.clientName =
        "Please enter the client's full name (minimum 3 characters).";
    }
    if (!data.numberOfClients || Number(data.numberOfClients) < 1) {
      e.numberOfClients = "Number of clients must be at least 1";
    } else if (Number(data.numberOfClients) > 20) {
      e.numberOfClients = "Number of clients cannot exceed 20.";
    }
    if (
      !data.requestedDateTime ||
      String(data.requestedDateTime).trim() === ""
    ) {
      e.requestedDateTime = "Requested date and time is required";
    }
    if (!data.pickupPoint || String(data.pickupPoint).trim() === "") {
      e.pickupPoint = "Pickup point is required";
    } else if (String(data.pickupPoint).trim().length < 3) {
      e.pickupPoint =
        "Please enter a valid pickup location (minimum 3 characters).";
    }
    if (!data.dropPoint || String(data.dropPoint).trim() === "") {
      e.dropPoint = "Drop point is required";
    } else if (String(data.dropPoint).trim().length < 3) {
      e.dropPoint =
        "Please enter a valid drop location (minimum 3 characters).";
    }
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // mark all fields as touched so all errors are visible
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach((k) => (allTouched[k] = true));
      setTouched(allTouched);
      // focus first invalid field
      const firstField = Object.keys(validationErrors)[0];
      const el = document.querySelector(
        `[name="${firstField}"]`
      ) as HTMLElement | null;
      if (el && typeof el.focus === "function") el.focus();
      return;
    }

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
        setErrors({});
        setTouched({});
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
              className={`w-full p-2 border rounded-md ${
                errors.project ? "border-red-500" : "border-gray-300"
              }`}
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
            {(touched.project || String(formData.project) !== "") &&
              errors.project && (
                <p className="text-sm text-red-600 mt-1">{errors.project}</p>
              )}
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
              className={`w-full p-2 border rounded-md ${
                errors.clientName ? "border-red-500" : "border-gray-300"
              }`}
              onFocus={(e) => e.target.select()}
            />
            {(touched.clientName || String(formData.clientName) !== "") &&
              errors.clientName && (
                <p className="text-sm text-red-600 mt-1">{errors.clientName}</p>
              )}
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
              className={`w-full p-2 border rounded-md ${
                errors.numberOfClients ? "border-red-500" : "border-gray-300"
              }`}
            />
            {(touched.numberOfClients ||
              String(formData.numberOfClients) !== "") &&
              errors.numberOfClients && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.numberOfClients}
                </p>
              )}
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
              className={`w-full p-2 border rounded-md ${
                errors.requestedDateTime ? "border-red-500" : "border-gray-300"
              }`}
            />
            {(touched.requestedDateTime ||
              String(formData.requestedDateTime) !== "") &&
              errors.requestedDateTime && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.requestedDateTime}
                </p>
              )}
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
              className={`w-full p-2 border rounded-md ${
                errors.pickupPoint ? "border-red-500" : "border-gray-300"
              }`}
              onFocus={(e) => e.target.select()}
            />
            {(touched.pickupPoint || String(formData.pickupPoint) !== "") &&
              errors.pickupPoint && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.pickupPoint}
                </p>
              )}
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
              className={`w-full p-2 border rounded-md ${
                errors.dropPoint ? "border-red-500" : "border-gray-300"
              }`}
              onFocus={(e) => e.target.select()}
            />
            {(touched.dropPoint || String(formData.dropPoint) !== "") &&
              errors.dropPoint && (
                <p className="text-sm text-red-600 mt-1">{errors.dropPoint}</p>
              )}
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
