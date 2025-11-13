import dbConnect from "../../../../lib/mongodb";
import TrainingVideo from "../../../../models/TrainingVideo";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// GET all videos with filtering and pagination
const getAllVideos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      category = "",
      sortBy = "uploadDate",
      sortOrder = "desc"
    } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Build query
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [videos, totalVideos, featuredVideos] = await Promise.all([
      TrainingVideo.find(query)
        .populate("createdBy", "name email")
        .sort(sortOptions)
        .skip(skip)
        .limit(itemsPerPage),
      TrainingVideo.countDocuments(query),
      TrainingVideo.getFeaturedVideos(4)
    ]);

    return res.status(200).json({
      success: true,
      data: videos,
      featured: featuredVideos,
      pagination: {
        totalItems: totalVideos,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalVideos / itemsPerPage),
      },
    });
  } catch (error) {
    console.error("Error fetching training videos:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch training videos",
      error: error.message,
    });
  }
};

// POST create new video
const createVideo = async (req, res) => {
  try {
    const videoData = {
      ...req.body,
      createdBy: req.employee._id,
    };

    // Validate required fields
    if (!videoData.title || !videoData.videoUrl || !videoData.thumbnailUrl || !videoData.category) {
      return res.status(400).json({
        success: false,
        message: "Title, video URL, thumbnail URL, and category are required"
      });
    }

    const trainingVideo = new TrainingVideo(videoData);
    await trainingVideo.save();

    // Populate createdBy for response
    await trainingVideo.populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Training video created successfully",
      data: trainingVideo,
    });
  } catch (error) {
    console.error("Error creating training video:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create training video",
      error: error.message,
    });
  }
};

function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

const handler = async (req, res) => {
  await dbConnect();

  try {
    if (req.method === "GET") {
      return getAllVideos(req, res);
    }

    if (req.method === "POST") {
      return createVideo(req, res);
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default withAuth(handler);