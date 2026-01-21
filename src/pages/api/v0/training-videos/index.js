import { Controller } from "@framework";
import TrainingVideoService from "../../../../be/services/TrainingVideoService";

<<<<<<< HEAD
// Helper function to extract YouTube ID
const extractYouTubeId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Helper function to validate YouTube URL
const isValidYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
};

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
=======
class TrainingVideoIndexController extends Controller {
  constructor() {
    super();
    this.service = new TrainingVideoService();
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
  }

<<<<<<< HEAD
// POST create new video
const createVideo = async (req, res) => {
  try {
    const videoData = req.body;

    // Validate required fields
    if (!videoData.title || !videoData.videoUrl || !videoData.category) {
      return res.status(400).json({
        success: false,
        message: "Title, video URL, and category are required"
      });
    }

    // Check if it's a YouTube URL
    const isYouTube = isValidYouTubeUrl(videoData.videoUrl);
    let youTubeId = null;

    if (isYouTube) {
      youTubeId = extractYouTubeId(videoData.videoUrl);
      if (!youTubeId) {
        return res.status(400).json({
          success: false,
          message: "Invalid YouTube URL format"
        });
      }
      
      // Auto-set thumbnail for YouTube if not provided
      if (!videoData.thumbnailUrl) {
        videoData.thumbnailUrl = `https://img.youtube.com/vi/${youTubeId}/maxresdefault.jpg`;
      }
    } else {
      // For uploaded videos, thumbnail is required
      if (!videoData.thumbnailUrl) {
        return res.status(400).json({
          success: false,
          message: "Thumbnail URL is required for uploaded videos"
        });
      }
    }

    // Prepare video data
    const video = {
      ...videoData,
      createdBy: req.employee._id,
      isYouTube,
      youTubeId,
      sourceType: isYouTube ? "youtube" : "upload"
    };

    const trainingVideo = new TrainingVideo(video);
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
    
    // Handle duplicate YouTube videos
    if (error.code === 11000 && error.keyPattern?.youTubeId) {
      return res.status(400).json({
        success: false,
        message: "This YouTube video is already added"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to create training video",
      error: error.message,
    });
=======
  async get(req, res) {
    return this.service.getAllVideos(req, res);
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
  }

  async post(req, res) {
    return this.service.createVideo(req, res);
  }
}

export default new TrainingVideoIndexController().handler;
