// pages/api/v0/property/index.js
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import * as cookie from "cookie";
import { userAuth } from "@/middlewares/auth";

const mapFileType = (fileType) => {
  if (!fileType) return '2d';
  
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('image')) return 'image';
  if (type.includes('3d') || type.includes('three')) return '3d';
  if (type.includes('structural')) return 'structural';
  return '2d'; // default
};

// Helper function to extract numeric value from price string
const extractNumericPrice = (priceString) => {
  if (!priceString || priceString === 'Contact for price') return Infinity;
  
  // Remove currency symbols, commas, and non-numeric characters except decimal point
  const numericString = priceString.replace(/[^\d.]/g, '');
  const price = parseFloat(numericString);
  
  return isNaN(price) ? Infinity : price;
};

// Helper function to find minimum price from sub-properties
const findMinimumPriceFromSubProperties = (subPropertiesData) => {
  let minPrice = Infinity;
  
  // Check residential properties
  if (subPropertiesData.residentialProperties && subPropertiesData.residentialProperties.length > 0) {
    subPropertiesData.residentialProperties.forEach(prop => {
      if (prop.price && prop.price !== 'Contact for price') {
        const price = extractNumericPrice(prop.price);
        if (price < minPrice) minPrice = price;
      }
    });
  }
  
  // Check commercial properties
  if (subPropertiesData.commercialProperties && subPropertiesData.commercialProperties.length > 0) {
    subPropertiesData.commercialProperties.forEach(prop => {
      if (prop.price && prop.price !== 'Contact for price') {
        const price = extractNumericPrice(prop.price);
        if (price < minPrice) minPrice = price;
      }
    });
  }
  
  // Check plot properties
  if (subPropertiesData.plotProperties && subPropertiesData.plotProperties.length > 0) {
    subPropertiesData.plotProperties.forEach(prop => {
      if (prop.price && prop.price !== 'Contact for price') {
        const price = extractNumericPrice(prop.price);
        if (price < minPrice) minPrice = price;
      }
    });
  }
  
  return minPrice !== Infinity ? minPrice : null;
};

// Format price for display
const formatPrice = (price) => {
  if (!price || price === Infinity) return 'Contact for price';
  return `₹${price.toLocaleString('en-IN')}`;
};

// Create a new property with automatic hierarchy management
const createProperty = async (req, res) => {
  try {
    if (!req.isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can create properties"
      });
    }

    const { propertyType, projectName, builderName, location, description } = req.body;
    
    // If creating multiple property types at once
    if (Array.isArray(propertyType) && propertyType.length > 1) {
      return await createMultipleProperties(req, res);
    } else {
      return await createSingleProperty(req, res);
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
};

// Create single property
// const createSingleProperty = async (req, res) => {
//   const { propertyType, projectName, builderName, location, description, ...otherData } = req.body;
//   let finalData = { ...req.body };

//   try {
//     // Convert propertyType to string if it's an array with one element
//     if (Array.isArray(propertyType)) {
//       finalData.propertyType = propertyType[0];
//     }

//     // ✅ Extract and map nested properties data to main fields
//     if (finalData.propertyType === 'residential' && finalData.residentialProperties && finalData.residentialProperties.length > 0) {
//       const residentialData = finalData.residentialProperties[0];
//       finalData = {
//         ...finalData,
//         propertyName: residentialData.propertyName,
//         propertyDescription: residentialData.propertyDescription,
//         // ✅ Auto-inherit price from parent if not provided
//         price: residentialData.price || finalData.price || 'Contact for price',
//         paymentPlan: residentialData.paymentPlan || finalData.paymentPlan,
//         bedrooms: residentialData.bedrooms,
//         bathrooms: residentialData.bathrooms,
//         toilet: residentialData.toilet,
//         balcony: residentialData.balcony,
//         carpetArea: residentialData.carpetArea,
//         builtUpArea: residentialData.builtUpArea,
//         minSize: residentialData.minSize,
//         maxSize: residentialData.maxSize,
//         sizeUnit: residentialData.sizeUnit,
//         propertyImages: residentialData.propertyImages || [],
//         floorPlans: residentialData.floorPlans || [],
//         amenities: residentialData.amenities || finalData.amenities || []
//       };
      
