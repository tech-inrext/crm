import { Service } from "@framework";
import Holiday from "@/be/models/Holiday";
import mongoose from "mongoose";

class HolidayService extends Service {
  // ---------------- CREATE HOLIDAY ----------------
  async createHoliday(req, res) {
    try {
      const {
        name,
        date,
        type,
        applicable_to,
        impact_level,
        region,
        is_recurring,
        description,
      } = req.body;

      if (!name?.trim() || !date) {
        return res.status(400).json({
          success: false,
          message: "Holiday name and date are required",
        });
      }

      const newHoliday = new Holiday({
        name: name.trim(),
        date: new Date(date),
        type: type || "public",
        applicable_to: applicable_to || "all",
        impact_level: impact_level || "high",
        region: region || "India",
        is_recurring: is_recurring || false,
        description: description?.trim() || "",
        createdBy: req.employee?._id || null,
      });

      await newHoliday.save();

      return res.status(201).json({
        success: true,
        message: "Holiday created successfully",
        data: newHoliday,
      });
    } catch (error) {
      console.error("Create Holiday Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create holiday",
        error: error.message,
      });
    }
  }

  // ---------------- GET ALL HOLIDAYS ----------------
  async getAllHolidays(req, res) {
    try {
      const { type = "", search = "", page = 1, limit = 50 } = req.query;

      const filters = [];

      // Search
      if (search) {
        filters.push({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        });
      }

      // Type filter
      if (type && type !== "All") {
        filters.push({ type });
      }

      const query = filters.length ? { $and: filters } : {};

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const totalItems = await Holiday.countDocuments(query);

      const holidays = await Holiday.find(query)
        .populate("createdBy", "name email") // ✅ ADD THIS
        .sort({ date: 1 })
        .skip(skip)
        .limit(limitNumber)
        .lean();

      return res.status(200).json({
        success: true,
        data: holidays,
        pagination: {
          totalItems,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalItems / limitNumber),
        },
      });
    } catch (error) {
      console.error("Fetch Holiday Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch holidays",
      });
    }
  }

  // ---------------- DELETE HOLIDAY ----------------
  async deleteHoliday(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid holiday ID",
        });
      }

      const holiday = await Holiday.findByIdAndDelete(id);

      if (!holiday) {
        return res.status(404).json({
          success: false,
          message: "Holiday not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Holiday deleted successfully",
      });
    } catch (error) {
      console.error("Delete Holiday Error:", error);
      return res.status(500).json({
        success: false,
        message: "Delete failed",
      });
    }
  }
}

export default HolidayService;
