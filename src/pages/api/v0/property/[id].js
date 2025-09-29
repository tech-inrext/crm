import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// Get property by ID
const getPropertyById = async (req, res) => {
  const { id } = req.query;

  try {
    const property = await Property.findById(id).populate("createdBy", "name");
    if (!property) {
      return res.status(404).json({ success: false, error: "Property not found" });
    }
    return res.status(200).json({ success: true, data: property });
  } catch (error) {
    console.error("Error fetching Property:", error);
    return res.status(500).json({ success: false, error: "Error: " + error.message });
  }
};

// Update property (Admin only)
const updateProperty = async (req, res) => {
  const { id } = req.query;

  try {
    // Check if user is admin
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can update properties"
      });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    return res.status(200).json({ success: true, data: updatedProperty });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete property (Admin only - soft delete)
const deleteProperty = async (req, res) => {
  const { id } = req.query;

  try {
    // Check if user is admin
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
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    return res.status(200).json({ success: true, message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Auth wrapper
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// Final handler
const handler = async (req, res) => {
  await dbConnect();

  if (req.method === "GET") {
    return getPropertyById(req, res);
  }

  if (req.method === "PATCH") {
    return updateProperty(req, res);
  }

  if (req.method === "DELETE") {
    return deleteProperty(req, res);
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);


