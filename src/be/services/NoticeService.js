import { Service } from "@framework";
import Notice from "../models/Notice";
import mongoose from "mongoose";
import TeamService from "./analytics/TeamService";

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

      // ✅ FIX: ensure attachments are proper
      let safeAttachments = [];
      if (Array.isArray(attachments)) {
        safeAttachments = attachments.filter((f) => f && f.url);
      }

      const newNotice = new Notice({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority: priority?.trim() || "Info",
        departments: departments?.trim() || "All",
        expiry: expiry || null,
        pinned: pinned || false,
        attachments: safeAttachments, // ✅ FIXED HERE
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
        error: error.message,
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

      // SEARCH
      if (search?.trim()) {
        filters.push({
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { priority: { $regex: search, $options: "i" } },
          ],
        });
      }

      // CATEGORY
      if (category && category !== "All") {
        filters.push({
          category: { $regex: `^${category}$`, $options: "i" },
        });
      }

      // PRIORITY
      if (priority && priority !== "All") {
        filters.push({
          priority: { $regex: `^${priority}$`, $options: "i" },
        });
      }

      // PINNED
      if (pinned !== "") {
        filters.push({
          pinned: pinned === "true",
        });
      }

      // ---------------- EMPLOYEE ACCESS ----------------
      const teamService = new TeamService();
      const employeeId = req.employee?._id;

      let teamMembers = [];
      let myManager = null;

      if (employeeId) {
        teamMembers = await teamService.getMyTeamMembers(employeeId);
        myManager = await teamService.getMyManager(employeeId);
      }

      filters.push({
        $or: [
          { departments: "All" },
          {
            departments: "Teams",
            createdBy: employeeId,
          },
          {
            departments: "Teams",
            createdBy: { $in: teamMembers },
          },
          {
            departments: "Teams",
            createdBy: myManager,
          },
        ],
      });

      // ---------------- TAB FILTER ----------------
      if (departments && departments !== "All") {
        filters.push({
          departments: departments,
        });
      }

      // DATE
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

      // EXPIRY
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filters.push({
        $or: [
          { expiry: { $exists: false } },
          { expiry: null },
          { expiry: { $gte: today } },
        ],
      });

      filters.push({
        isActive: true,
      });

      const query = { $and: filters };

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
        error: error.message,
      });
    }
  }

  // ---------------- META ----------------
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
      console.error("Meta Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch meta",
        error: error.message,
      });
    }
  }

  // ---------------- GET BY ID ----------------
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
      return res.status(500).json({
        success: false,
        message: "Error fetching notice",
        error: error.message,
      });
    }
  }
}

export default NoticeService;