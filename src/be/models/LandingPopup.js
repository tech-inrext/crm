import mongoose from "mongoose";

const LandingPopupSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
      default: "GET CALL BACK",
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

export const LandingPopup =
  mongoose.models.LandingPopup ||
  mongoose.model("LandingPopup", LandingPopupSchema);
