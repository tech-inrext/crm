import { Service } from "@framework";
import Property from "../../models/Property";
import mongoose from "mongoose";

class PropertyService extends Service {
  constructor() {
    super();
  }

  async getPublicProperties(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        search = "",
        propertyType,
        location,
        builderName,
        minPrice,
        maxPrice,
        featured = "false",
      } = req.query;
      
      console.log("Origin: ", req.headers.origin);

      const currentPage = Math.max(parseInt(page), 1);
      const itemsPerPage = Math.min(parseInt(limit), 50);
      const skip = (currentPage - 1) * itemsPerPage;
      const query = {
        isPublic: true, // Only return public properties
        parentId: null, // Only main projects
      };

      // Enhanced search across multiple fields
      if (search) {
        query.$or = [
          { projectName: { $regex: search, $options: "i" } },
          { builderName: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Filter by propertyType
      if (propertyType) {
        query.propertyType = propertyType;
      }

      // Filter by location
      if (location) {
        query.location = { $regex: location, $options: "i" };
      }

      // Filter by builderName
      if (builderName) {
        query.builderName = { $regex: builderName, $options: "i" };
      }

      // Filter by price range
      if (minPrice || maxPrice) {
        query.$and = [];
        if (minPrice) {
          query.$and.push({
            $or: [
              { maxPrice: { $gte: parseFloat(minPrice) } },
              { minPrice: { $gte: parseFloat(minPrice) } },
            ],
          });
        }
        if (maxPrice) {
          query.$and.push({
            $or: [
              { minPrice: { $lte: parseFloat(maxPrice) } },
              { maxPrice: { $lte: parseFloat(maxPrice) } },
            ],
          });
        }
        if (query.$and.length === 0) {
          delete query.$and;
        }
      }

      // Filter featured properties
      if (featured === "true") {
        query.isFeatured = true;
      }

      const [properties, totalProperties] = await Promise.all([
        Property.find(query)
          .skip(skip)
          .limit(itemsPerPage)
          .select(
            "projectName builderName description location price minPrice maxPrice propertyType images slug status amenities nearby projectHighlights mapLocation isFeatured createdAt",
          )
          .sort({ isFeatured: -1, createdAt: -1 })
          .lean(),
        Property.countDocuments(query),
      ]);

      // Get sub-properties count for each main project
      for (let property of properties) {
        const subPropertyCount = await Property.countDocuments({
          parentId: property._id,
          isPublic: true,
        });
        property.subPropertyCount = subPropertyCount;
      }

      return res.status(200).json({
        success: true,
        data: properties,
        pagination: {
          totalItems: totalProperties,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(totalProperties / itemsPerPage),
        },
      });
    } catch (error) {
      console.error("Error fetching public properties:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch properties",
        error: error.message,
      });
    }
  }

  async getPublicPropertyById(req, res) {
    try {
      const { slug } = req.query;
      const { withChildren = "false" } = req.query;

      console.log("Fetching public Property with ID/slug:", slug);

      const query = {
        $or: [{ slug: slug }],
      };

      // If 'slug' is actually a valid MongoDB ObjectId, add it to the $or query
      if (mongoose.isValidObjectId(slug)) {
        query.$or.push({ _id: slug });
      }

      // Find property that is public
      const property = await Property.findOne(query);   
      if (!property) {
        return res.status(404).json({
          success: false,
          error: "Property not found or not publicly available",
        });
      }

      // If requested, include child properties that are also public
      if (withChildren === "true" && property.parentId === null) {
        const subProperties = await Property.find({
          parentId: property._id,
          isPublic: true,
        })
          .select(
            "propertyName propertyDescription price propertyType minSize maxSize sizeUnit bedrooms bathrooms carpetArea builtUpArea ownershipType landType propertyImages amenities",
          )
          .lean();

        property.subProperties = subProperties;
      }

      return res.status(200).json({
        success: true,
        data: property,
      });
    } catch (error) {
      console.error("Error fetching public Property:", error);

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
  }
}

export default PropertyService;