//       // ✅ Remove plot/commercial specific fields for residential
//       delete finalData.ownershipType;
//       delete finalData.landType;
//       delete finalData.approvedBy;
//       delete finalData.boundaryWall;
//       delete finalData.residentialProperties;
//     }
//     else if (finalData.propertyType === 'commercial' && finalData.commercialProperties && finalData.commercialProperties.length > 0) {
//       const commercialData = finalData.commercialProperties[0];
//       finalData = {
//         ...finalData,
//         propertyName: commercialData.propertyName,
//         propertyDescription: commercialData.propertyDescription,
//         // ✅ Auto-inherit price from parent if not provided
//         price: commercialData.price || finalData.price || 'Contact for price',
//         paymentPlan: commercialData.paymentPlan || finalData.paymentPlan,
//         carpetArea: commercialData.carpetArea,
//         builtUpArea: commercialData.builtUpArea,
//         minSize: commercialData.minSize,
//         maxSize: commercialData.maxSize,
//         sizeUnit: commercialData.sizeUnit,
//         propertyImages: commercialData.propertyImages || [],
//         floorPlans: commercialData.floorPlans || [],
//         amenities: commercialData.amenities || finalData.amenities || []
//       };
      
//       // ✅ Remove residential/plot specific fields for commercial
//       delete finalData.bedrooms;
//       delete finalData.bathrooms;
//       delete finalData.toilet;
//       delete finalData.balcony;
//       delete finalData.ownershipType;
//       delete finalData.landType;
//       delete finalData.approvedBy;
//       delete finalData.boundaryWall;
//       delete finalData.commercialProperties;
//     }
//     else if (finalData.propertyType === 'plot' && finalData.plotProperties && finalData.plotProperties.length > 0) {
//       const plotData = finalData.plotProperties[0];
//       finalData = {
//         ...finalData,
//         propertyName: plotData.propertyName,
//         propertyDescription: plotData.propertyDescription,
//         // ✅ Auto-inherit price from parent if not provided
//         price: plotData.price || finalData.price || 'Contact for price',
//         paymentPlan: plotData.paymentPlan || finalData.paymentPlan,
//         ownershipType: plotData.ownershipType,
//         landType: plotData.landType,
//         approvedBy: plotData.approvedBy,
//         boundaryWall: plotData.boundaryWall,
//         minSize: plotData.minSize,
//         maxSize: plotData.maxSize,
//         sizeUnit: plotData.sizeUnit,
//         propertyImages: plotData.propertyImages || [],
//         floorPlans: plotData.floorPlans || [],
//         amenities: plotData.amenities || finalData.amenities || []
//       };
      
//       // ✅ Remove residential/commercial specific fields for plot
//       delete finalData.bedrooms;
//       delete finalData.bathrooms;
//       delete finalData.toilet;
//       delete finalData.balcony;
//       delete finalData.carpetArea;
//       delete finalData.builtUpArea;
//       delete finalData.plotProperties;
//     }
//     else if (finalData.propertyType === 'project') {
//       // ✅ For project type, remove all property-specific fields
//       delete finalData.propertyImages;
//       delete finalData.floorPlans;
//       delete finalData.bedrooms;
//       delete finalData.bathrooms;
//       delete finalData.toilet;
//       delete finalData.balcony;
//       delete finalData.carpetArea;
//       delete finalData.builtUpArea;
//       delete finalData.ownershipType;
//       delete finalData.landType;
//       delete finalData.approvedBy;
//       delete finalData.boundaryWall;
//       delete finalData.residentialProperties;
//       delete finalData.commercialProperties;
//       delete finalData.plotProperties;
      
//       // Ensure project has basic property fields
//       finalData.propertyName = finalData.propertyName || `${finalData.projectName} Project`;
//       finalData.propertyDescription = finalData.propertyDescription || finalData.description;
//     }

//     // ✅ If creating residential, commercial, or plot WITHOUT parentId, auto-create main project
//     if (finalData.propertyType !== 'project' && !finalData.parentId) {
//       // Check if a main project already exists with same details
//       const existingMainProject = await Property.findOne({
//         projectName: projectName.trim(),
//         builderName: builderName.trim(),
//         location: location.trim(),
//         propertyType: 'project',
//         isActive: true,
//         parentId: null
//       });

//       if (existingMainProject) {
//         // Use existing main project as parent
//         finalData.parentId = existingMainProject._id;
        
