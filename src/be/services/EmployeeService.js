import { Service } from "@framework";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import Employee from "../models/Employee";
import { leadQueue } from "../queue/leadQueue.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import Role from "../models/Role";
import { sendNewEmployeeWelcomeEmail } from "../email-service/employee/newEmployeeWelcome";
import { sendManagerNewReportEmail } from "../email-service/manager/managerNewReport.js";
import { sendRoleChangeEmail } from "../../lib/emails/sendRoleChangeEmail";
import {
  notifyUserRegistration,
  notifyUserUpdate,
  notifyRoleChange,
} from "../../lib/notification-helpers";


class EmployeeService extends Service {
  constructor() {
    super();
  }
async getEmployeeById(req, res) { 
  const { id } = req.query; 
  try { 
    // 1️⃣ Validate employee ID 
    if (!id || id === "undefined" || id === "null") { 
    return res.status(400).json({ 
      success: false, 
      error: "Employee ID is required", }); 
    } 
    // 2️⃣ Fetch employee from DB 
    const employee = await Employee.findById(id).populate("roles"); 
    if (!employee) 
      { return res.status(404).json({ 
        success: false, 
        error: "Employee not found", }); 
      } 
      // 3️⃣ Check if user is fully authenticated (token + roleId) 
      const token = req.cookies?.token; 
      let isFullyAuthenticated = false; 
      if (token) { 
        try { 
          const decoded = jwt.verify(token, process.env.JWT_SECRET); 
          if (decoded?._id && decoded?.roleId) { 
            isFullyAuthenticated = true; 
          } } catch { 
            // Invalid or expired token → treat as public user 
            isFullyAuthenticated = false; 
          } 
        } 
        // 4️⃣ If authenticated with role → return full employee data 
        if (isFullyAuthenticated) { 
          return res.status(200).json({ 
            success: true, 
            data: employee, 
          }); 
        } 
        // 5️⃣ Otherwise → return public employee data only 
        const publicData = { 
          name: employee.name, 
          email: employee.email, 
          phone: employee.phone, 
          altPhone: employee.altPhone, 
          designation: employee.designation, 
          photo: employee.photo, 
          specialization: employee.specialization, 
        }; 
        // Remove null / undefined fields 
        Object.entries(publicData).forEach(([key, value]) => { 
          if (value == null) delete publicData[key]; 
        });
        
          return res.status(200).json({ 
            success: true, 
            data: publicData, 
          }); 
        } catch (error) { 
          console.error("Get Employee Error:", error); 
          
          // 6️⃣ Handle invalid MongoDB ObjectId 
          if (error.name === "CastError") { 
            return res.status(400).json({ 
              success: false, 
              error: "Invalid employee ID format", 
            }); 
          } 
          
          return res.status(500).json({ 
            success: false, 
            error: "Internal server error", 
          }); 
        } 
      }

