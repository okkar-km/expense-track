import mongoose, { Schema, type Model } from "mongoose";
import type { IUser } from "@/types";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser>=
  (mongoose.models.User as Model<IUser>) ??
  mongoose.model<IUser>("User", userSchema);

export default User;