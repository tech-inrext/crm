// // pages/api/v0/property/[id].js

import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import * as cookie from "cookie";
import { userAuth } from "@/middlewares/auth";

// Get property by ID
const getPropertyById = async (req, res) => {
  const { id } = req.query;

  try {
    const property = await Property.findById(id)
      .populate("createdBy", "name email")
      .lean();

    if (!property) {
      return res.status(404).json({ 
        success: false, 
        error: "Property not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: property 
    });
  } catch (error) {
    console.error("Error fetching Property:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid property ID" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: "Error: " + error.message 
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
        message: "Only administrators can update properties"
      });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: req.body },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).populate("createdBy", "name email");

    if (!updatedProperty) {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: updatedProperty 
    });
  } catch (error) {
    console.error("Error updating property:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errors
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid property ID" 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete property (Admin only - soft delete)
const deleteProperty = async (req, res) => {
  const { id } = req.query;

  try {
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can delete properties"
      });
    }

    const deletedProperty = await Property.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedProperty) {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Property deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid property ID" 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Auth wrapper
function withAuth(handler) {
  return async (req, res) => {
    try {
      const parsedCookies = cookie.parse(req.headers.cookie || "");
      req.cookies = parsedCookies;
      await userAuth(req, res, () => handler(req, res));
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed"
      });
    }
  };
}

// Final handler
const handler = async (req, res) => {
  await dbConnect();

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
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
      message: "Method not allowed" 
    });
  } catch (error) {
    console.error("API Handler Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export default withAuth(handler);