  async updateEmployeeDetails(req, res) {
    const { id } = req.query;
    const {
      name,
      email,
      phone,
      altPhone,
      address,
      fatherName,
      gender,
      age,
      designation,
      joiningDate,
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
      photo,
      specialization,
      panNumber,
    } = req.body;

    // Build updateFields by checking property presence so empty strings/nulls
    // in the request can be used to clear existing values.
    const updateFields = {};

    const setIfPresent = (key, val) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updateFields[key] = val;
      }
    };

    setIfPresent("name", name);
    // validate name on update - should not start with a digit
    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      if (name && /^\d/.test(String(name).trim())) {
        return res.status(400).json({
          success: false,
          message: "Full name must not start with a digit",
        });
      }
    }

    // Allow email update with validation
    if (Object.prototype.hasOwnProperty.call(req.body, "email")) {
      if (email) {
        if (!validator.isEmail(String(email))) {
          return res.status(400).json({
            success: false,
            message: "Invalid email format",
          });
        }
        // Check if email already exists for another user
        const existingEmailUser = await Employee.findOne({
          email,
          _id: { $ne: id },
        });
        if (existingEmailUser) {
          return res.status(409).json({
            success: false,
            message: "Email already exists for another employee",
          });
        }
        updateFields.email = email;
      }
    }

    // Allow phone update with validation
    if (Object.prototype.hasOwnProperty.call(req.body, "phone")) {
      if (phone) {
        if (!validator.isMobilePhone(String(phone), "any")) {
          return res.status(400).json({
            success: false,
            message: "Invalid phone number",
          });
        }
        // Check if phone already exists for another user
        const existingPhoneUser = await Employee.findOne({
          phone,
          _id: { $ne: id },
        });
        if (existingPhoneUser) {
          return res.status(409).json({
            success: false,
            message: "Phone number already exists for another employee",
          });
        }
        updateFields.phone = phone;
      }
    }

    // PAN Number validation (REQUIRED)
  if (Object.prototype.hasOwnProperty.call(req.body, "panNumber")) {
    if (!panNumber || panNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "PAN Number is required",
      });
    }
    
    // Validate PAN format: 5 letters, 4 digits, 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const formattedPan = panNumber.toUpperCase().trim();
    
    if (!panRegex.test(formattedPan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN card number. Must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)",
      });
    }
    
    // Check if PAN already exists for another employee
    const existingPanUser = await Employee.findOne({
      panNumber: formattedPan,
      _id: { $ne: id },
    });
    
    if (existingPanUser) {
      return res.status(409).json({
        success: false,
        message: "PAN Number already exists for another employee",
      });
    }
    
    updateFields.panNumber = formattedPan;
  }

    // Allow joiningDate update
    if (Object.prototype.hasOwnProperty.call(req.body, "joiningDate")) {
      updateFields.joiningDate = joiningDate;
    }

    setIfPresent("altPhone", altPhone);
    // validate altPhone if provided
    if (Object.prototype.hasOwnProperty.call(req.body, "altPhone")) {
      if (altPhone && !validator.isMobilePhone(String(altPhone), "any")) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid alternate phone number" });
      }
    }
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
    setIfPresent("photo", photo);
    setIfPresent("specialization", specialization);
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
    // allow updating father's name
    setIfPresent("fatherName", fatherName);

    try {
      const existingEmployee = await Employee.findById(id).populate("roles");

      if (!existingEmployee) {
        return res
          .status(404)
          .json({ success: false, error: "Employee not found" });
      }

      const oldRoles = existingEmployee.roles.map((r) => ({
        id: r._id.toString(),
        name: r.name,
      }));

      const updated = await Employee.findByIdAndUpdate(id, updateFields, {
        new: true,
      }).populate("roles");

      if (Object.prototype.hasOwnProperty.call(req.body, "roles")) {
        const newRoles = Array.isArray(updated.roles)
          ? updated.roles.map((r) => ({ id: r._id.toString(), name: r.name }))
          : [];

        const oldSet = new Set(oldRoles.map((r) => r.id));
        const newSet = new Set(newRoles.map((r) => r.id));

        const addedRoles = newRoles
          .filter((r) => !oldSet.has(r.id))
          .map((r) => r.name);
        const removedRoles = oldRoles
          .filter((r) => !newSet.has(r.id))
          .map((r) => r.name);

        const rolesChanged = addedRoles.length > 0 || removedRoles.length > 0;

        if (rolesChanged) {
          const changedByName = req.employee?.name || "Unknown User";
          const changedByEmail = req.employee?.email || "unknown@company.com";

          await sendRoleChangeEmail({
            adminEmail: process.env.ADMIN_EMAIL || "admin@company.com",
            changedByName,
            changedByEmail,
            changedEmployeeName: updated.name,
            changedEmployeeEmail: updated.email,
            newRole: updated.roles.map((r) => r.name).join(", "),
            addedRoles,
            removedRoles,
          });

          // Send notification for role change
          try {
            await notifyRoleChange(
              updated._id,
              updated.toObject(),
              addedRoles,
              removedRoles,
              req.employee?._id
            );
          } catch (error) {
            // Notification failed silently
          }
        }
      }

      // Send notification for user update (only if significant fields changed)
      try {
        // Exclude 'roles' from generic update check since it has its own notification
        const genericChanges = Object.keys(updateFields).filter(
          (key) => key !== "roles"
        );

        if (genericChanges.length > 0) {
          const updaterId = req.employee?._id || req.user?._id;
          await notifyUserUpdate(
            updated._id,
            updated.toObject(),
            updateFields,
            updaterId
          );
        }
      } catch (error) {
        // Notification failed silently
      }

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
        photo,
        specialization,
        panNumber,
      } = req.body;
      // validate name - should not start with a digit
      if (name && /^\d/.test(String(name).trim())) {
        return res.status(400).json({
          success: false,
          message: "Full name Should not start with a digit",
        });
      }

      // validate phone formats (if provided)
      if (phone && !validator.isMobilePhone(String(phone), "any")) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid phone number" });
      }
      if (altPhone && !validator.isMobilePhone(String(altPhone), "any")) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid alternate phone number" });
      }
      // PAN Number validation (REQUIRED)
    if (!panNumber || panNumber.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "PAN Number is required",
      });
    }
    
    // Validate PAN format: 5 letters, 4 digits, 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const formattedPan = panNumber.toUpperCase().trim();
    
    if (!panRegex.test(formattedPan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN card number. Must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)",
      });
    }

      const isCabVendor = req.body.isCabVendor || false;
      const dummyPassword = "Inrext@123";
      const hashedPassword = await bcrypt.hash(dummyPassword, 10);

      // 🚫 Check duplicate email/phone
      const exists = await Employee.findOne({ $or: [{ email }, { phone }, { panNumber: formattedPan }] });
      if (exists) {
      if (exists.email === email) {
        return res.status(409).json({
          success: false,
          message: `${
            isCabVendor == true ? "Vendor's" : "Employee's"
          } Email already exists`,
        });
      }
      if (exists.phone === phone) {
        return res.status(409).json({
          success: false,
          message: `${
            isCabVendor == true ? "Vendor's" : "Employee's"
          } Phone No. already exists`,
        });
      }
      if (exists.panNumber === formattedPan) {
        return res.status(409).json({
          success: false,
          message: `${
            isCabVendor == true ? "Vendor's" : "Employee's"
          } PAN Number already exists`,
        });
      }
    }

      // ✅ Create new employee (only set optional fields if present)
      const employeeData = {
        name,
        email,
        phone,
        panNumber: formattedPan,
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
      if (Object.prototype.hasOwnProperty.call(req.body, "specialization"))
      employeeData.specialization = specialization;
      // documents
      if (Object.prototype.hasOwnProperty.call(req.body, "photo"))
      employeeData.photo = photo;
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

      // 1) Send welcome email to employee
      try {
        await sendNewEmployeeWelcomeEmail({ employee: newEmployee.toObject() });
      } catch (e) {
        // Email failed silently
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
          // Email failed silently
        }
      }

      // 3) Send notification for user registration
      try {
        await notifyUserRegistration(
          newEmployee._id,
          newEmployee.toObject(),
          managerId
        );
      } catch (error) {
        // Notification failed silently
      }

      return res.status(201).json({ success: true, data: newEmployee });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `Error creating employee: ${error.message}`,
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
        requireSlab,
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
              { panNumber: { $regex: search, $options: "i" } },
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

      // slabPercentage requirement filter (only include employees where slabPercentage is set)
      const slabReq = normalizeBool(requireSlab);
      const slabFilter = slabReq
        ? { slabPercentage: { $exists: true, $nin: ["", null] } }
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
        ...slabFilter,
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

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const employee = await Employee.findOne({ email }).populate("roles");

      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid Credentials." });
      }

      // Fetch manager name if exists
      let managerName = null;
      if (employee.managerId) {
        const manager = await Employee.findById(employee.managerId).select(
          "name"
        );
        if (manager) managerName = manager.name;
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        employee.password
      );
      if (!isPasswordCorrect) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      if (!employee.isPasswordReset) {
        return res.status(403).json({
          success: false,
          message:
            "Please create a new password to continue with your first login. Click on 'Forgot Password' to reset it now.",
        });
      }

      const now = new Date();
      const resetDueAfter = new Date(employee.passwordLastResetAt);
      resetDueAfter.setMonth(resetDueAfter.getMonth() + 3);

      if (now > resetDueAfter) {
        return res.status(403).json({
          success: false,
          message: "Your password has expired. Please reset it to continue.",
        });
      }

      // Generate JWT Token
      const token = jwt.sign({ _id: employee._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // Set token in HTTP-only cookie
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: "strict",
          path: "/",
        })
      );

      // Convert to plain object before sending
      const employeeData = employee.toObject();
      employeeData.managerName = managerName;
      employeeData.photo = employee.photo || "";
      delete employeeData.password;

      return res.status(200).json({
        success: true,
        message: "Login successful",
        employee: employeeData,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: `Error: ${err.message}` });
    }
  }

  async logout(req, res) {
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
        sameSite: "strict",
        path: "/",
      })
    );

    return res.status(200).json({ message: "Logged out successfully" });
  }

  async getLoggedInUserProfile(req, res) {
    try {
      const user = req.employee;

      // Fetch manager name if managerId exists
      let managerName = "N/A";
      if (user.managerId) {
        const manager = await Employee.findById(user.managerId).select("name");
        if (manager) managerName = manager.name;
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roles: user.roles || [],
          gender: user.gender,
          address: user.address,
          designation: user.designation,
          departmentId: user.departmentId,
          managerId: user.managerId,
          managerName: managerName,
          joiningDate: user.joiningDate,
          photo: user.photo || "",
          currentRole: req.roleId,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        error: error.message,
      });
    }
  }

  async requestOTP(req, res) {
    try {
      const { email } = req.body || {};

      if (!email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(email);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid email address. Please enter a valid email ID.",
        });
      }

      const employee = await Employee.findOne({ email });
      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "This email is not registered." });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 10 * 60 * 1000;

      // Use a direct update to avoid triggering full-document validation
      // (some Employee documents may be missing required fields used by validation)
      const updateResult = await Employee.updateOne(
        { _id: employee._id },
        { $set: { resetOTP: otp, resetOTPExpires: expiry } }
      );

      if (updateResult.matchedCount === 0 && updateResult.modifiedCount === 0) {
        console.error("❌ Failed to update employee OTP:", updateResult);
        return res
          .status(500)
          .json({ success: false, message: "Failed to save OTP for the user" });
      }

      try {
        if (leadQueue) {
          await leadQueue.add("sendOTPJob", { email, otp });
          return res
            .status(200)
            .json({ success: true, message: "OTP is being sent to email" });
        } else {
          console.warn("Queue not available, OTP sending skipped");
          return res.status(200).json({
            success: true,
            message: "OTP generated but queue unavailable",
          });
        }
      } catch (error) {
        console.error("❌ Queueing OTP job failed:", error);
        return res
          .status(500)
          .json({ success: false, message: "Failed to queue OTP email" });
      }
    } catch (err) {
      // Catch any unexpected errors and ensure we always return JSON
      console.error("❌ Unhandled error in request-otp:", err);
      try {
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      } catch (e) {
        // If even sending JSON fails, fall back to plain text with proper header
        res.setHeader("Content-Type", "text/plain");
        return res.status(500).send("Internal Server Error");
      }
    }
  }

  async resetPasswordWithOTP(req, res) {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const isPasswordStrong = (password) => {
      return /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password); // at least 8 chars, mix of letters & numbers
    };

    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with letters and numbers",
      });
    }

    const employee = await Employee.findOne({ email });

    if (
      !employee ||
      employee.resetOTP !== otp ||
      Date.now() > employee.resetOTPExpires
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Use an atomic update to avoid triggering full document validation
      // (some legacy documents may be missing required fields like employeeProfileId)
      const result = await Employee.updateOne(
        { _id: employee._id },
        {
          $set: {
            password: hashedPassword,
            isPasswordReset: true,
            passwordLastResetAt: new Date(),
          },
          $unset: { resetOTP: "", resetOTPExpires: "" },
        }
      );

      if (!result || result.matchedCount === 0) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to update password" });
      }
    } catch (err) {
      console.error("Error updating password:", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  }

  async resetPassword(req, res) {
    const { newPassword, email, oldPassword } = req.body;

    if (!email || !newPassword || !oldPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    try {
      const employee = await Employee.findOne({ email });

      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid Email or Old Password" });
      }

      const isMatch = await bcrypt.compare(oldPassword, employee.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid Email or Old Password" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      employee.password = hashedPassword;
      employee.isPasswordReset = true;
      employee.passwordLastResetAt = new Date(); // ✅ for 3-month expiry tracking

      await employee.save();

      res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAllEmployeeList(req, res) {
    try {
      const { isCabVendor } = req.query;

      // Normalize stringy booleans from query (?isCabVendor=true / 1 / yes / y ...)
      const normalizeBool = (v) => {
        if (typeof v === "boolean") return v;
        if (v == null) return undefined;
        const s = String(v).trim().toLowerCase();
        if (["true", "1", "yes", "y"].includes(s)) return true;
        if (["false", "0", "no", "n"].includes(s)) return false;
        return undefined; // ignore invalid values
      };

      const vendorVal = normalizeBool(isCabVendor);

      const filter = {};
      if (typeof vendorVal === "boolean") {
        filter.isCabVendor = vendorVal;
      }

      const employees = await Employee.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: employees.length,
        data: employees,
        appliedFilter: {
          isCabVendor: typeof vendorVal === "boolean" ? vendorVal : null,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch employees",
        error: error.message,
      });
    }
  }

  async switchRole(req, res) {
    try {
      const employeeId = req.employee._id; // ✅ From loginAuth middleware

      // Get selected roleId from body
      const { roleId } = req.body;
      if (!roleId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing roleId in request body" });
      }

      // Find employee and populate roles (assumes multiple roles)
      const employee = await Employee.findById(employeeId).populate("roles"); // Note: 'roles' plural

      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });
      }

      // ✅ Check if roleId exists in employee's roles
      const roleExists = employee.roles.some(
        (role) => role._id.toString() === roleId
      );

      if (!roleExists) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this role",
        });
      }

      //find selected role
      const selectedRole = employee.roles.find(
        (role) => role._id.toString() === roleId
      );

      // ✅ Create new token with selected role
      const newToken = jwt.sign(
        { _id: employeeId, roleId },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      // ✅ Set new token in HttpOnly cookie
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "strict",
          path: "/",
        })
      );

      res.status(200).json({
        success: true,
        message: `Role switched successfully to ${selectedRole.name}`,
        role: selectedRole,
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Error: " + err.message });
    }
  }

  // 🔹 Recursive function to build hierarchy starting from a manager (including the manager)
  buildHierarchy(employees, managerId) {
    const tree = [];
    employees
      .filter(
        (emp) =>
          String(emp.managerId) === String(managerId) &&
          String(emp._id) !== String(managerId)
      )
      .forEach((emp) => {
        const children = this.buildHierarchy(employees, emp._id); // Recursively find employees under each employee
        tree.push({
          _id: emp._id,
          name: emp.name,
          designation: emp.designation,
          branch: emp.branch,
          managerId: emp.managerId,
          employeeProfileId: emp.employeeProfileId,
          children: children.length ? children : [], // If no subordinates, return empty array
        });
      });
    return tree;
  }

  // 🔹 Handler for getting the hierarchy (including the manager)
  async getHierarchyByManager(req, res) {
    try {
      const { managerId } = req.query; // Get managerId from the query params

      if (!managerId) {
        return res.status(400).json({
          success: false,
          message: "Manager ID is required as query parameter",
        });
      }

      // Fetch all employees
      const employees = await Employee.find({}).lean();

      // Fetch the manager details
      const manager = employees.find(
        (emp) => String(emp._id) === String(managerId)
      );

      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Manager not found",
        });
      }

      // Build hierarchy starting from the manager themselves
      const hierarchy = {
        _id: manager._id,
        name: manager.name,
        designation: manager.designation,
        branch: manager.branch,
        managerId: manager.managerId,
        employeeProfileId: manager.employeeProfileId,
        children: this.buildHierarchy(employees, manager._id), // Recursively find subordinates
      };

      return res.status(200).json({
        success: true,
        data: hierarchy,
      });
    } catch (err) {
      console.error("Hierarchy Fetch Error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch hierarchy",
        error: err.message,
      });
    }
  }

  async getMouStats(req, res) {
    try {
      const pendingCount = await Employee.countDocuments({
        mouStatus: { $regex: "^Pending$", $options: "i" },
      });
      const completedCount = await Employee.countDocuments({
        mouStatus: { $regex: "^Completed$", $options: "i" },
      });
      return res.status(200).json({
        success: true,
        pending: pendingCount,
        completed: completedCount,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch MoU stats",
        error: error.message,
      });
    }
  }

  async getManagerMouStats(req, res) {
    try {
      const loggedInId =
        req.employee?._id?.toString?.() || req.user?._id?.toString?.() || "";
      if (!loggedInId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      // Only employees whose managerId is loggedInId
      const pendingCount = await Employee.countDocuments({
        managerId: loggedInId,
        mouStatus: { $regex: "^Pending$", $options: "i" },
      });
      const approvedCount = await Employee.countDocuments({
        managerId: loggedInId,
        mouStatus: { $regex: "^Approved$", $options: "i" },
      });
      return res.status(200).json({
        success: true,
        pending: pendingCount,
        approved: approvedCount,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch MoU stats for manager",
        error: error.message,
      });
    }
  }
}

export default EmployeeService;
