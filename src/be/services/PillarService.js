import { Service } from "@framework";
import Pillar from "../models/Pillar";
import Property from "../models/Property"; // Imported in original but seemingly unused? keeping it just in case implicit usage or I missed something.

class PillarService extends Service {
  constructor() {
    super();
  }

  // GET all pillars with filtering and pagination
  async getAllPillars(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category = "",
        search = "",
        activeOnly = "true",
      } = req.query;
      console.log("get all pillars hit");
      const currentPage = Math.max(parseInt(page), 1);
      const itemsPerPage = Math.min(parseInt(limit), 50);
      const skip = (currentPage - 1) * itemsPerPage;

      const query = {};

      // Filter by active status
      if (activeOnly === "true") {
        query.isActive = true;
      }

      // Filter by category
      if (category) {
        query.category = category;
      }

      // Search across multiple fields
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { designation: { $regex: search, $options: "i" } },
          { about: { $regex: search, $options: "i" } },
          { expertise: { $regex: search, $options: "i" } },
          { skills: { $regex: search, $options: "i" } },
        ];
      }

      const [pillars, totalPillars] = await Promise.all([
        Pillar.find(query)
          .skip(skip)
          .limit(itemsPerPage)
          .populate(
            "projects",
            "projectName builderName location price images slug"
          )
          .populate("createdBy", "name email")
          .sort({ category: 1, createdAt: -1 }),
        Pillar.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: pillars,
        pagination: {
          totalItems: totalPillars,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(totalPillars / itemsPerPage),
        },
      });
    } catch (error) {
      console.error("Error fetching pillars:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pillars",
        error: error.message,
      });
    }
  }



  // POST create new pillar
  async createPillar(req, res) {
    try {
      if (!req.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only administrators can create pillars",
        });
      }

      const pillarData = {
        ...req.body,
        createdBy: req.employee._id,
      };

      // Validate required fields
      if (
        !pillarData.name ||
        !pillarData.category ||
        !pillarData.designation ||
        !pillarData.about ||
        !pillarData.experience
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, category, designation, about, and experience are required",
        });
      }

      // Ensure at least one profile image
      if (!pillarData.profileImages || pillarData.profileImages.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one profile image is required",
        });
      }

      const pillar = new Pillar(pillarData);
      await pillar.save();

      // Populate for response
      await pillar.populate(
        "projects",
        "projectName builderName location price images slug"
      );
      await pillar.populate("createdBy", "name email");

      return res.status(201).json({
        success: true,
        message: "Pillar created successfully",
        data: pillar,
      });
    } catch (error) {
      console.error("Error creating pillar:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors,
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Pillar with similar details already exists",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to create pillar",
        error: error.message,
      });
    }
  }

  // GET pillar by ID
  async getPillarById(req, res) {
    const { id } = req.query;
    console.log("get pillar by id hit");

    try {
      const pillar = await Pillar.findById(id)
        .populate(
          "projects",
          "projectName builderName location price images slug propertyType"
        )
        .populate("createdBy", "name email");

      if (!pillar) {
        return res.status(404).json({
          success: false,
          message: "Pillar not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: pillar,
      });
    } catch (error) {
      console.error("Error fetching pillar:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch pillar",
        error: error.message,
      });
    }
  }

  // PATCH update pillar
  async updatePillar(req, res) {
    const { id } = req.query;
    console.log("update pillar hit");

    try {
      if (!req.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only administrators can update pillars",
        });
      }

      const pillar = await Pillar.findById(id);

      if (!pillar) {
        return res.status(404).json({
          success: false,
          message: "Pillar not found",
        });
      }

      const updatedPillar = await Pillar.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      )
        .populate(
          "projects",
          "projectName builderName location price images slug"
        )
        .populate("createdBy", "name email");

      return res.status(200).json({
        success: true,
        message: "Pillar updated successfully",
        data: updatedPillar,
      });
    } catch (error) {
      console.error("Error updating pillar:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update pillar",
        error: error.message,
      });
    }
  }

  // DELETE pillar
  async deletePillar(req, res) {
    const { id } = req.query;

    try {
      if (!req.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only administrators can delete pillars",
        });
      }

      const pillar = await Pillar.findById(id);

      if (!pillar) {
        return res.status(404).json({
          success: false,
          message: "Pillar not found",
        });
      }

      await Pillar.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Pillar deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting pillar:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete pillar",
        error: error.message,
      });
    }
  }
}

export default PillarService;
