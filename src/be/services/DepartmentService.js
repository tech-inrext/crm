import { Service } from "@framework";
import Department from "../models/Department";

class DepartmentService extends Service {
  constructor() {
    super();
  }

  async createDepartment(req, res) {
    try {
      const { name, description, managerId, attachments } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Department name is required" });
      }

      const existing = await Department.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Department name already exists" });
      }

      const newDept = new Department({
        name,
        description,
        managerId,
        attachments: attachments || [],
      });
      await newDept.save();

      return res.status(201).json({ success: true, data: newDept });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllDepartment(req, res) {
    try {
      const { search, page = 1, limit = 10 } = req.query;

      // Build query
      let query = { isActive: true };

      // Add search functionality
      if (search && search.trim()) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Calculate pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      // Get total count for pagination
      const totalItems = await Department.countDocuments(query);

      // Fetch departments with pagination
      const departments = await Department.find(query)
        .populate("managerId", "name email")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: departments,
        pagination: {
          currentPage: pageNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
          pageSize: limitNum,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateDepartmentDetails(req, res) {
    const { id } = req.query;
    try {
      const update = req.body;

      if (update.name) {
        const existing = await Department.findOne({
          name: { $regex: new RegExp(`^${update.name.trim()}$`, "i") },
          _id: { $ne: id },
        });
        if (existing) {
          return res
            .status(409)
            .json({
              success: false,
              message: "Department name already exists",
            });
        }
      }

      const updated = await Department.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true },
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
        { new: true },
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
        "name email",
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
