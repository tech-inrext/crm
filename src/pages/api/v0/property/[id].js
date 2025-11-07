// pages/api/v0/property/[id].js
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import mongoose from "mongoose";
import * as cookie from "cookie";
import { userAuth } from "@/middlewares/auth";

// Get property by ID or slug
const getPropertyById = async (req, res) => {
  const { id } = req.query;

  try {
    // Option to get with sub-properties
    const { withChildren = "false" } = req.query;

    const property = await Property.findByIdOrSlug(id).lean();

    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    // If requested, include child properties
    if (withChildren === "true" && property.parentId === null) {
      const subProperties = await Property.find({
        parentId: property._id,
        isActive: true,
      })
        .populate("createdBy", "name email")
        .lean();

      property.subProperties = subProperties;
    }

    return res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Error fetching Property:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID or slug",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Error: " + error.message,
    });
  }
};

// Update property (Admin only)
const updateProperty = async (req, res) => {
  const { id } = req.query;

  try {
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can update properties",
      });
    }

    const existingProperty = await Property.findByIdOrSlug(id);
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // If projectName or builderName is being updated and it's a main project, regenerate slug
    if ((req.body.projectName || req.body.builderName) && existingProperty.parentId === null) {
      const newProjectName = req.body.projectName || existingProperty.projectName;
      const newBuilderName = req.body.builderName || existingProperty.builderName;
      
      req.body.slug = await Property.generateUniqueSlug(
        newProjectName, 
        newBuilderName, 
        existingProperty._id
      );
    } else if (existingProperty.parentId) {
      // Sub-properties shouldn't have slugs
      req.body.slug = undefined;
    }

    // Prevent changing parentId for main projects with children
    if (req.body.parentId) {
      if (existingProperty && existingProperty.parentId === null) {
        const childCount = await Property.countDocuments({ parentId: existingProperty._id });
        if (childCount > 0) {
          return res.status(400).json({
            success: false,
            message: "Cannot change parentId for main project with existing sub-properties",
          });
        }
      }
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      existingProperty._id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    ).populate("createdBy", "name email");

    if (!updatedProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found after update",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID or slug",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists. Please try a different project name or builder name.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete property (Admin only - soft delete with hierarchy support)
const deleteProperty = async (req, res) => {
  const { id } = req.query;

  try {
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can delete properties",
      });
    }

    const property = await Property.findByIdOrSlug(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // If main project, also deactivate all sub-properties
    if (property.parentId === null) {
      await Property.updateMany({ parentId: property._id }, { isActive: false });
    }

    const deletedProperty = await Property.findByIdAndUpdate(
      property._id,
      { isActive: false },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message:
        property.parentId === null
          ? "Project and all sub-properties deleted successfully"
          : "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid property ID or slug",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Auth wrapper
function withAuth(handler) {
  return async (req, res) => {
    try {
      const parsedCookies = cookie.parse(req.headers.cookie || "");
      req.cookies = parsedCookies;

      // For GET requests, allow access but still try to authenticate
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

        // Check if user is admin for PATCH and DELETE
        if (
          (req.method === "PATCH" || req.method === "DELETE") &&
          !req.isSystemAdmin
        ) {
          return res.status(403).json({
            success: false,
            message: "Only administrators can perform this action",
          });
        }
      }

      return handler(req, res);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }
  };
}

// Final handler
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
      return getPropertyById(req, res);
    }

    if (req.method === "PATCH") {
      return updateProperty(req, res);
    }

    if (req.method === "DELETE") {
      return deleteProperty(req, res);
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