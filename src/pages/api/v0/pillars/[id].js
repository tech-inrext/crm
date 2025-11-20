import dbConnect from "@/lib/mongodb";
import Pillar from "@/models/Pillar";
import * as cookie from "cookie";
import { userAuth } from "@/middlewares/auth";

// GET pillar by ID
const getPillarById = async (req, res) => {
  const { id } = req.query;

  try {
    const pillar = await Pillar.findById(id)
      .populate("projects", "projectName builderName location price images slug propertyType")
      .populate("createdBy", "name email");

    if (!pillar) {
      return res.status(404).json({
        success: false,
        message: "Pillar not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: pillar,
    });
  } catch (error) {
    console.error("Error fetching pillar:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pillar",
      error: error.message,
    });
  }
};

// PATCH update pillar
const updatePillar = async (req, res) => {
  const { id } = req.query;

  try {
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can update pillars"
      });
    }

    const pillar = await Pillar.findById(id);
    
    if (!pillar) {
      return res.status(404).json({
        success: false,
        message: "Pillar not found",
      });
    }

    const updatedPillar = await Pillar.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
    .populate("projects", "projectName builderName location price images slug")
    .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Pillar updated successfully",
      data: updatedPillar,
    });
  } catch (error) {
    console.error("Error updating pillar:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update pillar",
      error: error.message,
    });
  }
};

// DELETE pillar (soft delete)
const deletePillar = async (req, res) => {
  const { id } = req.query;

  try {
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can delete pillars"
      });
    }

    const pillar = await Pillar.findById(id);
    
    if (!pillar) {
      return res.status(404).json({
        success: false,
        message: "Pillar not found",
      });
    }

    await Pillar.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Pillar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pillar:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete pillar",
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
        // For other methods, require authentication
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
      return getPillarById(req, res);
    }

    if (req.method === "PATCH") {
      return updatePillar(req, res);
    }

    if (req.method === "DELETE") {
      return deletePillar(req, res);
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


