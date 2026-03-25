import { Service } from "@framework";
import Notice from "../models/Notice";
import mongoose from "mongoose";

class NoticeService extends Service {
  constructor() {
    super();
  }

  // ✅ Create Notice
  async createNotice(req, res) {
    try {
      const {
        title,
        description,
        category,
        priority,
        audience,
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
        audience: audience || "All",
        expiry: expiry || null,
        pinned: pinned || false,
        createdBy: req.employee?._id,
      });

      await newNotice.save();

      return res.status(201).json({
        success: true,
        message: "Notice created successfully",
        data: newNotice,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create notice",
        error: error.message,
      });
    }
  }

  // ✅ Get All Notices
  async getAllNotices(req, res) {
    try {
      const {
        search = "",
        category,
        priority,
        date,
      } = req.query;

      let query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      if (category) {
        query.category = category;
      }

      if (priority) {
        query.priority = priority;
      }

      if (date) {
        query.createdAt = {
          $gte: new Date(date),
          $lte: new Date(date + "T23:59:59.999Z"),
        };
      }

      const notices = await Notice.find(query)
        .sort({ pinned: -1, createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        data: notices,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notices",
        error: error.message,
      });
    }
  }

  // ✅ Get Notice by ID
  async getNoticeById(req, res) {
    try {
      const { id } = req.query;

      const notice = await Notice.findById(id);

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

  // ✅ Update Notice
  async updateNotice(req, res) {
    try {
      const { id } = req.query;

      const updatedNotice = await Notice.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Notice updated successfully",
        data: updatedNotice,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error updating notice",
        error: error.message,
      });
    }
  }

  // ✅ Delete Notice
  async deleteNotice(req, res) {
    try {
      const { id } = req.query;

      await Notice.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Notice deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error deleting notice",
        error: error.message,
      });
    }
  }
}

export default NoticeService;