//         // ✅ NEW: Auto-inherit price from existing parent project for sub-properties
//         if ((!finalData.price || finalData.price === 'Contact for price') && existingMainProject.price && existingMainProject.price !== 'Contact for price') {
//           finalData.price = existingMainProject.price;
//           console.log(`Auto-inherited price from existing parent: ${existingMainProject.price}`);
//         }
//       } else {
//         // Create a new main project first
//         const mainProjectData = {
//           projectName: projectName.trim(),
//           builderName: builderName.trim(),
//           location: location.trim(),
//           description: description || `Main project for ${projectName}`,
//           propertyType: 'project',
//           propertyName: `${projectName.trim()} Project`,
//           price: finalData.price || 'Contact for price', // Use provided price
//           paymentPlan: finalData.paymentPlan || 'Flexible',
//           status: finalData.status || ['Under Construction'],
//           amenities: finalData.amenities || [],
//           nearby: finalData.nearby || [],
//           projectHighlights: finalData.projectHighlights || [],
//           mapLocation: finalData.mapLocation || { lat: 0, lng: 0 },
//           images: finalData.images || [],
//           brochureUrls: finalData.brochureUrls || [],
//           creatives: finalData.creatives || [],
//           videos: finalData.videos || [],
//           createdBy: req.employee._id,
//           parentId: null,
//           hierarchyLevel: 0
//         };

//         const mainProject = new Property(mainProjectData);
//         await mainProject.save();
        
//         // Use the new main project as parent
//         finalData.parentId = mainProject._id;
        
//         console.log(`Auto-created main project: ${mainProject._id}`);
//       }
//     }

//     // ✅ Validate parentId if provided AND auto-inherit price from parent
//     if (finalData.parentId) {
//       const parentProperty = await Property.findOne({
//         _id: finalData.parentId,
//         isActive: true
//       });
      
//       if (!parentProperty) {
//         return res.status(400).json({
//           success: false,
//           message: "Parent property not found or inactive"
//         });
//       }

//       // Ensure parent is a main project
//       if (parentProperty.propertyType !== 'project') {
//         return res.status(400).json({
//           success: false,
//           message: "Sub-properties can only be created under main projects"
//         });
//       }

//       // ✅ NEW: Auto-inherit price from parent project if not explicitly set
//       if ((!finalData.price || finalData.price === 'Contact for price') && parentProperty.price && parentProperty.price !== 'Contact for price') {
//         finalData.price = parentProperty.price;
//         console.log(`Auto-inherited price from parent project: ${parentProperty.price}`);
//       }
//     }

//     // ✅ Create the property with cleaned data
//     const newProperty = new Property({
//       ...finalData,
//       floorPlans: finalData.floorPlans ? finalData.floorPlans.map(plan => ({
//         ...plan,
//         type: mapFileType(plan.type)
//       })) : [],
//       createdBy: req.employee._id,
//       hierarchyLevel: finalData.parentId ? 1 : 0
//     });

//     await newProperty.save();
    
//     // ✅ Populate createdBy and parent details for response
//     await newProperty.populate("createdBy", "name email");
//     if (newProperty.parentId) {
//       await newProperty.populate("parentId", "projectName builderName location price");
//     }

//     return res.status(201).json({
//       success: true,
//       data: newProperty,
//       message: finalData.parentId 
//         ? `${finalData.propertyType} property created successfully under main project` 
//         : "Main project created successfully"
//     });

//   } catch (error) {
//     console.error("Error in createSingleProperty:", error);
    
//     if (error.name === 'ValidationError') {
//       const errors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Validation Error",
//         errors: errors
//       });
//     }
    
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Property with similar details already exists"
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Error creating property: " + error.message
//     });
//   }
// };

