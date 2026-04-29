// services/PropertyService.js
import { Service } from "@framework";
import Property from "../models/Property";
import mongoose from "mongoose";

// Helper function to extract numeric value from price string
const extractNumericPrice = (priceString) => {
  if (!priceString || priceString === 'Contact for price') return null;
  
  // Remove currency symbols, commas, and non-numeric characters except decimal point
  const numericString = priceString.replace(/[^\d.]/g, '');
  const price = parseFloat(numericString);
  
  return isNaN(price) ? null : price;
};

// Helper function to find minimum and maximum price from sub-properties
const findPriceRangeFromSubProperties = (subPropertiesData) => {
  let minPrice = null;
  let maxPrice = null;
  
  const allPrices = [];
  
  // Check residential properties
  if (subPropertiesData.residentialProperties && subPropertiesData.residentialProperties.length > 0) {
    subPropertiesData.residentialProperties.forEach(prop => {
      if (prop.price && prop.price !== 'Contact for price') {
        const price = extractNumericPrice(prop.price);
        if (price !== null) allPrices.push(price);
      }
    });
  }
  
  // Check commercial properties
  if (subPropertiesData.commercialProperties && subPropertiesData.commercialProperties.length > 0) {
    subPropertiesData.commercialProperties.forEach(prop => {
      if (prop.price && prop.price !== 'Contact for price') {
        const price = extractNumericPrice(prop.price);
        if (price !== null) allPrices.push(price);
      }
    });
  }
  
  // Check plot properties
  if (subPropertiesData.plotProperties && subPropertiesData.plotProperties.length > 0) {
    subPropertiesData.plotProperties.forEach(prop => {
      if (prop.price && prop.price !== 'Contact for price') {
        const price = extractNumericPrice(prop.price);
        if (price !== null) allPrices.push(price);
      }
    });
  }
  
  if (allPrices.length > 0) {
    minPrice = Math.min(...allPrices);
    maxPrice = Math.max(...allPrices);
  }
  
  return { minPrice, maxPrice };
};

// Format price range for display
const formatPriceRange = (minPrice, maxPrice) => {
  if (!minPrice && !maxPrice) return 'Contact for price';
  if (minPrice && !maxPrice) return `₹${minPrice.toLocaleString('en-IN')}`;
  if (!minPrice && maxPrice) return `₹${maxPrice.toLocaleString('en-IN')}`;
  if (minPrice === maxPrice) return `₹${minPrice.toLocaleString('en-IN')}`;
  return `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`;
};

const mapFileType = (fileType) => {
  if (!fileType) return '2d';
  
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('image')) return 'image';
  if (type.includes('3d') || type.includes('three')) return '3d';
  if (type.includes('structural')) return 'structural';
  return '2d'; // default
};

class PropertyService extends Service {
  constructor() {
    super();
  }

  // GET all properties with filtering and pagination
  // Helper to format property for frontend
  async formatPropertyForFrontend(property, withChildren = "false") {
    if (!property) return null;
    
    // Convert to plain object if it's a Mongoose document
    const propertyObj = property.toObject ? property.toObject() : { ...property };
    
    // Ensure propertyType is an array
    const originalType = propertyObj.propertyType;
    const propertyTypes = Array.isArray(originalType) ? originalType : [originalType];
    
    // For main projects, identify sub-types
    if (propertyObj.parentId === null) {
      if (!propertyTypes.includes("project")) {
        propertyTypes.unshift("project");
      }
      
      const subTypes = await Property.distinct("propertyType", { parentId: propertyObj._id });
      subTypes.forEach(type => {
        if (type !== "project" && !propertyTypes.includes(type)) {
          propertyTypes.push(type);
        }
      });
      
      // Categorize sub-properties if requested or available
      if (withChildren === "true" || propertyObj.subProperties) {
        let subProperties = propertyObj.subProperties;
        if (!subProperties && withChildren === "true") {
          subProperties = await Property.find({ parentId: propertyObj._id }).lean();
          propertyObj.subProperties = subProperties;
        }
        
        if (subProperties) {
          propertyObj.residentialProperties = subProperties.filter(p => p.propertyType === 'residential');
          propertyObj.commercialProperties = subProperties.filter(p => p.propertyType === 'commercial');
          propertyObj.plotProperties = subProperties.filter(p => p.propertyType === 'plot');
        }
      }
    } else {
      // For sub-properties, populate the specific array for frontend forms
      if (originalType === "residential") propertyObj.residentialProperties = [{ ...propertyObj }];
      else if (originalType === "commercial") propertyObj.commercialProperties = [{ ...propertyObj }];
      else if (originalType === "plot") propertyObj.plotProperties = [{ ...propertyObj }];
    }
    
    propertyObj.propertyType = propertyTypes;
    return propertyObj;
  }

  async getAllProperties(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = "", 
        status, 
        propertyType, 
        parentOnly = "false",
        parentId,
        includeChildren = "false",
        hierarchyView = "false",
        location,
        builderName,
        minPrice,
        maxPrice
      } = req.query;

      const currentPage = Math.max(parseInt(page), 1);
      const itemsPerPage = Math.min(parseInt(limit), 100);
      const skip = (currentPage - 1) * itemsPerPage;

      const query = {};
      
      // Filter by parentId (for getting sub-properties)
      if (parentId) {
        if (parentId === "null") {
          query.parentId = null; // Main projects only
        } else {
          query.parentId = parentId;
        }
      } else if (parentOnly === "true") {
        query.parentId = null; // Only main projects
      }
      
