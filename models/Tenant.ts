import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITenant extends Document {
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  ownerId: string;
  isActive: boolean;
  settings: {
    primaryColor?: string;
    logo?: string;
    siteName?: string;
    description?: string;
  };
  createdAt: Date;
}

const TenantSchema: Schema<ITenant> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    ownerId: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      primaryColor: { type: String, default: "#D32F2F" },
      logo: { type: String, default: "" },
      siteName: { type: String, default: "" },
      description: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>("Tenant", TenantSchema);
