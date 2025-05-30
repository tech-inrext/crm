// models/User.js
import mongoose from "mongoose";

const options = {
  discriminatorKey: "userType", // key used to differentiate models
  collection: "users", // shared collection
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true  },
    email: { type: String, required: true, unique: true },
    altPhone: { type: String, },
    address: { type: String, required: true },
    gender: { type: String },
    age: { type: String,  },
  },
  { timestamps: true, ...options }
);


const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
