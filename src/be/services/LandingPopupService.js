import { Service } from "@framework";
import { LandingPopup } from "../models/LandingPopup";

class LandingPopupService extends Service {
  constructor() {
    super();
  }

  async getLandingPopup(req, res) {
    try {
      const popup = await LandingPopup.findOne();

      if (!popup) {
        return res.status(404).json({
          success: false,
          message: "Landing popup not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Landing popup retrieved successfully",
        data: popup,
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

  async createLandingPopup(req, res) {
    try {
      const { propertyName, location, imageUrl, buttonText, isActive } =
        req.body;

      // Validate required fields
      if (!propertyName || !location || !imageUrl || !buttonText) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields",
        });
      }

      //   // Check if popup already exists
      //   const existingPopup = await LandingPopup.findOne();
      //   if (existingPopup) {
      //     return res.status(400).json({
      //       success: false,
      //       message: "Landing popup already exists. Please update the existing one.",
      //     });
      //   }

      const popup = new LandingPopup({
        propertyName,
        location,
        imageUrl,
        buttonText,
        isActive: isActive !== undefined ? isActive : true,
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
      const { propertyName, location, imageUrl, buttonText, isActive } =
        req.body;

      // Find the existing popup
      const popup = await LandingPopup.findOne();
      if (!popup) {
        return res.status(404).json({
          success: false,
          message: "Landing popup not found",
        });
      }

      // Update fields if provided
      if (propertyName !== undefined) popup.propertyName = propertyName;
      if (location !== undefined) popup.location = location;
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
      const popup = await LandingPopup.findOne();
      if (!popup) {
        return res.status(404).json({
          success: false,
          message: "Landing popup not found",
        });
      }

      await LandingPopup.deleteOne({ _id: popup._id });

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
