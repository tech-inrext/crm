// pages/api/public/property/index.js
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";  
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const {
      featured = "false",
      limit = "20",
    } = req.query;

    const query = { isPublic: true }; // Only public properties

    if (featured === "true") query.isFeatured = true;

    const properties = await Property.find(query)
      .select(
        "projectName builderName location price minPrice maxPrice propertyType images slug status amenities nearby projectHighlights mapLocation isFeatured createdAt"
      )
      .populate(
        "subProperties", // If you have a relationship field for sub-properties
        "propertyName propertyDescription price propertyType minSize maxSize sizeUnit bedrooms bathrooms carpetArea builtUpArea ownershipType landType propertyImages amenities"
      )
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit), 50));

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error("Public Property Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
