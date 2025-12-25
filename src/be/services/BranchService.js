import { Service } from "@framework";
import Branch from "../../models/Branch";

class BranchService extends Service {
  constructor() {
    super();
  }

  // ✅ Create a new branch (requires WRITE access on "branch")
  async createBranch(req, res) {
    try {
      const { name, address } = req.body;

      if (!name || !address) {
        return HttpStatus.badRequest(res, {
          success: false,
          message: "Branch name and address are required",
        });
      }

      const newBranch = new Branch({
        name,
        address,
      });

      await newBranch.save();

      return HttpStatus.created(res, { data: newBranch });
    } catch (error) {
      console.error("Branch Creation Error:", error.message);
      return HttpStatus.badRequest(res, { message: "Internal Server Error" });
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

      return HttpStatus.success(res, {
        data: branches,
        pagination: {
          totalItems: totalBranches,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(totalBranches / itemsPerPage),
        },
      });
    } catch (error) {
      return HttpStatus.badRequest(res, {
        message: "Failed to fetch branches",
      });
    }
  }
}

export default BranchService;
