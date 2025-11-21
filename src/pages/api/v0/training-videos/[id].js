import dbConnect from "../../../../lib/mongodb";
import TrainingVideo from "../../../../models/TrainingVideo";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// GET video by ID
const getVideoById = async (req, res) => {
  const { id } = req.query;

  try {
    const video = await TrainingVideo.findById(id)
      .populate("createdBy", "name email");

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
};

// PATCH update video
const updateVideo = async (req, res) => {
  const { id } = req.query;

  try {
    const video = await TrainingVideo.findById(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Training video not found",
      });
    }

    // Check if user has permission to update (creator or admin)
    if (video.createdBy.toString() !== req.employee._id.toString() && !req.isSystemAdmin) {
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
};

// DELETE video
const deleteVideo = async (req, res) => {
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
    if (video.createdBy.toString() !== req.employee._id.toString() && !req.isSystemAdmin) {
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
      return getVideoById(req, res);
    }

    if (req.method === "PATCH") {
      return updateVideo(req, res);
    }

    if (req.method === "DELETE") {
      return deleteVideo(req, res);
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

