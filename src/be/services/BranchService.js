import { Service } from "@framework";
import Branch from "../models/Branch";

class BranchService extends Service {
  constructor() {
    super();
  }

  // ✅ Create a new branch (requires WRITE access on "branch")
  async createBranch(req, res) {
    try {
      const { name, address } = req.body;

      if (!name || !address) {
        return res.status(400).json({
          success: false,
          message: "Branch name and address are required",
        });
      }

      const newBranch = new Branch({
        name,
        address,
      });

      await newBranch.save();

      return res.status(201).json({
        success: true,
        data: newBranch,
      });
    } catch (error) {
      console.error("Branch Creation Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  // ✅ Get all branches with pagination and search
  async getAllBranches(req, res) {
    try {
      const { page = 1, limit = 5, search = "" } = req.query;

      const currentPage = parseInt(page);
      const itemsPerPage = parseInt(limit);
      const skip = (currentPage - 1) * itemsPerPage;

      // Optional search filter
      const query = search
        ? {
            $or: [{ name: { $regex: search, $options: "i" } }],
          }
        : {};

      const [branches, totalBranches] = await Promise.all([
        Branch.find(query)
          .skip(skip)
          .limit(itemsPerPage)
          .sort({ createdAt: -1 }),
        Branch.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: branches,
        pagination: {
          totalItems: totalBranches,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(totalBranches / itemsPerPage),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch branches",
        error: error.message,
      });
    }
  }
}

export default BranchService;
