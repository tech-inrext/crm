import { Service } from "@framework";
import Notice from "../models/Notice";
import mongoose from "mongoose";

class NoticeService extends Service {
  constructor() {
    super();
  }
  // Create Notice
  async createNotice(req, res) {
    try {
      const {
        title,
        description,
        category,
        priority,
        departments,
        expiry,
        pinned,
      } = req.body;

      if (!title || !description || !category) {
        return res.status(400).json({
          success: false,
          message: "Title, description and category are required",
        });
      }

      const newNotice = new Notice({
        title,
        description,
        category,
        priority: priority || "Info",
        departments: departments || "All",
        expiry: expiry || null,
        pinned: pinned || false,
        createdBy: req.employee?._id || null,
      });

      await newNotice.save();

      return res.status(201).json({
        success: true,
        message: "Notice created successfully",
        data: newNotice,
      });
    } catch (error) {
      console.log("Create Notice Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create notice",
        error: error.message,
      });
    }
  }
  // Get All Notices
  async getAllNotices(req, res) {
    try {
      const {
        search = "",
        category = "",
        priority = "",
        date = "",
        pinned = "",
        departments = "",
        page = 1,
        limit = 50,
      } = req.query;

      let filters = [];

      // Search
      if (search.trim()) {
        filters.push({
          $or: [
            { title: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } },
            { category: { $regex: search.trim(), $options: "i" } },
            { priority: { $regex: search.trim(), $options: "i" } },
          ],
        });
      }

      // Category
      if (category && category !== "All") {
        filters.push({
          category: { $regex: `^${category}$`, $options: "i" },
        });
      }

      // Priority
      if (priority && priority !== "All") {
        filters.push({
          priority: { $regex: `^${priority}$`, $options: "i" },
        });
      }
      // Pinned
      if (pinned !== "") {
        filters.push({
          pinned: pinned === "true",
        });
      }

      // Departments
      if (departments && departments !== "All") {
        filters.push({
          departments: { $regex: `^${departments}$`, $options: "i" },
        });
      }

      // Date
      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        filters.push({
          createdAt: {
            $gte: start,
            $lte: end,
          },
        });
      }

      // Remove expired
      filters.push({
        $or: [{ expiry: null }, { expiry: { $gte: new Date() } }],
      });

      // Active only
      filters.push({ isActive: true });

      const query = filters.length ? { $and: filters } : {};

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const total = await Notice.countDocuments(query);

      const notices = await Notice.find(query)
        .populate("createdBy", "name email employeeId")
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean();

      return res.status(200).json({
        success: true,
        total,
        page: pageNumber,
        limit: limitNumber,
        data: notices,
      });
    } catch (error) {
      console.log("Fetch Notice Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notices",
        error: error.message,
      });
    }
  }

  // Get Notice Meta
  async getNoticeMeta(req, res) {
    try {
      const categories = Notice.schema.path("category")?.enumValues || [];

      const priorities = Notice.schema.path("priority")?.enumValues || [];

      const departments = Notice.schema.path("departments")?.enumValues || [];

      return res.status(200).json({
        success: true,
        data: {
          categories,
          priorities,
          departments,
        },
      });
    } catch (error) {
      console.log("Meta Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch meta",
        error: error.message,
      });
    }
  }
  // Get Notice By ID
  async getNoticeById(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid notice ID",
        });
      }

      const notice = await Notice.findById(id)
        .populate("createdBy", "name email employeeId")
        .lean();

      if (!notice) {
        return res.status(404).json({
          success: false,
          message: "Notice not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: notice,
      });
    } catch (error) {
      console.log("Get Notice Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching notice",
        error: error.message,
      });
    }
  }

  // Update Notice
  async updateNotice(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid notice ID",
        });
      }

      const updatedNotice = await Notice.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      })
        .populate("createdBy", "name email employeeId")
        .lean();

      if (!updatedNotice) {
        return res.status(404).json({
          success: false,
          message: "Notice not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notice updated successfully",
        data: updatedNotice,
      });
    } catch (error) {
      console.log("Update Notice Error:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating notice",
        error: error.message,
      });
    }
  }
}

export default NoticeService;
