import { Service } from "@framework";
import Notice from "../models/Notice";
import mongoose from "mongoose";
import TeamService from "./analytics/TeamService";

class NoticeService extends Service {
  constructor() {
    super();
    this.teamService = new TeamService(); // initialize teamService
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
        targetAVP, // Admin can assign to an AVP
      } = req.body;

      if (!title?.trim() || !description?.trim() || !category?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title, description and category are required",
        });
      }

      const safeAttachments = Array.isArray(attachments)
        ? attachments.filter((f) => f && f.url)
        : [];

      const newNotice = new Notice({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority: priority?.trim() || "Info",
        departments: departments || "All", // now a string
        expiry: expiry || null,
        pinned: pinned || false,
        attachments: safeAttachments,
        createdBy: req.employee?._id || null,
        targetAVP: targetAVP || null, // store AVP if created by Admin
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

    // ---------------- SEARCH ----------------
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

    // ---------------- CATEGORY ----------------
    if (category && category !== "All") {
      filters.push({
        category: { $regex: `^${category}$`, $options: "i" },
      });
    }

    // ---------------- PRIORITY ----------------
    if (priority && priority !== "All") {
      filters.push({
        priority: { $regex: `^${priority}$`, $options: "i" },
      });
    }

    // ---------------- PINNED ----------------
    if (pinned !== "") {
      filters.push({ pinned: pinned === "true" });
    }

    // ---------------- EMPLOYEE ACCESS ----------------
    const employeeId = req.employee?._id;
    const isAVP = req.isAVP;
    const isSystemAdmin = req.isSystemAdmin;
    console.log("Access Check - EmployeeID:", employeeId, "isAVP:", isAVP, "isSystemAdmin:", isSystemAdmin);

    let teamMembers = [];
    let myManager = null;

    if (employeeId) {
      teamMembers =
        (await this.teamService.getMyTeamMembers(employeeId)) || [];
      myManager =
        (await this.teamService.getMyManager(employeeId)) || null;
    }

    // ---------------- ACCESS RULES ----------------

    // ✅ SYSTEM ADMIN (ADMIN)
    if (isSystemAdmin) {
      filters.push({ isActive: true });
    }

    // ✅ AVP
    else if (isAVP) {
      filters.push({
        $or: [
          // Public notices
          {
            departments: { $in: ["All"] },
            targetAVP: null,
          },

          // Notices assigned to this AVP
          {
            targetAVP: employeeId,
          },

          // Team notices (created by AVP or team)
          {
            departments: { $in: ["Teams"] },
            createdBy: { $in: [employeeId, ...teamMembers] },
          },
        ],
      });
    }

    // ✅ EMPLOYEE
    else {
      filters.push({
        $or: [
          // Public notices
          {
            departments: { $in: ["All"] },
            targetAVP: null,
          },

          // Own notices
          {
            createdBy: employeeId,
          },

          // Notices assigned via manager (AVP)
          ...(myManager
            ? [{ targetAVP: myManager }]
            : []),

          // Team notices from manager
          ...(myManager
            ? [
                {
                  departments: { $in: ["Teams"] },
                  createdBy: myManager,
                },
              ]
            : []),
        ],
      });
    }

    // ---------------- DEPARTMENT FILTER ----------------
    if (departments && departments !== "All") {
      filters.push({
        departments: { $in: [departments] },
      });
    }

    // ---------------- DATE FILTER ----------------
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filters.push({
        createdAt: { $gte: start, $lte: end },
      });
    }

    // ---------------- EXPIRY FILTER ----------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filters.push({
      $or: [
        { expiry: { $exists: false } },
        { expiry: null },
        { expiry: { $gte: today } },
      ],
    });

    // ---------------- QUERY ----------------
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

    // ---------------- ADD isLatest FLAG ----------------
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfToday.getDate() + 1);

    const noticesWithLatest = notices.map((notice) => {
      const createdAt = new Date(notice.createdAt);

      return {
        ...notice,
        isLatest:
          createdAt >= startOfToday &&
          createdAt < startOfTomorrow,
      };
    });

    // ---------------- RESPONSE ----------------
    return res.status(200).json({
      success: true,
      data: noticesWithLatest,
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
  // ---------------- GET META ----------------
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
        error: error.message,
      });
    }
  }

  // ---------------- GET BY ID ----------------
  async getNoticeById(req, res) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid notice ID" });
      }

      const notice = await Notice.findById(id)
        .populate("createdBy", "name email employeeId")
        .lean();

      if (!notice)
        return res
          .status(404)
          .json({ success: false, message: "Notice not found" });

      return res.status(200).json({ success: true, data: notice });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching notice",
        error: error.message,
      });
    }
  }

  // ---------------- UPDATE NOTICE ----------------
  async updateNotice(req, res) {
    try {
      const id = req.params?.id || req.query?.id || req.body?.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id))
        return res
          .status(400)
          .json({ success: false, message: "Invalid notice ID" });

      const updateData = { ...req.body };
      if (updateData.title) updateData.title = updateData.title.trim();
      if (updateData.description)
        updateData.description = updateData.description.trim();
      if (updateData.category) updateData.category = updateData.category.trim();
      if (updateData.priority) updateData.priority = updateData.priority.trim();
      if (updateData.departments) {
        if (Array.isArray(updateData.departments)) {
          updateData.departments = updateData.departments.map((d) =>
            typeof d === "string" ? d.trim() : d,
          );
        } else if (typeof updateData.departments === "string") {
          updateData.departments = updateData.departments.trim();
        }
      }
      if (updateData.expiry) updateData.expiry = new Date(updateData.expiry);
      if (Array.isArray(updateData.attachments))
        updateData.attachments = updateData.attachments.filter(
          (f) => f && f.url,
        );

      const updatedNotice = await Notice.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("createdBy", "name email employeeId");

      if (!updatedNotice)
        return res
          .status(404)
          .json({ success: false, message: "Notice not found" });

      return res.status(200).json({
        success: true,
        message: "Notice updated successfully",
        data: updatedNotice,
      });
    } catch (error) {
      console.error("Update Notice Error:", error);
      return res.status(500).json({
        success: false,
        message: "Update failed",
        error: error.message,
      });
    }
  }

  // ---------------- DELETE NOTICE ----------------
  async deleteNotice(req, res) {
    try {
      const id = req.params?.id || req.query?.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id))
        return res
          .status(400)
          .json({ success: false, message: "Invalid notice ID" });

      const notice = await Notice.findByIdAndDelete(id);
      if (!notice)
        return res
          .status(404)
          .json({ success: false, message: "Notice not found" });

      return res
        .status(200)
        .json({ success: true, message: "Notice deleted successfully" });
    } catch (error) {
      console.error("Delete Notice Error:", error);
      return res.status(500).json({
        success: false,
        message: "Delete failed",
        error: error.message,
      });
    }
  }
}

export default NoticeService;