import { Service } from "@framework";
import Employee from "../../models/Employee";
import bcrypt from "bcrypt";
import { sendNewEmployeeWelcomeEmail } from "@/lib/emails/newEmployeeWelcome";
import { sendManagerNewReportEmail } from "@/lib/emails/managerNewReport";

class EmployeeService extends Service {
  constructor() {
    super();
  }
  async getEmployeeById(req, res) {
    const { id } = req.query;
    try {
      const employee = await Employee.findById(id).populate("roles");
      if (!employee)
        return res
          .status(404)
          .json({ success: false, error: "Employee not found" });
      return res.status(200).json({ success: true, data: employee });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  async updateEmployeeDetails(req, res) {
    const { id } = req.query;
    console.debug("[employee:patch] incoming body:", req.body);
    const {
      name,
      altPhone,
      address,
      gender,
      age,
      designation,
      managerId,
      departmentId,
      roles,
      aadharUrl,
      panUrl,
      bankProofUrl,
      signatureUrl,
      nominee,
      slabPercentage,
      branch,
    } = req.body;
    console.debug(
      "[employee:patch] slabPercentage, branch:",
      slabPercentage,
      branch
    );

    const notAllowedFields = ["phone", "email", "joiningDate"];
    const requestFields = Object.keys(req.body || {});
    const invalidFields = requestFields.filter((f) =>
      notAllowedFields.includes(f)
    );
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You are not allowed to update these field(s): ${invalidFields.join(
          ", "
        )}`,
      });
    }

    // Build updateFields by checking property presence so empty strings/nulls
    // in the request can be used to clear existing values.
    const updateFields = {};

    const setIfPresent = (key, val) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updateFields[key] = val;
      }
    };

    setIfPresent("name", name);
    setIfPresent("altPhone", altPhone);
    setIfPresent("address", address);
    setIfPresent("gender", gender);
    // allow clearing age by sending null
    if (Object.prototype.hasOwnProperty.call(req.body, "age")) {
      updateFields.age = age;
    }
    setIfPresent("designation", designation);
    setIfPresent("managerId", managerId);
    setIfPresent("departmentId", departmentId);
    if (Object.prototype.hasOwnProperty.call(req.body, "roles")) {
      updateFields.roles = Array.isArray(roles) ? roles : [];
    }
    setIfPresent("aadharUrl", aadharUrl);
    setIfPresent("panUrl", panUrl);
    setIfPresent("bankProofUrl", bankProofUrl);
    setIfPresent("signatureUrl", signatureUrl);
    // nominee can be an object; allow clearing by sending null/empty object
    if (Object.prototype.hasOwnProperty.call(req.body, "nominee")) {
      updateFields.nominee = nominee;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "slabPercentage")) {
      updateFields.slabPercentage = slabPercentage;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "branch")) {
      updateFields.branch = branch;
    }

    try {
      const updated = await Employee.findByIdAndUpdate(id, updateFields, {
        new: true,
      }).populate("roles");
      if (!updated)
        return res
          .status(404)
          .json({ success: false, error: "Employee not found" });
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  async createEmployee(req, res) {
    try {
      const {
        name,
        email,
        phone,
        address,
        gender,
        age,
        altPhone,
        joiningDate,
        designation,
        managerId,
        departmentId,
        roles,
        aadharUrl,
        panUrl,
        bankProofUrl,
        signatureUrl,
        nominee,
        slabPercentage,
        branch,
        fatherName,
      } = req.body;
      const isCabVendor = req.body.isCabVendor || false;
      const dummyPassword = "Inrext@123";
      const hashedPassword = await bcrypt.hash(dummyPassword, 10);

      // 🚫 Check duplicate email/phone
      const exists = await Employee.findOne({ $or: [{ email }, { phone }] });
      if (exists) {
        return res
          .status(409)
          .json({ success: false, message: "Employee already exists" });
      }

      // ✅ Create new employee (only set optional fields if present)
      const employeeData = {
        name,
        email,
        phone,
        password: hashedPassword,
        isCabVendor,
        mouStatus: "Pending",
        fatherName,
      };

      if (Object.prototype.hasOwnProperty.call(req.body, "altPhone"))
        employeeData.altPhone = altPhone;
      if (Object.prototype.hasOwnProperty.call(req.body, "address"))
        employeeData.address = address;
      if (Object.prototype.hasOwnProperty.call(req.body, "gender"))
        employeeData.gender = gender;
      if (Object.prototype.hasOwnProperty.call(req.body, "age"))
        employeeData.age = age;
      if (Object.prototype.hasOwnProperty.call(req.body, "joiningDate"))
        employeeData.joiningDate = joiningDate
          ? new Date(joiningDate)
          : undefined;
      if (Object.prototype.hasOwnProperty.call(req.body, "designation"))
        employeeData.designation = designation;
      if (Object.prototype.hasOwnProperty.call(req.body, "managerId"))
        employeeData.managerId = managerId;
      if (Object.prototype.hasOwnProperty.call(req.body, "departmentId"))
        employeeData.departmentId = departmentId;
      if (Object.prototype.hasOwnProperty.call(req.body, "roles")) {
        employeeData.roles = Array.isArray(roles)
          ? roles
          : roles
          ? [roles]
          : undefined;
      }
      if (isCabVendor) {
        employeeData.roles = ["68b6904f3a3a9b850429e610"];
      }
      // documents
      if (Object.prototype.hasOwnProperty.call(req.body, "aadharUrl"))
        employeeData.aadharUrl = aadharUrl;
      if (Object.prototype.hasOwnProperty.call(req.body, "panUrl"))
        employeeData.panUrl = panUrl;
      if (Object.prototype.hasOwnProperty.call(req.body, "bankProofUrl"))
        employeeData.bankProofUrl = bankProofUrl;
      if (Object.prototype.hasOwnProperty.call(req.body, "signatureUrl"))
        employeeData.signatureUrl = signatureUrl;
      // nominee and freelancer fields
      if (Object.prototype.hasOwnProperty.call(req.body, "nominee"))
        employeeData.nominee = nominee;
      if (Object.prototype.hasOwnProperty.call(req.body, "slabPercentage"))
        employeeData.slabPercentage = slabPercentage;
      if (Object.prototype.hasOwnProperty.call(req.body, "branch"))
        employeeData.branch = branch;

      const newEmployee = new Employee(employeeData);

      await newEmployee.save();
      console.debug(
        "[employee:create] saved employee:",
        newEmployee.toObject()
      );

      // 1) Send welcome email to employee
      try {
        await sendNewEmployeeWelcomeEmail({ employee: newEmployee.toObject() });
      } catch (e) {
        console.error("[employee:create] welcome email failed:", e);
      }

      // 2) Send email to manager (if managerId is provided)
      if (managerId) {
        try {
          const managerDoc = await Employee.findById(managerId).lean();
          if (managerDoc?.email) {
            await sendManagerNewReportEmail({
              manager: managerDoc,
              employee: newEmployee.toObject(),
            });
          }
        } catch (e) {
          console.error("[employee:create] manager email failed:", e);
        }
      }

      return res.status(201).json({ success: true, data: newEmployee });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Error creating employee",
        error: error.message,
      });
    }
  }

  async getAllEmployees(req, res) {
    try {
      const {
        page = 1,
        limit = 5,
        search = "",
        isCabVendor,
        mouStatus,
      } = req.query;

      // 🔐 Logged-in user id (string)
      const loggedInId = (
        req.employee?._id?.toString?.() ||
        req.user?._id?.toString?.() ||
        ""
      ).trim();

      // Pagination
      const currentPage = Number.parseInt(page, 10) || 1;
      const itemsPerPage = Math.min(100, Number.parseInt(limit, 10) || 5);
      const skip = (currentPage - 1) * itemsPerPage;

      // Search filter
      const searchFilter = search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }
        : {};

      // isCabVendor filter
      const normalizeBool = (v) => {
        if (typeof v === "boolean") return v;
        if (v == null) return undefined;
        const s = String(v).trim().toLowerCase();
        if (["true", "1", "yes", "y"].includes(s)) return true;
        if (["false", "0", "no", "n"].includes(s)) return false;
        return undefined;
      };
      const vendorVal = normalizeBool(isCabVendor);
      const vendorFilter =
        typeof vendorVal === "boolean" ? { isCabVendor: vendorVal } : {};

      // mouStatus filter (case-insensitive exact match)
      const mouFilter = mouStatus
        ? {
            mouStatus: {
              $regex: `^${String(mouStatus).trim()}$`,
              $options: "i",
            },
          }
        : {};

      // ✅ Manager filter (only when mouStatus is present): managerId == loggedInId
      const castManagerId = (id) =>
        mongoose?.Types?.ObjectId?.isValid?.(id)
          ? new mongoose.Types.ObjectId(id)
          : id;

      const managerFilter =
        mouStatus && loggedInId ? { managerId: castManagerId(loggedInId) } : {};

      const query = {
        ...searchFilter,
        ...vendorFilter,
        ...mouFilter,
        ...managerFilter,
      };

      const [employees, totalEmployees] = await Promise.all([
        Employee.find(query)
          .skip(skip)
          .limit(itemsPerPage)
          .sort({ createdAt: -1 })
          .lean(),
        Employee.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: employees,
        pagination: {
          totalItems: totalEmployees,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(totalEmployees / itemsPerPage),
        },
        appliedFilter: {
          search: search || null,
          isCabVendor: typeof vendorVal === "boolean" ? vendorVal : null,
          mouStatus: mouStatus || null,
          managerIdUsed: mouStatus ? loggedInId : null,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch Employee",
        error: error.message,
      });
    }
  }
}

export default EmployeeService;
