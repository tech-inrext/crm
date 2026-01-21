import { Service } from "@framework";
import Project from "../../models/Project";

class ProjectService extends Service {
  constructor() {
    super();
  }

  async getAllProjects(req, res) {
    console.log("getAllProjects hit");
    try {
      const projects = await Project.find({ isActive: true }).select(
        "name _id location"
      );
      return res.status(200).json({ data: { projects } });
    } catch (err) {
      return res.status(500).json({
        message: "Failed to fetch projects",
        error: err.message,
      });
    }
  }

  async createProject(req, res) {
    try {
      const { name, description, location, createdBy } = req.body;
      if (!name || !description || !location || !createdBy) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const project = await Project.create({
        name,
        description,
        location,
        createdBy,
      });
      return res
        .status(201)
        .json({ message: "Project created", data: project });
    } catch (err) {
      return res.status(400).json({
        message: "Failed to create project",
        error: err.message,
      });
    }
  }
}

export default ProjectService;
