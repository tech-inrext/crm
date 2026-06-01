import mongoose from "mongoose";

const LandingPopupSchema = new mongoose.Schema(
  {
    propertyName: {
      type: String,
      required: true,
      default: "Corbett County",
    },
    location: {
      type: String,
      required: true,
      default: "Jim Corbett National Park, Uttarakhand",
    },
    imageUrl: {
      type: String,
      required: true,
      default: "/images/corbett_county_ad.png",
    },
    buttonText: {
      type: String,
      // required: true,
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