const createSingleProperty = async (req, res) => {
  const { propertyType, projectName, builderName, location, description, ...otherData } = req.body;
  let finalData = { ...req.body };

  try {
    // Convert propertyType to string if it's an array with one element
    if (Array.isArray(propertyType)) {
      finalData.propertyType = propertyType[0];
    }

    // ✅ Extract and map nested properties data to main fields
    if (finalData.propertyType === 'residential' && finalData.residentialProperties && finalData.residentialProperties.length > 0) {
      const residentialData = finalData.residentialProperties[0];
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
        minSize: residentialData.minSize,
        maxSize: residentialData.maxSize,
        sizeUnit: residentialData.sizeUnit,
        propertyImages: residentialData.propertyImages || [],
        floorPlans: residentialData.floorPlans || [],
        amenities: residentialData.amenities || finalData.amenities || []
      };
      
      // ✅ Remove plot/commercial specific fields for residential
      delete finalData.ownershipType;
      delete finalData.landType;
      delete finalData.approvedBy;
      delete finalData.boundaryWall;
      delete finalData.residentialProperties;
    }
    else if (finalData.propertyType === 'commercial' && finalData.commercialProperties && finalData.commercialProperties.length > 0) {
      const commercialData = finalData.commercialProperties[0];
      finalData = {
        ...finalData,
        propertyName: commercialData.propertyName,
        propertyDescription: commercialData.propertyDescription,
        // ✅ Auto-inherit price from parent if not provided
        price: commercialData.price || finalData.price || 'Contact for price',
        paymentPlan: commercialData.paymentPlan || finalData.paymentPlan,
        carpetArea: commercialData.carpetArea,
        builtUpArea: commercialData.builtUpArea,
        minSize: commercialData.minSize,
        maxSize: commercialData.maxSize,
        sizeUnit: commercialData.sizeUnit,
        propertyImages: commercialData.propertyImages || [],
        floorPlans: commercialData.floorPlans || [],
        amenities: commercialData.amenities || finalData.amenities || []
      };
      
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
    else if (finalData.propertyType === 'plot' && finalData.plotProperties && finalData.plotProperties.length > 0) {
      const plotData = finalData.plotProperties[0];
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
      
      // ✅ Remove residential/commercial specific fields for plot
      delete finalData.bedrooms;
      delete finalData.bathrooms;
      delete finalData.toilet;
      delete finalData.balcony;
      delete finalData.carpetArea;
      delete finalData.builtUpArea;
      delete finalData.plotProperties;
    }
    else if (finalData.propertyType === 'project') {
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
    if (finalData.propertyType !== 'project' && !finalData.parentId) {
      // Check if a main project already exists with same details
      const existingMainProject = await Property.findOne({
        projectName: projectName.trim(),
        builderName: builderName.trim(),
        location: location.trim(),
        propertyType: 'project',
        isActive: true,
        parentId: null
      });

      if (existingMainProject) {
        // Use existing main project as parent
        finalData.parentId = existingMainProject._id;
        
        // ✅ NEW: Auto-inherit price from existing parent project for sub-properties
        if ((!finalData.price || finalData.price === 'Contact for price') && existingMainProject.price && existingMainProject.price !== 'Contact for price') {
          finalData.price = existingMainProject.price;
          console.log(`Auto-inherited price from existing parent: ${existingMainProject.price}`);
        }
      } else {
        // Generate unique slug for main project
        const slug = await Property.generateUniqueSlug(projectName.trim(), builderName.trim());
        
        // Create a new main project first
        const mainProjectData = {
          projectName: projectName.trim(),
          builderName: builderName.trim(),
          location: location.trim(),
          description: description || `Main project for ${projectName}`,
          propertyType: 'project',
          propertyName: `${projectName.trim()} Project`,
          price: finalData.price || 'Contact for price', // Use provided price
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
          slug: slug // Add the generated slug
        };

        const mainProject = new Property(mainProjectData);
        await mainProject.save();
        
        // Use the new main project as parent
        finalData.parentId = mainProject._id;
        
        console.log(`Auto-created main project: ${mainProject._id} with slug: ${slug}`);
      }
    }

    // ✅ Validate parentId if provided AND auto-inherit price from parent
    if (finalData.parentId) {
      const parentProperty = await Property.findOne({
        _id: finalData.parentId,
        isActive: true
      });
      
      if (!parentProperty) {
        return res.status(400).json({
          success: false,
          message: "Parent property not found or inactive"
        });
      }

      // Ensure parent is a main project
      if (parentProperty.propertyType !== 'project') {
        return res.status(400).json({
          success: false,
          message: "Sub-properties can only be created under main projects"
        });
      }

      // ✅ NEW: Auto-inherit price from parent project if not explicitly set
      if ((!finalData.price || finalData.price === 'Contact for price') && parentProperty.price && parentProperty.price !== 'Contact for price') {
        finalData.price = parentProperty.price;
        console.log(`Auto-inherited price from parent project: ${parentProperty.price}`);
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
    
    // ✅ Populate createdBy and parent details for response
    await newProperty.populate("createdBy", "name email");
    if (newProperty.parentId) {
      await newProperty.populate("parentId", "projectName builderName location price");
    }

    return res.status(201).json({
      success: true,
      data: newProperty,
      message: finalData.parentId 
        ? `${finalData.propertyType} property created successfully under main project` 
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
};

// Create multiple properties (main project + sub-properties)
const createMultipleProperties = async (req, res) => {
  const { propertyType, projectName, builderName, location, description, ...otherData } = req.body;
  
  // ✅ NEW: Calculate minimum price from all sub-properties before creating main project
  const minPrice = findMinimumPriceFromSubProperties(otherData);
  const mainProjectPrice = minPrice !== null ? formatPrice(minPrice) : (otherData.price || 'Contact for price');

  console.log(`Calculated minimum price from sub-properties: ${minPrice}`);
  console.log(`Main project price will be: ${mainProjectPrice}`);

  // Create main project first with minimum price from sub-properties
  const mainProjectData = {
    projectName: projectName.trim(),
    builderName: builderName.trim(),
    location: location.trim(),
    description: description || `Main project for ${projectName}`,
    propertyType: 'project',
    propertyName: `${projectName.trim()} Project`,
    price: mainProjectPrice, // ✅ Set to minimum price from sub-properties
    paymentPlan: otherData.paymentPlan || 'Flexible',
    status: otherData.status || ['Under Construction'],
    amenities: otherData.amenities || [],
    nearby: otherData.nearby || [],
    projectHighlights: otherData.projectHighlights || [],
    mapLocation: otherData.mapLocation || { lat: 0, lng: 0 },
    images: otherData.images || [],
    brochureUrls: otherData.brochureUrls || [],
    createdBy: req.employee._id,
    parentId: null,
    hierarchyLevel: 0
  };

  const mainProject = new Property(mainProjectData);
  await mainProject.save();

  // Create sub-properties for each non-project type
  const subPropertyTypes = propertyType.filter(type => type !== 'project');
  const createdSubProperties = [];

  for (const subType of subPropertyTypes) {
    // Get the specific property data for this type
    let subPropertySpecificData = {};
    let subPropertyPrice = 'Contact for price';

    if (subType === 'residential' && otherData.residentialProperties && otherData.residentialProperties.length > 0) {
      subPropertySpecificData = otherData.residentialProperties[0] || {};
      subPropertyPrice = subPropertySpecificData.price || mainProjectPrice;
    } else if (subType === 'commercial' && otherData.commercialProperties && otherData.commercialProperties.length > 0) {
      subPropertySpecificData = otherData.commercialProperties[0] || {};
      subPropertyPrice = subPropertySpecificData.price || mainProjectPrice;
    } else if (subType === 'plot' && otherData.plotProperties && otherData.plotProperties.length > 0) {
      subPropertySpecificData = otherData.plotProperties[0] || {};
      subPropertyPrice = subPropertySpecificData.price || mainProjectPrice;
    }

    const subPropertyData = {
      projectName: projectName.trim(),
      builderName: builderName.trim(),
      location: location.trim(),
      description: description || `${subType} property in ${projectName}`,
      propertyType: subType,
      propertyName: subPropertySpecificData.propertyName || `${subType} Unit`,
      // ✅ Use specific price if provided, otherwise use main project price
      price: subPropertyPrice,
      paymentPlan: subPropertySpecificData.paymentPlan || otherData.paymentPlan || 'Flexible',
      status: otherData.status || ['Under Construction'],
      amenities: subPropertySpecificData.amenities || otherData.amenities || [],
      nearby: otherData.nearby || [],
      projectHighlights: otherData.projectHighlights || [],
      mapLocation: otherData.mapLocation || { lat: 0, lng: 0 },
      images: otherData.images || [],
      brochureUrls: otherData.brochureUrls || [],
      createdBy: req.employee._id,
      parentId: mainProject._id,
      hierarchyLevel: 1
    };

    // Add type-specific fields
    if (subType === 'residential') {
      subPropertyData.minSize = subPropertySpecificData.minSize;
      subPropertyData.maxSize = subPropertySpecificData.maxSize;
      subPropertyData.sizeUnit = subPropertySpecificData.sizeUnit;
      subPropertyData.bedrooms = subPropertySpecificData.bedrooms;
      subPropertyData.bathrooms = subPropertySpecificData.bathrooms;
      subPropertyData.toilet = subPropertySpecificData.toilet;
      subPropertyData.balcony = subPropertySpecificData.balcony;
      subPropertyData.carpetArea = subPropertySpecificData.carpetArea;
      subPropertyData.builtUpArea = subPropertySpecificData.builtUpArea;
      subPropertyData.propertyImages = subPropertySpecificData.propertyImages || [];
      subPropertyData.floorPlans = subPropertySpecificData.floorPlans || [];
    } else if (subType === 'commercial') {
      subPropertyData.minSize = subPropertySpecificData.minSize;
      subPropertyData.maxSize = subPropertySpecificData.maxSize;
      subPropertyData.sizeUnit = subPropertySpecificData.sizeUnit;
      subPropertyData.carpetArea = subPropertySpecificData.carpetArea;
      subPropertyData.builtUpArea = subPropertySpecificData.builtUpArea;
      subPropertyData.propertyImages = subPropertySpecificData.propertyImages || [];
      subPropertyData.floorPlans = subPropertySpecificData.floorPlans || [];
    } else if (subType === 'plot') {
      subPropertyData.minSize = subPropertySpecificData.minSize;
      subPropertyData.maxSize = subPropertySpecificData.maxSize;
      subPropertyData.sizeUnit = subPropertySpecificData.sizeUnit;
      subPropertyData.ownershipType = subPropertySpecificData.ownershipType;
      subPropertyData.landType = subPropertySpecificData.landType;
      subPropertyData.approvedBy = subPropertySpecificData.approvedBy;
      subPropertyData.boundaryWall = subPropertySpecificData.boundaryWall;
      subPropertyData.propertyImages = subPropertySpecificData.propertyImages || [];
      subPropertyData.floorPlans = subPropertySpecificData.floorPlans || [];
    }

    const subProperty = new Property(subPropertyData);
    await subProperty.save();
    await subProperty.populate("parentId", "projectName builderName location price");
    createdSubProperties.push(subProperty);
  }

  // Populate main project for response
  await mainProject.populate("createdBy", "name email");

  return res.status(201).json({
    success: true,
    data: {
      mainProject,
      subProperties: createdSubProperties
    },
    message: `Main project created with ${createdSubProperties.length} sub-properties. Main project price set to minimum from sub-properties: ${mainProjectPrice}`
  });
};

// Get all properties (with pagination, search and hierarchy support)
const getAllProperties = async (req, res) => {
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
      builderName
    } = req.query;

    const currentPage = Math.max(parseInt(page), 1);
    const itemsPerPage = Math.min(parseInt(limit), 100);
    const skip = (currentPage - 1) * itemsPerPage;

    const query = { isActive: true };
    
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

    // For hierarchical view
    if (hierarchyView === "true") {
      const hierarchicalData = await getHierarchicalProperties(search, status, propertyType, location, builderName);
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
        .populate("parentId", "projectName builderName location price")
        .lean(),
      Property.countDocuments(query)
    ]);

    // For main projects, count sub-properties
    if (parentOnly === "true" || parentId === "null") {
      for (let property of properties) {
        const subPropertyCount = await Property.countDocuments({
          parentId: property._id,
          isActive: true
        });
        property.subPropertyCount = subPropertyCount;
      }
    }

    // Include children if requested
    if (includeChildren === "true") {
      for (let property of properties) {
        if (property.parentId === null) {
          const children = await Property.find({
            parentId: property._id,
            isActive: true
          })
          .populate("createdBy", "name email")
          .lean();
          
          property.children = children;
        }
      }
    }

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

// Update getHierarchicalProperties function
const getHierarchicalProperties = async (search = "", status, propertyType, location, builderName) => {
  const query = { 
    isActive: true,
    parentId: null // Start with main projects only
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

  const mainProjects = await Property.find(query)
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email")
    .lean();

  // Get sub-properties for each main project
  const hierarchicalData = [];
  
  for (let project of mainProjects) {
    const subProperties = await Property.find({
      parentId: project._id,
      isActive: true
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
};

// Get sub-properties for a specific parent
const getSubProperties = async (req, res) => {
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
      isActive: true 
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
        .populate("parentId", "projectName builderName location price")
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
};

// Middleware wrapper for authentication
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
        // For POST requests, require authentication
        await userAuth(req, res, () => {});
        
        // Check if user is admin for POST
        if (req.method === "POST" && !req.isSystemAdmin) {
          return res.status(403).json({
            success: false,
            message: "Only administrators can create properties"
          });
        }
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
      // Check if it's a request for sub-properties
      if (req.query.parentId && req.query.action === 'subproperties') {
        return getSubProperties(req, res);
      }
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
