import dbConnect from "@/lib/mongodb";
import Pillar from "@/models/Pillar";
import * as cookie from "cookie";
import { userAuth } from "@/middlewares/auth";

// GET all pillars with filtering and pagination
const getAllPillars = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category = "", 
      search = "",
      activeOnly = "true" 
    } = req.query;

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
        { skills: { $regex: search, $options: "i" } }
      ];
    }

    const [pillars, totalPillars] = await Promise.all([
      Pillar.find(query)
        .skip(skip)
        .limit(itemsPerPage)
        .populate("projects", "projectName builderName location price images slug")
        .populate("createdBy", "name email")
        .sort({ category: 1, createdAt: -1 }),
      Pillar.countDocuments(query)
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
};

// POST create new pillar
const createPillar = async (req, res) => {
  try {
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can create pillars"
      });
    }

    const pillarData = {
      ...req.body,
      createdBy: req.employee._id,
    };

    // Validate required fields
    if (!pillarData.name || !pillarData.category || !pillarData.designation || 
        !pillarData.about || !pillarData.experience) {
      return res.status(400).json({
        success: false,
        message: "Name, category, designation, about, and experience are required"
      });
    }

    // Ensure at least one profile image
    if (!pillarData.profileImages || pillarData.profileImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one profile image is required"
      });
    }

    const pillar = new Pillar(pillarData);
    await pillar.save();

    // Populate for response
    await pillar.populate("projects", "projectName builderName location price images slug");
    await pillar.populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Pillar created successfully",
      data: pillar,
    });
  } catch (error) {
    console.error("Error creating pillar:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Pillar with similar details already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create pillar",
      error: error.message,
    });
  }
};

// Auth wrapper
function withAuth(handler) {
  return async (req, res) => {
    try {
      const parsedCookies = cookie.parse(req.headers.cookie || "");
      req.cookies = parsedCookies;
      
      // For GET requests, allow public access
      if (req.method === "GET") {
        try {
          await userAuth(req, res, () => {});
        } catch (authError) {
          // Continue without authentication for GET requests
          req.employee = null;
          req.isSystemAdmin = false;
        }
      } else {
        // For POST requests, require authentication
        await userAuth(req, res, () => {});
      }
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed"
      });
    }
  };
}

// Main handler
const handler = async (req, res) => {
  await dbConnect();

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Add cache control headers
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      return getAllPillars(req, res);
    }

    if (req.method === "POST") {
      return createPillar(req, res);
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("API Handler Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default withAuth(handler);