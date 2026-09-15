import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      lowercase: true,
      minLength: [2, "Name must be at least 2 characters"],
      maxLength: [30, "Name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      maxLength: [72, "Password cannot exceed 72 characters"],
    },
    refreshToken:{
      type:String,
    }
  },
  {
    timestamps: true,
  }
);


export const userModel = mongoose.model("user",userSchema)