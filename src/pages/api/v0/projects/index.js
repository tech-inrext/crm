// src/pages/api/v0/projects/index.js
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const projects = await Project.find({ isActive: true }).select("name _id location");
      return res.status(200).json({ data: { projects } });
    } catch (err) {
      return res.status(500).json({ message: "Failed to fetch projects", error: err.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, description, location, createdBy } = req.body;
      if (!name || !description || !location || !createdBy) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const project = await Project.create({ name, description, location, createdBy });
      return res.status(201).json({ message: "Project created", data: project });
    } catch (err) {
      return res.status(400).json({ message: "Failed to create project", error: err.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
