import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// Create a new property (Admin only)
const createProperty = async (req, res) => {
  try {
    const {
      projectName,
      builderName,
      description,
      location,
      price,
      status,
      features,
      amenities,
      nearby,
      projectHighlights,
      mapLocation,
      images,
      brochureUrls,
      creatives,
      videoIds
    } = req.body;

    // Check if user is admin
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can create properties"
      });
    }

    const newProperty = new Property({
      projectName,
      builderName,
      description,
      location,
      price,
      status,
      features,
      amenities,
      nearby,
      projectHighlights,
      mapLocation,
      images: images || [],
      brochureUrls,
      creatives,
      videoIds,
      createdBy: req.employee._id
    });

    await newProperty.save();

    return res.status(201).json({
      success: true,
      data: newProperty
    });
  } catch (error) {
    console.error("Property Creation Error:", error.message);
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
    const { page = 1, limit = 10, search = "" } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Search filter
    const query = search
      ? {
          $or: [
            { projectName: { $regex: search, $options: "i" } },
            { builderName: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } }
          ],
          isActive: true
        }
      : { isActive: true };

    const [properties, totalProperties] = await Promise.all([
      Property.find(query)
        .skip(skip)
        .limit(itemsPerPage)
        .sort({ createdAt: -1 })
        .populate("createdBy", "name"),
      Property.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        totalItems: totalProperties,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalProperties / itemsPerPage)
      }
    });
  } catch (error) {
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
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// Main handler
// const handler = async (req, res) => {
//   await dbConnect();

//   if (req.method === "GET") {
//     return getAllProperties(req, res);
//   }

//   if (req.method === "POST") {
//     return createProperty(req, res);
//   }

//   return res.status(405).json({
//     success: false,
//     message: "Method not allowed"
//   });
// };
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
};

export default withAuth(handler);