      // Enhanced search across multiple fields
      if (search) {
        query.$or = [
          { projectName: { $regex: search, $options: "i" } },
          { builderName: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { propertyName: { $regex: search, $options: "i" } },
          { "residentialProperties.propertyName": { $regex: search, $options: "i" } },
          { "commercialProperties.propertyName": { $regex: search, $options: "i" } },
          { "plotProperties.propertyName": { $regex: search, $options: "i" } }
        ];
      }

      // Filter by status
      if (status) {
        if (Array.isArray(status)) {
          query.status = { $in: status };
        } else {
          query.status = { $in: [status] };
        }
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
              { minPrice: { $gte: parseFloat(minPrice) } }
            ]
          });
        }
        if (maxPrice) {
          query.$and.push({
            $or: [
              { minPrice: { $lte: parseFloat(maxPrice) } },
              { maxPrice: { $lte: parseFloat(maxPrice) } }
            ]
          });
        }
        if (query.$and.length === 0) {
          delete query.$and;
        }
      }

      // For hierarchical view
      if (hierarchyView === "true") {
        const hierarchicalData = await this.getHierarchicalProperties(search, status, propertyType, location, builderName, minPrice, maxPrice);
        return res.status(200).json({
          success: true,
          data: hierarchicalData,
          view: "hierarchical"
        });
      }

      const [properties, totalProperties] = await Promise.all([
        Property.find(query)
          .skip(skip)
          .limit(itemsPerPage)
          .sort({ createdAt: -1 })
          .populate("createdBy", "name email")
          .populate("parentId", "projectName builderName location price minPrice maxPrice")
          .lean(),
        Property.countDocuments(query)
      ]);

      // Post-process properties to handle hierarchy and property types
      const formattedProperties = await Promise.all(
        properties.map(p => this.formatPropertyForFrontend(p, includeChildren))
      );

      return res.status(200).json({
        success: true,
        data: formattedProperties,
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
  }

  // Get hierarchical properties
  async getHierarchicalProperties(search = "", status, propertyType, location, builderName, minPrice, maxPrice) {
    const query = { 
      parentId: null 
    };

    // Add search filter
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: "i" } },
        { builderName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by status
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = { $in: [status] };
      }
    }

    // Filter by propertyType (only project for main projects)
    if (propertyType) {
      query.propertyType = propertyType;
    } else {
      query.propertyType = 'project';
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
            { minPrice: { $gte: parseFloat(minPrice) } }
          ]
        });
      }
      if (maxPrice) {
        query.$and.push({
          $or: [
            { minPrice: { $lte: parseFloat(maxPrice) } },
            { maxPrice: { $lte: parseFloat(maxPrice) } }
          ]
        });
      }
      if (query.$and.length === 0) {
        delete query.$and;
      }
    }

    const mainProjects = await Property.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    // Get sub-properties for each main project
    const hierarchicalData = [];
    
    for (let project of mainProjects) {
      const subProperties = await Property.find({
        parentId: project._id,
      })
      .populate("createdBy", "name email")
      .lean();

      hierarchicalData.push({
        ...project,
        subProperties: subProperties,
        subPropertyCount: subProperties.length
      });
    }

    return hierarchicalData;
  }

  // Get sub-properties for a specific parent
  async getSubProperties(req, res) {
    try {
      const { parentId } = req.query;
      const { 
        page = 1, 
        limit = 50,
        search = ""
      } = req.query;

      if (!parentId) {
        return res.status(400).json({
          success: false,
          message: "Parent ID is required"
        });
      }

      const currentPage = Math.max(parseInt(page), 1);
      const itemsPerPage = Math.min(parseInt(limit), 100);
      const skip = (currentPage - 1) * itemsPerPage;

      const query = { 
        parentId: parentId,
      };

      // Add search filter
      if (search) {
        query.$or = [
          { propertyName: { $regex: search, $options: "i" } },
          { propertyDescription: { $regex: search, $options: "i" } },
          { price: { $regex: search, $options: "i" } }
        ];
      }

      const [subProperties, totalSubProperties] = await Promise.all([
        Property.find(query)
          .skip(skip)
          .limit(itemsPerPage)
          .sort({ createdAt: -1 })
          .populate("createdBy", "name email")
          .populate("parentId", "projectName builderName location price minPrice maxPrice")
          .lean(),
        Property.countDocuments(query)
      ]);

      // Get parent project details
      const parentProject = await Property.findById(parentId)
        .populate("createdBy", "name email")
        .lean();

      return res.status(200).json({
        success: true,
        data: subProperties,
        parentProject: parentProject,
        pagination: {
          totalItems: totalSubProperties,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(totalSubProperties / itemsPerPage),
          hasNextPage: currentPage < Math.ceil(totalSubProperties / itemsPerPage),
          hasPrevPage: currentPage > 1
        }
      });

    } catch (error) {
      console.error("Get Sub Properties Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch sub-properties",
        error: error.message
      });
    }
  }

  // POST create new property
  async createProperty(req, res) {
    try {
      if (!req.isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only administrators can create properties"
        });
      }

      const { propertyType, projectName, builderName, location, description } = req.body;
      
      // Convert propertyType to array if it's a string
      let propertyTypes = [];
      if (Array.isArray(propertyType)) {
        propertyTypes = propertyType;
      } else if (typeof propertyType === 'string') {
        propertyTypes = [propertyType];
      } else {
        propertyTypes = [propertyType];
      }

      // Always check if creating multiple property types
      if (propertyTypes.length > 1 || propertyTypes.includes('project') && propertyTypes.length > 1) {
        return await this.createMultiplePropertiesFromSingle(req, res, propertyTypes);
      } else {
        return await this.createSingleProperty(req, res, propertyTypes[0]);
      }
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
  }

  // Create single property
  async createSingleProperty(req, res, propertyType) {
    const { projectName, builderName, location, description, ...otherData } = req.body;
    let finalData = { ...req.body, propertyType };

    try {
      // ✅ Extract and map nested properties data to main fields
      if (propertyType === 'residential' && otherData.residentialProperties && otherData.residentialProperties.length > 0) {
        const residentialData = otherData.residentialProperties[0];
        finalData = {
          ...finalData,
          propertyName: residentialData.propertyName,
          propertyDescription: residentialData.propertyDescription,
          // ✅ Auto-inherit price from parent if not provided
          price: residentialData.price || finalData.price || 'Contact for price',
          paymentPlan: residentialData.paymentPlan || finalData.paymentPlan,
          bedrooms: residentialData.bedrooms,
          bathrooms: residentialData.bathrooms,
          toilet: residentialData.toilet,
          balcony: residentialData.balcony,
          carpetArea: residentialData.carpetArea,
          builtUpArea: residentialData.builtUpArea,
          floors: residentialData.floors,
          minSize: residentialData.minSize,
          maxSize: residentialData.maxSize,
          sizeUnit: residentialData.sizeUnit,
          propertyImages: residentialData.propertyImages || [],
          floorPlans: residentialData.floorPlans || [],
          amenities: residentialData.amenities || finalData.amenities || []
        };
        
        // ✅ Set minPrice and maxPrice for individual properties
        const numericPrice = extractNumericPrice(finalData.price);
        if (numericPrice !== null) {
          finalData.minPrice = numericPrice;
          finalData.maxPrice = numericPrice;
        }
        
        // ✅ Remove plot/commercial specific fields for residential
        delete finalData.ownershipType;
        delete finalData.landType;
        delete finalData.approvedBy;
        delete finalData.boundaryWall;
        delete finalData.residentialProperties;
      }
      else if (propertyType === 'commercial' && otherData.commercialProperties && otherData.commercialProperties.length > 0) {
        const commercialData = otherData.commercialProperties[0];
        finalData = {
          ...finalData,
          propertyName: commercialData.propertyName,
          propertyDescription: commercialData.propertyDescription,
          // ✅ Auto-inherit price from parent if not provided
          price: commercialData.price || finalData.price || 'Contact for price',
          paymentPlan: commercialData.paymentPlan || finalData.paymentPlan,
          carpetArea: commercialData.carpetArea,
          builtUpArea: commercialData.builtUpArea,
          floors: commercialData.floors,
          minSize: commercialData.minSize,
          maxSize: commercialData.maxSize,
          sizeUnit: commercialData.sizeUnit,
          propertyImages: commercialData.propertyImages || [],
          floorPlans: commercialData.floorPlans || [],
          amenities: commercialData.amenities || finalData.amenities || []
        };
        
        // ✅ Set minPrice and maxPrice for individual properties
        const numericPrice = extractNumericPrice(finalData.price);
        if (numericPrice !== null) {
          finalData.minPrice = numericPrice;
          finalData.maxPrice = numericPrice;
        }
        
        // ✅ Remove residential/plot specific fields for commercial
        delete finalData.bedrooms;
        delete finalData.bathrooms;
        delete finalData.toilet;
        delete finalData.balcony;
        delete finalData.ownershipType;
        delete finalData.landType;
        delete finalData.approvedBy;
        delete finalData.boundaryWall;
        delete finalData.commercialProperties;
      }
      else if (propertyType === 'plot' && otherData.plotProperties && otherData.plotProperties.length > 0) {
        const plotData = otherData.plotProperties[0];
        finalData = {
          ...finalData,
          propertyName: plotData.propertyName,
          propertyDescription: plotData.propertyDescription,
          // ✅ Auto-inherit price from parent if not provided
          price: plotData.price || finalData.price || 'Contact for price',
          paymentPlan: plotData.paymentPlan || finalData.paymentPlan,
          ownershipType: plotData.ownershipType,
          landType: plotData.landType,
          approvedBy: plotData.approvedBy,
          boundaryWall: plotData.boundaryWall,
          minSize: plotData.minSize,
          maxSize: plotData.maxSize,
          sizeUnit: plotData.sizeUnit,
          propertyImages: plotData.propertyImages || [],
          floorPlans: plotData.floorPlans || [],
          amenities: plotData.amenities || finalData.amenities || []
        };
        
        // ✅ Set minPrice and maxPrice for individual properties
        const numericPrice = extractNumericPrice(finalData.price);
        if (numericPrice !== null) {
          finalData.minPrice = numericPrice;
          finalData.maxPrice = numericPrice;
        }
        
        // ✅ Remove residential/commercial specific fields for plot
        delete finalData.bedrooms;
        delete finalData.bathrooms;
        delete finalData.toilet;
        delete finalData.balcony;
        delete finalData.carpetArea;
        delete finalData.builtUpArea;
        delete finalData.plotProperties;
      }
      else if (propertyType === 'project') {
        // ✅ For project type, remove all property-specific fields
        delete finalData.propertyImages;
        delete finalData.floorPlans;
        delete finalData.bedrooms;
        delete finalData.bathrooms;
        delete finalData.toilet;
        delete finalData.balcony;
        delete finalData.carpetArea;
        delete finalData.builtUpArea;
        delete finalData.ownershipType;
        delete finalData.landType;
        delete finalData.approvedBy;
        delete finalData.boundaryWall;
        delete finalData.residentialProperties;
        delete finalData.commercialProperties;
        delete finalData.plotProperties;
        
        // Ensure project has basic property fields
        finalData.propertyName = finalData.propertyName || `${finalData.projectName} Project`;
        finalData.propertyDescription = finalData.propertyDescription || finalData.description;
      }

      // ✅ If creating residential, commercial, or plot WITHOUT parentId, auto-create main project
      if (propertyType !== 'project' && !finalData.parentId) {
        // Check if a main project already exists with same details
        const existingMainProject = await Property.findOne({
          projectName: projectName.trim(),
          builderName: builderName.trim(),
          location: location.trim(),
          propertyType: 'project',
          parentId: null
        });

        if (existingMainProject) {
          // Use existing main project as parent
          finalData.parentId = existingMainProject._id;
          
          // Auto-inherit price from existing parent project for sub-properties
          if ((!finalData.price || finalData.price === 'Contact for price') && existingMainProject.price && existingMainProject.price !== 'Contact for price') {
            finalData.price = existingMainProject.price;
          }
          
          // ✅ Update existing main project's price range
          await this.updateMainProjectPriceRange(existingMainProject._id);
          
        } else {
          // Generate unique slug for main project
          const slug = await Property.generateUniqueSlug(projectName.trim(), builderName.trim());
          
          // Create a new main project first with current property's price
          const numericPrice = extractNumericPrice(finalData.price);
          const mainProjectPrice = numericPrice !== null ? `₹${numericPrice.toLocaleString('en-IN')}` : 'Contact for price';
          
          const mainProjectData = {
            projectName: projectName.trim(),
            builderName: builderName.trim(),
            location: location.trim(),
            description: description || `Main project for ${projectName}`,
            propertyType: 'project',
            propertyName: `${projectName.trim()} Project`,
            price: mainProjectPrice,
            minPrice: numericPrice,
            maxPrice: numericPrice,
            paymentPlan: finalData.paymentPlan || 'Flexible',
            status: finalData.status || ['Under Construction'],
            amenities: finalData.amenities || [],
            nearby: finalData.nearby || [],
            projectHighlights: finalData.projectHighlights || [],
            mapLocation: finalData.mapLocation || { lat: 0, lng: 0 },
            images: finalData.images || [],
            brochureUrls: finalData.brochureUrls || [],
            creatives: finalData.creatives || [],
            videos: finalData.videos || [],
            createdBy: req.employee._id,
            parentId: null,
            hierarchyLevel: 0,
            slug: slug
          };

          const mainProject = new Property(mainProjectData);
          await mainProject.save();
          
          // Use the new main project as parent
          finalData.parentId = mainProject._id;
        }
      }

      // ✅ Validate parentId if provided AND auto-inherit price from parent
      if (finalData.parentId) {
        const parentProperty = await Property.findOne({
          _id: finalData.parentId,
        });
        
        if (!parentProperty) {
          return res.status(400).json({
            success: false,
            message: "Parent property not found"
          });
        }

        // Ensure parent is a main project
        if (parentProperty.propertyType !== 'project') {
          return res.status(400).json({
            success: false,
            message: "Sub-properties can only be created under main projects"
          });
        }

        // Auto-inherit price from parent project if not explicitly set
        if ((!finalData.price || finalData.price === 'Contact for price') && parentProperty.price && parentProperty.price !== 'Contact for price') {
          finalData.price = parentProperty.price;
        }
      }

      // Generate slug only for main projects (not sub-properties)
      if (!finalData.parentId) {
        const slug = await Property.generateUniqueSlug(projectName.trim(), builderName.trim());
        finalData.slug = slug;
      } else {
        // Sub-properties don't get slugs
        finalData.slug = undefined;
      }

      // ✅ Create the property with cleaned data
      const newProperty = new Property({
        ...finalData,
        floorPlans: finalData.floorPlans ? finalData.floorPlans.map(plan => ({
          ...plan,
          type: mapFileType(plan.type)
        })) : [],
        createdBy: req.employee._id,
        hierarchyLevel: finalData.parentId ? 1 : 0
      });

      await newProperty.save();
      
      // ✅ If this is a sub-property, update the main project's price range
      if (finalData.parentId) {
        try {
          await Property.updateParentPriceRange(finalData.parentId);
        } catch (parentUpdateError) {
          console.error("Failed to update parent price range:", parentUpdateError);
        }
      }
      
      // ✅ Populate createdBy and parent details for response
      await newProperty.populate("createdBy", "name email");
      if (newProperty.parentId) {
        await newProperty.populate("parentId", "projectName builderName location price minPrice maxPrice");
      }

      // Format response for frontend
      const formattedProperty = await this.formatPropertyForFrontend(newProperty);

      return res.status(201).json({
        success: true,
        data: formattedProperty,
        message: finalData.parentId 
          ? `${propertyType} property created successfully under main project` 
          : "Main project created successfully"
      });

    } catch (error) {
      console.error("Error in createSingleProperty:", error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: errors
        });
      }
      
      if (error.code === 11000) {
        if (error.keyPattern && error.keyPattern.slug) {
          return res.status(400).json({
            success: false,
            message: "A property with similar name already exists. Please try a different project name or builder name."
          });
        }
        return res.status(400).json({
          success: false,
          message: "Property with similar details already exists"
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error creating property: " + error.message
      });
    }
  }

  // Create multiple properties from single request
  async createMultiplePropertiesFromSingle(req, res, propertyTypes) {
    const { projectName, builderName, location, description, ...otherData } = req.body;
    
    try {
      // Calculate price range from all sub-properties
      const priceRange = findPriceRangeFromSubProperties(otherData);
      const mainProjectPrice = formatPriceRange(priceRange.minPrice, priceRange.maxPrice);

      // Generate unique slug for main project
      const slug = await Property.generateUniqueSlug(projectName.trim(), builderName.trim());

      // Create main project first with price range from sub-properties
      const mainProjectData = {
        projectName: projectName.trim(),
        builderName: builderName.trim(),
        location: location.trim(),
        description: description || `Main project for ${projectName}`,
        propertyType: 'project',
        propertyName: `${projectName.trim()} Project`,
        price: mainProjectPrice,
        minPrice: priceRange.minPrice,
        maxPrice: priceRange.maxPrice,
        paymentPlan: otherData.paymentPlan || 'Flexible',
        status: otherData.status || ['Under Construction'],
        amenities: otherData.amenities || [],
        nearby: otherData.nearby || [],
        projectHighlights: otherData.projectHighlights || [],
        mapLocation: otherData.mapLocation || { lat: 0, lng: 0 },
        images: otherData.images || [],
        brochureUrls: otherData.brochureUrls || [],
        creatives: otherData.creatives || [],
        videos: otherData.videos || [],
        createdBy: req.employee._id,
        parentId: null,
        hierarchyLevel: 0,
        slug: slug
      };

      const mainProject = new Property(mainProjectData);
      await mainProject.save();

      // Create sub-properties for each selected type
      const createdSubProperties = [];
      const filteredTypes = propertyTypes.filter(type => type !== 'project');

      // Create properties for EACH selected type
      for (const subType of filteredTypes) {
        // Get the specific property data for this type
        let subPropertyData = {};
        let subPropertyPrice = 'Contact for price';

        // Check if data exists for this property type
        if (subType === 'residential') {
          if (otherData.residentialProperties && otherData.residentialProperties.length > 0) {
            // Take first residential property from array
            const residentialData = otherData.residentialProperties[0];
            subPropertyData = {
              propertyName: residentialData.propertyName || `${projectName} - Residential`,
              propertyDescription: residentialData.propertyDescription || `${projectName} Residential Property`,
              price: residentialData.price || mainProjectPrice,
              paymentPlan: residentialData.paymentPlan || otherData.paymentPlan,
              bedrooms: residentialData.bedrooms || 2,
              bathrooms: residentialData.bathrooms || 2,
              toilet: residentialData.toilet || 1,
              balcony: residentialData.balcony || 1,
              carpetArea: residentialData.carpetArea || '1000',
              builtUpArea: residentialData.builtUpArea || '1200',
              floors: residentialData.floors,
              minSize: residentialData.minSize || '1000',
              maxSize: residentialData.maxSize || '2000',
              sizeUnit: residentialData.sizeUnit || 'sq.ft.',
              amenities: residentialData.amenities || otherData.amenities || [],
              propertyImages: residentialData.propertyImages || [],
              floorPlans: residentialData.floorPlans || []
            };
          } else {
            // Create default residential property
            subPropertyData = {
              propertyName: `${projectName} - Residential`,
              propertyDescription: `${projectName} Residential Property`,
              price: mainProjectPrice,
              paymentPlan: otherData.paymentPlan || 'Flexible',
              bedrooms: 2,
              bathrooms: 2,
              toilet: 1,
              balcony: 1,
              carpetArea: '1000',
              builtUpArea: '1200',
              floors: undefined,
              minSize: '1000',
              maxSize: '2000',
              sizeUnit: 'sq.ft.',
              amenities: otherData.amenities || [],
              propertyImages: [],
              floorPlans: []
            };
          }
        } 
        else if (subType === 'commercial') {
          if (otherData.commercialProperties && otherData.commercialProperties.length > 0) {
            // Take first commercial property from array
            const commercialData = otherData.commercialProperties[0];
            subPropertyData = {
              propertyName: commercialData.propertyName || `${projectName} - Commercial`,
              propertyDescription: commercialData.propertyDescription || `${projectName} Commercial Property`,
              price: commercialData.price || mainProjectPrice,
              paymentPlan: commercialData.paymentPlan || otherData.paymentPlan,
              carpetArea: commercialData.carpetArea || '2000',
              builtUpArea: commercialData.builtUpArea || '2500',
              floors: commercialData.floors,
              minSize: commercialData.minSize || '1000',
              maxSize: commercialData.maxSize || '5000',
              sizeUnit: commercialData.sizeUnit || 'sq.ft.',
              amenities: commercialData.amenities || otherData.amenities || [],
              propertyImages: commercialData.propertyImages || [],
              floorPlans: commercialData.floorPlans || []
            };
          } else {
            // Create default commercial property
            subPropertyData = {
              propertyName: `${projectName} - Commercial`,
              propertyDescription: `${projectName} Commercial Property`,
              price: mainProjectPrice,
              paymentPlan: otherData.paymentPlan || 'Flexible',
              carpetArea: '2000',
              builtUpArea: '2500',
              floors: undefined,
              minSize: '1000',
              maxSize: '5000',
              sizeUnit: 'sq.ft.',
              amenities: otherData.amenities || [],
              propertyImages: [],
              floorPlans: []
            };
          }
        } 
        else if (subType === 'plot') {
          if (otherData.plotProperties && otherData.plotProperties.length > 0) {
            // Take first plot from array
            const plotData = otherData.plotProperties[0];
            subPropertyData = {
              propertyName: plotData.propertyName || `${projectName} - Plot`,
              propertyDescription: plotData.propertyDescription || `${projectName} Plot Property`,
              price: plotData.price || mainProjectPrice,
              paymentPlan: plotData.paymentPlan || otherData.paymentPlan,
              ownershipType: plotData.ownershipType || 'Freehold',
              landType: plotData.landType || 'Residential Plot',
              approvedBy: plotData.approvedBy || '',
              boundaryWall: plotData.boundaryWall || false,
              minSize: plotData.minSize || '1000',
              maxSize: plotData.maxSize || '5000',
              sizeUnit: plotData.sizeUnit || 'sq.ft.',
              amenities: plotData.amenities || otherData.amenities || [],
              propertyImages: plotData.propertyImages || [],
              floorPlans: plotData.floorPlans || []
            };
          } else {
            // Create default plot
            subPropertyData = {
              propertyName: `${projectName} - Plot`,
              propertyDescription: `${projectName} Plot Property`,
              price: mainProjectPrice,
              paymentPlan: otherData.paymentPlan || 'Flexible',
              ownershipType: 'Freehold',
              landType: 'Residential Plot',
              approvedBy: '',
              boundaryWall: false,
              minSize: '1000',
              maxSize: '5000',
              sizeUnit: 'sq.ft.',
              amenities: otherData.amenities || [],
              propertyImages: [],
              floorPlans: []
            };
          }
        }

        const numericPrice = extractNumericPrice(subPropertyData.price);

        const propertyData = {
          projectName: projectName.trim(),
          builderName: builderName.trim(),
          location: location.trim(),
          description: description || `${subType} property in ${projectName}`,
          propertyType: subType,
          propertyName: subPropertyData.propertyName,
          price: subPropertyData.price,
          minPrice: numericPrice,
          maxPrice: numericPrice,
          paymentPlan: subPropertyData.paymentPlan,
          status: otherData.status || ['Under Construction'],
          amenities: subPropertyData.amenities,
          nearby: otherData.nearby || [],
          projectHighlights: otherData.projectHighlights || [],
          mapLocation: otherData.mapLocation || { lat: 0, lng: 0 },
          images: otherData.images || [],
          brochureUrls: otherData.brochureUrls || [],
          createdBy: req.employee._id,
          parentId: mainProject._id,
          hierarchyLevel: 1,
          // Add type-specific fields
          ...(subType === 'residential' && {
            bedrooms: subPropertyData.bedrooms,
            bathrooms: subPropertyData.bathrooms,
            toilet: subPropertyData.toilet,
            balcony: subPropertyData.balcony,
            carpetArea: subPropertyData.carpetArea,
            builtUpArea: subPropertyData.builtUpArea,
            floors: subPropertyData.floors,
            minSize: subPropertyData.minSize,
            maxSize: subPropertyData.maxSize,
            sizeUnit: subPropertyData.sizeUnit,
            propertyImages: subPropertyData.propertyImages,
            floorPlans: subPropertyData.floorPlans ? subPropertyData.floorPlans.map(plan => ({
              ...plan,
              type: mapFileType(plan.type)
            })) : []
          }),
          ...(subType === 'commercial' && {
            carpetArea: subPropertyData.carpetArea,
            builtUpArea: subPropertyData.builtUpArea,
            floors: subPropertyData.floors,
            minSize: subPropertyData.minSize,
            maxSize: subPropertyData.maxSize,
            sizeUnit: subPropertyData.sizeUnit,
            propertyImages: subPropertyData.propertyImages,
            floorPlans: subPropertyData.floorPlans ? subPropertyData.floorPlans.map(plan => ({
              ...plan,
              type: mapFileType(plan.type)
            })) : []
          }),
          ...(subType === 'plot' && {
            ownershipType: subPropertyData.ownershipType,
            landType: subPropertyData.landType,
            approvedBy: subPropertyData.approvedBy,
            boundaryWall: subPropertyData.boundaryWall,
            minSize: subPropertyData.minSize,
            maxSize: subPropertyData.maxSize,
            sizeUnit: subPropertyData.sizeUnit,
            propertyImages: subPropertyData.propertyImages,
            floorPlans: subPropertyData.floorPlans ? subPropertyData.floorPlans.map(plan => ({
              ...plan,
              type: mapFileType(plan.type)
            })) : []
          })
        };

        const subProperty = new Property(propertyData);
        await subProperty.save();
        await subProperty.populate("parentId", "projectName builderName location price minPrice maxPrice");
        createdSubProperties.push(subProperty);
      }

      // Format response
      const formattedProject = await this.formatPropertyForFrontend(mainProject, "true");

      return res.status(201).json({
        success: true,
        data: {
          mainProject: formattedProject,
          subProperties: formattedProject.subProperties
        },
        message: `Main project created with ${createdSubProperties.length} sub-properties: ${filteredTypes.join(', ')}`
      });

    } catch (error) {
      console.error("Error in createMultiplePropertiesFromSingle:", error);
      
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
        message: "Error creating properties: " + error.message
      });
    }
  }

  // Update main project based on sub-properties
  async updateMainProjectPriceRange(mainProjectId) {
    try {
      const subProperties = await Property.find({
        parentId: mainProjectId,
      });
      
      const validPrices = subProperties
        .map(prop => extractNumericPrice(prop.price))
        .filter(price => price !== null);
      
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        const maxPrice = Math.max(...validPrices);
        const priceRange = formatPriceRange(minPrice, maxPrice);
        
        await Property.findByIdAndUpdate(mainProjectId, {
          price: priceRange,
          minPrice: minPrice,
          maxPrice: maxPrice
        });
      }
    } catch (error) {
      console.error("Error updating main project price range:", error);
    }
  }

  // GET property by ID
  async getPropertyById(req, res) {
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

      // Ensure propertyType is an array for frontend compatibility
      const propertyTypes = Array.isArray(property.propertyType)
        ? property.propertyType
        : [property.propertyType];

      // Add project type to list if it's a main project and not already there
      if (property.parentId === null && !propertyTypes.includes("project")) {
        propertyTypes.unshift("project");
      }

      // Populate nested property arrays for frontend forms
      if (property.propertyType === "residential") {
        property.residentialProperties = [ { ...property } ];
      } else if (property.propertyType === "commercial") {
        property.commercialProperties = [ { ...property } ];
      } else if (property.propertyType === "plot") {
        property.plotProperties = [ { ...property } ];
      }

      // If it's a main project, always identify what types of sub-properties it has
      // to ensure the frontend selector shows them as selected
      if (property.parentId === null) {
        const subTypes = await Property.distinct("propertyType", { parentId: property._id });
        subTypes.forEach(type => {
          if (!propertyTypes.includes(type)) {
            propertyTypes.push(type);
          }
        });
      }

      // If requested, include full child properties and categorize them
      if (withChildren === "true" && property.parentId === null) {
        const subProperties = await Property.find({
          parentId: property._id,
        })
          .populate("createdBy", "name email")
          .lean();

        property.subProperties = subProperties;

        // Also categorize sub-properties by type for unified forms
        property.residentialProperties = subProperties.filter(p => p.propertyType === 'residential');
        property.commercialProperties = subProperties.filter(p => p.propertyType === 'commercial');
        property.plotProperties = subProperties.filter(p => p.propertyType === 'plot');

        // Add child types to propertyTypes array
        subProperties.forEach(p => {
          if (!propertyTypes.includes(p.propertyType)) {
            propertyTypes.push(p.propertyType);
          }
        });
      }

      // Format response
      const formattedProperty = await this.formatPropertyForFrontend(property, withChildren);

      return res.status(200).json({
        success: true,
        data: formattedProperty,
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
  }

  // PATCH update property
  async updateProperty(req, res) {
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

      // Helper for formatting media assets
      const formatMediaArray = (arr) => {
        if (!arr || !Array.isArray(arr)) return undefined;
        return arr.map(item => {
          const itemData = {
            url: item.url || (typeof item === 'string' ? item : ''),
            title: item.title || '',
            description: item.description || '',
            isPrimary: item.isPrimary || false,
            uploadedAt: item.uploadedAt || new Date().toISOString()
          };
          return itemData.url ? itemData : null;
        }).filter(item => item !== null);
      };

      // Check if price is being updated
      const isPriceChanging = req.body.price !== undefined && 
                             req.body.price !== existingProperty.price;

      // Create a copy of request body to modify
      const updateData = { ...req.body };

      // Handle propertyType - convert array to string if needed
      if (updateData.propertyType) {
        if (Array.isArray(updateData.propertyType)) {
          // Take the first item if it's an array
          if (updateData.propertyType.length > 0) {
            updateData.propertyType = updateData.propertyType[0];
          } else {
            // If array is empty, keep existing value
            delete updateData.propertyType;
          }
        }
        
        // Ensure it's a valid enum value if it still exists in updateData
        if (updateData.propertyType) {
          const validTypes = ["project", "residential", "commercial", "plot"];
          if (!validTypes.includes(updateData.propertyType)) {
            return res.status(400).json({
              success: false,
              message: `Invalid property type. Must be one of: ${validTypes.join(', ')}`
            });
          }
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
      } else if (existingProperty.parentId) {
        // Sub-properties shouldn't have slugs
        updateData.slug = undefined;
      }

      // Prevent changing parentId for main projects with children (cannot turn project with children into a sub-property)
      if (updateData.parentId && updateData.parentId !== null) {
        if (existingProperty && existingProperty.parentId === null) {
          const childCount = await Property.countDocuments({ parentId: existingProperty._id });
          if (childCount > 0) {
            return res.status(400).json({
              success: false,
              message: "Cannot assign a parent to a main project that already has sub-properties",
            });
          }
        }
      }

      // Safety check: Prevent self-referencing parentId
      if (updateData.parentId && updateData.parentId.toString() === existingProperty._id.toString()) {
        updateData.parentId = null;
      }

      // Handle sub-property updates if this is a main project and sub-properties were provided in req.body
      if (existingProperty.parentId === null) {
        const subPropArrays = [
          { key: 'residentialProperties', type: 'residential' },
          { key: 'commercialProperties', type: 'commercial' },
          { key: 'plotProperties', type: 'plot' }
        ];

        for (const { key, type } of subPropArrays) {
          if (req.body[key] && Array.isArray(req.body[key])) {
            for (const subData of req.body[key]) {
              // Safety: don't process if it's the main project itself
              if (subData._id && subData._id.toString() === existingProperty._id.toString()) continue;

              if (subData._id && mongoose.Types.ObjectId.isValid(subData._id)) {
                // Update existing sub-property
                const { _id, createdAt, updatedAt, __v, ...updateFields } = subData;
                // Ensure sub-property keeps its parent
                updateFields.parentId = existingProperty._id;
                
                // Format media arrays if they exist in updateFields
                if (updateFields.propertyImages) updateFields.propertyImages = formatMediaArray(updateFields.propertyImages);
                if (updateFields.floorPlans) updateFields.floorPlans = formatMediaArray(updateFields.floorPlans);
                
                await Property.findByIdAndUpdate(_id, { $set: updateFields });
              } else if (subData.propertyName || subData.price) {
                // Create new sub-property
                const newSub = new Property({
                  ...subData,
                  parentId: existingProperty._id,
                  propertyType: type,
                  projectName: updateData.projectName || existingProperty.projectName,
                  builderName: updateData.builderName || existingProperty.builderName,
                  location: updateData.location || existingProperty.location,
                  paymentPlan: subData.paymentPlan || updateData.paymentPlan || existingProperty.paymentPlan,
                  createdBy: req.employee?._id || req.user?._id || existingProperty.createdBy,
                  hierarchyLevel: 1,
                  propertyImages: formatMediaArray(subData.propertyImages),
                  floorPlans: formatMediaArray(subData.floorPlans)
                });
                await newSub.save();
              }
            }
          }
        }
      }

      // Also need to handle propertyImages, floorPlans, etc. appropriately
      if (updateData.propertyImages) updateData.propertyImages = formatMediaArray(updateData.propertyImages);
      if (updateData.floorPlans) updateData.floorPlans = formatMediaArray(updateData.floorPlans);
      if (updateData.images) updateData.images = formatMediaArray(updateData.images);
      if (updateData.creatives) updateData.creatives = formatMediaArray(updateData.creatives);
      if (updateData.videos) updateData.videos = formatMediaArray(updateData.videos);

      // Final cleanup of updateData to ensure no arrays that might interfere with root update
      delete updateData.residentialProperties;
      delete updateData.commercialProperties;
      delete updateData.plotProperties;

      const updatedProperty = await Property.findByIdAndUpdate(
        existingProperty._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      // ✅ Update price range and sub-property prices
      if (existingProperty.parentId === null) {
        await Property.updateParentPriceRange(existingProperty._id);
        
        if (updateData.price) {
          const subProperties = await Property.find({ parentId: existingProperty._id });
          for (const subProp of subProperties) {
            if (!subProp.price || subProp.price === 'Contact for price') {
              await Property.findByIdAndUpdate(subProp._id, { $set: { price: updateData.price } });
            }
          }
        }
      } else {
        // If this is a sub-property AND its price changed, update parent's price range
        if (isPriceChanging) {
          try {
            await Property.updateParentPriceRange(updatedProperty.parentId);
          } catch (parentUpdateError) {
            console.error("Failed to update parent price range:", parentUpdateError);
          }
        }
      }

      // Format response
      const finalProperty = await this.formatPropertyForFrontend(updatedProperty, "true");

      return res.status(200).json({
        success: true,
        data: finalProperty,
        message: "Property updated successfully",
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
  }

  // DELETE property
  async deleteProperty(req, res) {
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

      // Store parent ID before deletion
      const parentId = property.parentId;

      // If main project, also delete all sub-properties
      if (property.parentId === null) {
        await Property.deleteMany({ parentId: property._id });
      }

      // HARD DELETE - permanently remove the property
      await Property.deleteOne({ _id: property._id });

      // ✅ Update parent price range if sub-property was deleted
      if (parentId) {
        try {
          await Property.updateParentPriceRange(parentId);
        } catch (parentUpdateError) {
          console.error("Failed to update parent price range after deletion:", parentUpdateError);
        }
      }

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
  }

  // GET all properties for public website
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
            "projectName builderName description location price sizeUnit minSize maxSize minPrice maxPrice propertyType images slug status amenities nearby projectHighlights mapLocation isFeatured createdAt",
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

  // GET single public property by slug or ID
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

  // GET public sub-properties for a specific parent
  async getPublicSubProperties(req, res) {
    try {
      const { parentId } = req.query;
      const { page = 1, limit = 50, search = "" } = req.query;

      console.log("Fetching public Sub Properties for Parent ID:", parentId);

      if (!parentId) {
        return res.status(400).json({
          success: false,
          message: "Parent ID is required",
        });
      }

      const currentPage = Math.max(parseInt(page), 1);
      const itemsPerPage = Math.min(parseInt(limit), 100);
      const skip = (currentPage - 1) * itemsPerPage;

      const query = {
        parentId: parentId,
      };

      // Add search filter
      if (search) {
        query.$or = [
          { propertyName: { $regex: search, $options: "i" } },
          { propertyDescription: { $regex: search, $options: "i" } },
          { price: { $regex: search, $options: "i" } },
        ];
      }

      const [subProperties, totalSubProperties] = await Promise.all([
        Property.find(query)
          .skip(skip)
          .limit(itemsPerPage)
          .sort({ createdAt: -1 })
          .populate("createdBy", "name email")
          .populate(
            "parentId",
            "projectName builderName location price minPrice maxPrice",
          )
          .lean(),
        Property.countDocuments(query),
      ]);

      // Get parent project details
      const parentProject = await Property.findById(parentId)
        .populate("createdBy", "name email")
        .lean();

      return res.status(200).json({
        success: true,
        data: subProperties,
        parentProject: parentProject,
        pagination: {
          totalItems: totalSubProperties,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(totalSubProperties / itemsPerPage),
          hasNextPage:
            currentPage < Math.ceil(totalSubProperties / itemsPerPage),
          hasPrevPage: currentPage > 1,
        },
      });
    } catch (error) {
      console.error("Get Sub Properties Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch sub-properties",
        error: error.message,
      });
    }
  }
}

export default PropertyService;