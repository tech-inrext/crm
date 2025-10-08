// pages/api/v0/property/index.js

import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import * as cookie from "cookie";
import { userAuth } from "@/middlewares/auth";

// Create a new property (Admin only)
const createProperty = async (req, res) => {
  try {
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can create properties"
      });
    }

    const newProperty = new Property({
      ...req.body,
      createdBy: req.employee._id
    });

    await newProperty.save();

    return res.status(201).json({
      success: true,
      data: newProperty
    });
  } catch (error) {
    console.error("Property Creation Error:", error.message);
    
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
        message: "Property with similar details already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Get all properties (with pagination and search)
const getAllProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, propertyType } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const itemsPerPage = Math.min(parseInt(limit), 100);
    const skip = (currentPage - 1) * itemsPerPage;

    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: "i" } },
        { builderName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (status) {
      query.status = { $in: Array.isArray(status) ? status : [status] };
    }

    if (propertyType) {
      query["propertyTypes.propertyType"] = propertyType;
    }

    const [properties, totalProperties] = await Promise.all([
      Property.find(query)
        .skip(skip)
        .limit(itemsPerPage)
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email")
        .lean(),
      Property.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        totalItems: totalProperties,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalProperties / itemsPerPage),
        hasNextPage: currentPage < Math.ceil(totalProperties / itemsPerPage),
        hasPrevPage: currentPage > 1
      }
    });
  } catch (error) {
    console.error("Get Properties Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.message
    });
  }
};

// Middleware wrapper for authentication
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

// Main handler
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
      return getAllProperties(req, res);
    }

    if (req.method === "POST") {
      return createProperty(req, res);
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

