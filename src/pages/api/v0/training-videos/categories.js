import dbConnect from "../../../../lib/mongodb";
import TrainingVideo from "../../../../models/TrainingVideo";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

const getCategories = async (req, res) => {
  try {
    const categories = await TrainingVideo.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          latestVideo: { $max: "$uploadDate" }
        }
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          latestVideo: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

const handler = async (req, res) => {
  await dbConnect();

  if (req.method === "GET") {
    return getCategories(req, res);
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

export default withAuth(handler);