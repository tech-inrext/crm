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

    // Create a copy of request body to modify
    const updateData = { ...req.body };

    console.log('Update request data:', JSON.stringify(updateData, null, 2));
    console.log('Existing property type:', existingProperty.propertyType);

    // ✅ FIX: Handle propertyType - convert array to string if needed
    if (updateData.propertyType) {
      if (Array.isArray(updateData.propertyType)) {
        // Take the first item if it's an array
        if (updateData.propertyType.length > 0) {
          updateData.propertyType = updateData.propertyType[0];
          console.log('Converted propertyType from array to string:', updateData.propertyType);
        } else {
          // If array is empty, keep existing value
          delete updateData.propertyType;
          console.log('Keeping existing property type:', existingProperty.propertyType);
        }
      }
      // Ensure it's a valid enum value
      const validTypes = ["project", "residential", "commercial", "plot"];
      if (!validTypes.includes(updateData.propertyType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid property type. Must be one of: ${validTypes.join(', ')}`
        });
      }
    }

    // If projectName or builderName is being updated and it's a main project, regenerate slug
    if ((updateData.projectName || updateData.builderName) && existingProperty.parentId === null) {
      const newProjectName = updateData.projectName || existingProperty.projectName;
      const newBuilderName = updateData.builderName || existingProperty.builderName;
      
      updateData.slug = await Property.generateUniqueSlug(
        newProjectName, 
        newBuilderName, 
        existingProperty._id
      );
      console.log('Regenerated slug:', updateData.slug);
    } else if (existingProperty.parentId) {
      // Sub-properties shouldn't have slugs
      updateData.slug = undefined;
    }

    // Prevent changing parentId for main projects with children
    if (updateData.parentId !== undefined) {
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

    // ✅ FIX: Remove nested property arrays if they exist (these should only be used during creation)
    // During updates, we should only update the main property fields
    delete updateData.residentialProperties;
    delete updateData.commercialProperties;
    delete updateData.plotProperties;

    // Also need to handle propertyImages, floorPlans, etc. appropriately
    // Convert arrays to proper format if they exist
    if (updateData.propertyImages && Array.isArray(updateData.propertyImages)) {
      updateData.propertyImages = updateData.propertyImages.map(img => {
        // Handle both string URLs and object formats
        const imageData = {
          url: img.url || (typeof img === 'string' ? img : ''),
          title: img.title || '',
          description: img.description || '',
          isPrimary: img.isPrimary || false,
          uploadedAt: img.uploadedAt || new Date().toISOString()
        };
        // Only include if URL exists
        return imageData.url ? imageData : null;
      }).filter(img => img !== null);
    }

    if (updateData.floorPlans && Array.isArray(updateData.floorPlans)) {
      updateData.floorPlans = updateData.floorPlans.map(plan => {
        const planData = {
          url: plan.url || (typeof plan === 'string' ? plan : ''),
          title: plan.title || '',
          description: plan.description || '',
          type: plan.type || '2d',
          uploadedAt: plan.uploadedAt || new Date().toISOString()
        };
        return planData.url ? planData : null;
      }).filter(plan => plan !== null);
    }

    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = updateData.images.map(img => {
        const imageData = {
          url: img.url || (typeof img === 'string' ? img : ''),
          title: img.title || '',
          description: img.description || '',
          isPrimary: img.isPrimary || false,
          uploadedAt: img.uploadedAt || new Date().toISOString()
        };
        return imageData.url ? imageData : null;
      }).filter(img => img !== null);
    }

    console.log('Final update data:', JSON.stringify(updateData, null, 2));

    const updatedProperty = await Property.findByIdAndUpdate(
      existingProperty._id,
      { $set: updateData },
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

    // ✅ If this is a main project and its price changed, update sub-properties' price
    if (updateData.price && existingProperty.parentId === null) {
      const subProperties = await Property.find({ parentId: existingProperty._id });
      if (subProperties.length > 0) {
        // Update all sub-properties that don't have their own price set
        for (const subProp of subProperties) {
          if (!subProp.price || subProp.price === 'Contact for price') {
            await Property.findByIdAndUpdate(subProp._id, {
              $set: { price: updateData.price }
            });
          }
        }
        console.log(`Updated price for ${subProperties.length} sub-properties`);
      }
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
      console.error('CastError details:', error);
      return res.status(400).json({
        success: false,
        message: `Invalid data format: ${error.message}`,
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

// Delete property (Admin only - HARD DELETE)
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

    // If main project, also delete all sub-properties
    if (property.parentId === null) {
      await Property.deleteMany({ parentId: property._id });
      console.log(`Deleted ${property._id} and all its sub-properties`);
    }

    // HARD DELETE - permanently remove the property
    await Property.deleteOne({ _id: property._id });
    console.log(`Permanently deleted property: ${property._id}`);

    return res.status(200).json({
      success: true,
      message:
        property.parentId === null
          ? "Project and all sub-properties permanently deleted"
          : "Property permanently deleted",
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
