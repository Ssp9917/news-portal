import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeviceToken extends Document {
  token: string;
  userId?: string | null;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";
  browser?: string;
  platform?: string;
  city?: string;
  state?: string;
  categories: string[];
  language: string;
  notificationPreferences: {
    breaking: boolean;
    trending: boolean;
    local: boolean;
    digest: boolean;
    promotional: boolean;
  };
  isActive: boolean;
  subscribedAt: Date;
  lastActiveAt: Date;
}

const DeviceTokenSchema: Schema<IDeviceToken> = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "tablet", "unknown"],
      default: "unknown",
    },
    browser: { type: String, default: "" },
    platform: { type: String, default: "" },
    city: { type: String, default: "", index: true },
    state: { type: String, default: "", index: true },
    categories: { type: [String], default: [] },
    language: { type: String, default: "hi" },
    notificationPreferences: {
      breaking: { type: Boolean, default: true },
      trending: { type: Boolean, default: true },
      local: { type: Boolean, default: true },
      digest: { type: Boolean, default: true },
      promotional: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true, index: true },
    subscribedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const DeviceToken: Model<IDeviceToken> =
  mongoose.models.DeviceToken ||
  mongoose.model<IDeviceToken>("DeviceToken", DeviceTokenSchema);

export default DeviceToken;
