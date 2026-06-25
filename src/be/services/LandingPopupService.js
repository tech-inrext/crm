import { Service } from "@framework";
import { LandingPopup } from "../models/LandingPopup";

class LandingPopupService extends Service {
  constructor() {
    super();
  }

  async getLandingPopup(req, res) {
    try {
      const activePopups = await LandingPopup.find({ isActive: true }).sort({
        createdAt: -1,
      });

      if (activePopups && activePopups.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Published landing popups retrieved successfully",
          data: activePopups,
        });
      }

      const fallbackPopup = await LandingPopup.findOne().sort({
        createdAt: -1,
      });
      if (!fallbackPopup) {
        return res.status(404).json({
          success: false,
          message: "No landing popups found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Landing popup retrieved successfully",
        data: [fallbackPopup],
      });
    } catch (error) {
      console.error("Error fetching landing popup:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching landing popup",
        error: error.message,
      });
    }
  }

  async getAllLandingPopups(req, res) {
    try {
      const popups = await LandingPopup.find().sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Landing popups retrieved successfully",
        data: popups,
      });
    } catch (error) {
      console.error("Error fetching landing popups:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching landing popups",
        error: error.message,
      });
    }
  }

  async createLandingPopup(req, res) {
    try {
      const { imageUrl, buttonText, isActive } =
        req.body;

      // Validate required fields
      if (!imageUrl || !buttonText) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }

      const popup = new LandingPopup({
        imageUrl,
        buttonText,
        isActive: isActive !== undefined ? isActive : false,
      });

      const savedPopup = await popup.save();

      return res.status(201).json({
        success: true,
        message: "Landing popup created successfully",
        data: savedPopup,
      });
    } catch (error) {
      console.error("Error creating landing popup:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating landing popup",
        error: error.message,
      });
    }
  }

  async updateLandingPopup(req, res) {
    try {
      const { id } = req.query;
      const { imageUrl, buttonText, isActive } =
        req.body;

      const popup = await LandingPopup.findById(id);
      if (!popup) {
        return res.status(404).json({
          success: false,
          message: "Landing popup not found",
        });
      }

      // Update fields if provided
      if (imageUrl !== undefined) popup.imageUrl = imageUrl;
      if (buttonText !== undefined) popup.buttonText = buttonText;
      if (isActive !== undefined) popup.isActive = isActive;

      const updatedPopup = await popup.save();

      return res.status(200).json({
        success: true,
        message: "Landing popup updated successfully",
        data: updatedPopup,
      });
    } catch (error) {
      console.error("Error updating landing popup:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating landing popup",
        error: error.message,
      });
    }
  }

  async deleteLandingPopup(req, res) {
    try {
      const { id } = req.query;
      const popup = await LandingPopup.findById(id);
      if (!popup) {
        return res.status(404).json({
          success: false,
          message: "Landing popup not found",
        });
      }

      await LandingPopup.deleteOne({ _id: id });

      return res.status(200).json({
        success: true,
        message: "Landing popup deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting landing popup:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting landing popup",
        error: error.message,
      });
    }
  }
}

export default LandingPopupService;
