import dbConnect from "@/lib/mongodb";
import Pillar from "@/models/Pillar";
import "@/models/Property"; // 🔥 REQUIRED for populate

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false });
  }

  try {
    await dbConnect();

    const {
      category = "",
      featured = "false",
      limit = "20",
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (featured === "true") query.isFeatured = true;

    const pillars = await Pillar.find(query)
      .select(
        "name category profileImages designation about experience expertise skills isFeatured"
      )
      .populate(
        "projects",
        "projectName builderName location price images slug propertyType"
      )
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit), 50));

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).json({
      success: true,
      data: pillars,
    });
  } catch (error) {
    console.error("Public Pillars Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
