import { Service } from "@framework";
import Notice from "../models/Notice";
import mongoose from "mongoose";

class NoticeService extends Service {
  constructor() {
    super();
  }

  // ---------------- CREATE NOTICE ----------------
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
        attachments,
      } = req.body;

      if (!title?.trim() || !description?.trim() || !category?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title, description and category are required",
        });
      }

      const newNotice = new Notice({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority: priority?.trim() || "Info",
        departments: departments?.trim() || "All",
        expiry: expiry || null,
        pinned: pinned || false,
        attachments: attachments || [],
        createdBy: req.employee?._id || null,
        isActive: true,
      });

      await newNotice.save();

      return res.status(201).json({
        success: true,
        message: "Notice created successfully",
        data: newNotice,
      });
    } catch (error) {
      console.error("Create Notice Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create notice",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // ---------------- GET ALL NOTICES ----------------
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

      const filters = [];

      if (search?.trim()) {
        filters.push({
          $or: [
            { title: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } },
            { category: { $regex: search.trim(), $options: "i" } },
            { priority: { $regex: search.trim(), $options: "i" } },
          ],
        });
      }

      if (category && category !== "All") {
        filters.push({ category: { $regex: `^${category}$`, $options: "i" } });
      }

      if (priority && priority !== "All") {
        filters.push({ priority: { $regex: `^${priority}$`, $options: "i" } });
      }

      if (pinned !== "") {
        filters.push({ pinned: pinned === "true" });
      }

      if (departments && departments !== "All") {
        filters.push({ departments: { $regex: `^${departments}$`, $options: "i" } });
      }

      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        filters.push({ createdAt: { $gte: start, $lte: end } });
      }

      // Expiry filter
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      filters.push({
        $or: [
          { expiry: { $exists: false } },
          { expiry: null },
          { expiry: { $gte: todayStart } },
        ],
      });

      filters.push({ isActive: true });

      const query = filters.length ? { $and: filters } : {};

      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 50;
      const skip = (pageNumber - 1) * limitNumber;

      const totalItems = await Notice.countDocuments(query);
      const notices = await Notice.find(query)
        .populate("createdBy", "name email employeeId")
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean();

      return res.status(200).json({
        success: true,
        data: notices,
        pagination: {
          totalItems,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalItems / limitNumber),
          limit: limitNumber,
        },
      });
    } catch (error) {
      console.error("Fetch Notice Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notices",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // ---------------- GET NOTICE META ----------------
  async getNoticeMeta(req, res) {
    try {
      const categories = Notice.schema.path("category")?.enumValues || [];
      const priorities = Notice.schema.path("priority")?.enumValues || [];
      const departments = Notice.schema.path("departments")?.enumValues || [];

      return res.status(200).json({
        success: true,
        data: { categories, priorities, departments },
      });
    } catch (error) {
      console.error("Meta Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch meta",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // ---------------- GET NOTICE BY ID ----------------
  async getNoticeById(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid notice ID" });
      }

      const notice = await Notice.findById(id)
        .populate("createdBy", "name email employeeId")
        .lean();

      if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });

      return res.status(200).json({ success: true, data: notice });
    } catch (error) {
      console.error("Get Notice Error:", error);
      return res.status(500).json({ success: false, message: "Error fetching notice", error: error instanceof Error ? error.message : String(error) });
    }
  }

  // ---------------- UPDATE NOTICE ----------------
  async updateNotice(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid notice ID" });
      }

      const updatedNotice = await Notice.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        .populate("createdBy", "name email employeeId")
        .lean();

      if (!updatedNotice) return res.status(404).json({ success: false, message: "Notice not found" });

      return res.status(200).json({ success: true, message: "Notice updated successfully", data: updatedNotice });
    } catch (error) {
      console.error("Update Notice Error:", error);
      return res.status(500).json({ success: false, message: "Error updating notice", error: error instanceof Error ? error.message : String(error) });
    }
  }
}

export default NoticeService;