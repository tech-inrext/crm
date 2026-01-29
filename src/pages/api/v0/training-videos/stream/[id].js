// pages/api/v0/training-videos/stream/[id].js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import { promisify } from "util";
import dbConnect from "../../../../../lib/mongodb";
import TrainingVideo from "../../../../../be/models/TrainingVideo";
import { userAuth } from "../../../../../be/middlewares/auth";
import * as cookie from "cookie";

const stat = promisify(fs.stat);

// Function to authenticate requests
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// GET video stream
const getVideoStream = async (req, res) => {
  const { id } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID",
      });
    }

    // Find video in database
    const video = await TrainingVideo.findById(id)
      .populate("createdBy", "name email");
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Check if video is public or user has access
    if (!video.isPublic && (!req.employee || !req.isSystemAdmin)) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this video",
      });
    };

    // Parse the video URL to determine storage type
    const videoUrl = video.videoUrl;
    
    if (videoUrl.startsWith('http')) {
      // For external URLs (S3, CDN, etc.)
      return handleExternalStream(videoUrl, req, res);
    } else {
      // For local files
      return handleLocalStream(videoUrl, req, res, video);
    }
  } catch (error) {
    console.error("Error streaming video:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to stream video",
      error: error.message,
    });
  }
};

// Handle external streaming (S3, CDN, etc.)
const handleExternalStream = async (videoUrl, req, res) => {
  try {
    return res.redirect(videoUrl);
  } catch (error) {
    console.error("External streaming error:", error);
    res.status(500).send("Streaming error");
  }
};

// Handle local file streaming with range requests
const handleLocalStream = async (filePath, req, res, video) => {
  try {
    const absolutePath = path.resolve(process.cwd(), 'public', filePath);
    
    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: "Video file not found on server",
      });
    }

    // Get file stats
    const stats = await stat(absolutePath);
    
    if (!stats.isFile()) {
      return res.status(404).json({
        success: false,
        message: "Not a valid video file",
      });
    }

    const fileSize = stats.size;
    const mimeType = video.mimeType || mime.lookup(absolutePath) || 'video/mp4';
    
    // Parse Range header
    const range = req.headers.range;
    
    if (!range) {
      // If no range header, send entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      });
      
      const stream = fs.createReadStream(absolutePath);
      return stream.pipe(res);
    }
    
    // Parse range header
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    
    // Validate range
    if (start >= fileSize || end >= fileSize || start > end) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`
      });
      return res.end();
    }
    
    const chunkSize = (end - start) + 1;
    
    // Send partial content
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=31536000',
    });
    
    // Create read stream for the specific range
    const stream = fs.createReadStream(absolutePath, { start, end });
    stream.pipe(res);
    
  } catch (error) {
    console.error("Local file streaming error:", error);
    res.status(500).json({
      success: false,
      message: "Error streaming video file",
      error: error.message,
    });
  }
};

// Main handler
const handler = async (req, res) => {
  await dbConnect();

  if (req.method === "GET") {
    return getVideoStream(req, res);
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

export default withAuth(handler);

