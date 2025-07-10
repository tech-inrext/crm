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
    const uploads = await BulkUpload.find({ uploadedBy: loggedInUserId })
      .sort({ createdAt: -1 }) // latest first
      .populate("uploadedBy", "name email"); // optional: add other fields

    // console.log(uploads);

    res.status(200).json({
      success: true,
      count: uploads.length,
      data: uploads,
    });
  } catch (error) {
    console.error("Error fetching bulk uploads:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bulk uploads.",
    });
  }
}
