// pages/api/v0/bulk-upload/all.js
import dbConnect from "@/lib/mongodb";
import BulkUpload from "@/models/BulkUpload";
import Employee from "../../../../models/Employee";
import { loginAuth } from "../../../../middlewares/loginAuth";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  await new Promise((resolve, reject) => {
    loginAuth(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });

  try {
    const loggedInUserId = req.employee?._id;

    // Pagination query params
    const { page = 1, limit = 5 } = req.query;
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Get paginated uploads
    const [uploads, total] = await Promise.all([
      BulkUpload.find({ uploadedBy: loggedInUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage)
        .populate("uploadedBy", "name email"),
      BulkUpload.countDocuments({ uploadedBy: loggedInUserId }),
    ]);

    // console.log(uploads);

    res.status(200).json({
      success: true,
      count: uploads.length,
      data: uploads,
      pagination: {
        totalItems: total,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(total / itemsPerPage),
      },
    });
  } catch (error) {
    console.error("Error fetching bulk uploads:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bulk uploads.",
    });
  }
}
