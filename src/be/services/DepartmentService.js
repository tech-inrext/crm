import { Service } from "@framework";
import Department from "../../models/Department";

class DepartmentService extends Service {
  constructor() {
    super();
  }

  async createDepartment(req, res) {
    try {
      const { name, description, managerId, departmentId } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Department name is required" });
      }

      const newDept = new Department({
        name,
        description,
        managerId,
        departmentId,
      });
      await newDept.save();

      return res.status(201).json({ success: true, data: newDept });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllDepartment(req, res) {
    try {
      const departments = await Department.find({ isActive: true }).populate(
        "managerId",
        "name email"
      );
      return res.status(200).json({ success: true, data: departments });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateDepartmentDetails(req, res) {
    const { id } = req.query;
    try {
      const update = req.body;
      const updated = await Department.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
      );
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Department not found" });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteDepartment(req, res) {
    const { id } = req.query;
    try {
      const deleted = await Department.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Department not found" });
      }

      return res
        .status(200)
        .json({ success: true, message: "Department deactivated" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDepartmentById(req, res) {
    const { id } = req.query;
    try {
      const department = await Department.findById(id).populate(
        "managerId",
        "name email"
      );

      if (!department) {
        return res
          .status(404)
          .json({ success: false, message: "Department not found" });
      }

      return res.status(200).json({ success: true, data: department });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default DepartmentService;
