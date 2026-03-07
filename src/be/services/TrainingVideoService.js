import { Service } from "@framework";
import TrainingVideo from "../models/TrainingVideo";

// YouTube URL validation helper functions
const isValidYouTubeUrl = (url) => {
  if (!url) return false;
  
  const patterns = [
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i,
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]{11}/i,
    /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]{11}/i,
    /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]{11}/i,
    /^(https?:\/\/)?(www\.)?youtube\.com\/v\/[\w-]{11}/i,
    /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[\w-]{11}/i
  ];
  
  return patterns.some(pattern => pattern.test(url));
};

const extractYouTubeId = (url) => {
  if (!url) return null;
  
  try {
    // Handle youtu.be URLs
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1];
      return id.split('?')[0].split('/')[0];
    }
    
    // Handle youtube.com URLs
    if (url.includes('youtube.com')) {
      // Try to get the v parameter
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
      
      // Handle embed URLs
      if (url.includes('/embed/')) {
        const parts = url.split('/embed/');
        return parts[1].split('?')[0].split('/')[0];
      }
      
      // Handle shorts URLs
      if (url.includes('/shorts/')) {
        const parts = url.split('/shorts/');
        return parts[1].split('?')[0].split('/')[0];
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting YouTube ID:", error);
    return null;
  }
};

class TrainingVideoService extends Service {
  constructor() {
    super();
  }

  // GET all videos with filtering and pagination
  async getAllVideos(req, res) {
    console.log("getAllVideos hit");
    try {
      const {
        page = 1,
        limit = 12,
        search = "",
        category = "",
        sortBy = "uploadDate",
        sortOrder = "desc",
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
          { description: { $regex: search, $options: "i" } },
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
        TrainingVideo.getFeaturedVideos(4),
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
  }

  // POST create new video
  async createVideo(req, res) {
    try {
      const videoData = req.body;

      // Validate required fields
      if (
        !videoData.title ||
        !videoData.videoUrl ||
        !videoData.category
      ) {
        return res.status(400).json({
          success: false,
          message: "Title, video URL and category are required",
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
    }
  }

  async getCategories(req, res) {
    console.log("getCategories hit");
    try {
      const categories = await TrainingVideo.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            latestVideo: { $max: "$uploadDate" },
          },
        },
        {
          $project: {
            name: "$_id",
            count: 1,
            latestVideo: 1,
            _id: 0,
          },
        },
        { $sort: { count: -1 } },
      ]);

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
        error: error.message,
      });
    }
  }

  // GET video by ID
  async getVideoById(req, res) {
    const { id } = req.query;
    console.log("getVideoById hit");
    try {
      const video = await TrainingVideo.findById(id).populate(
        "createdBy",
        "name email"
      );

      if (!video) {
        return res.status(404).json({
          success: false,
          message: "Training video not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: video,
      });
    } catch (error) {
      console.error("Error fetching video:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch training video",
        error: error.message,
      });
    }
  }

  // PATCH update video
  async updateVideo(req, res) {
    const { id } = req.query;
    console.log("updateVideo hit");
    try {
      const video = await TrainingVideo.findById(id);

      if (!video) {
        return res.status(404).json({
          success: false,
          message: "Training video not found",
        });
      }

      // Check if user has permission to update (creator or admin)
      if (
        video.createdBy.toString() !== req.employee._id.toString() &&
        !req.isSystemAdmin
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update this video",
        });
      }

      const updatedVideo = await TrainingVideo.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate("createdBy", "name email");

      return res.status(200).json({
        success: true,
        message: "Training video updated successfully",
        data: updatedVideo,
      });
    } catch (error) {
      console.error("Error updating video:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update training video",
        error: error.message,
      });
    }
  }

  // DELETE video
  async deleteVideo(req, res) {
    const { id } = req.query;

    try {
      const video = await TrainingVideo.findById(id);

      if (!video) {
        return res.status(404).json({
          success: false,
          message: "Training video not found",
        });
      }

      // Check if user has permission to delete (creator or admin)
      if (
        video.createdBy.toString() !== req.employee._id.toString() &&
        !req.isSystemAdmin
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete this video",
        });
      }

      await TrainingVideo.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Training video deleted successfully",
        data: {
          id: video._id,
          title: video.title,
        },
      });
    } catch (error) {
      console.error("Error deleting video:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete training video",
        error: error.message,
      });
    }
  }
}

export default TrainingVideoService;