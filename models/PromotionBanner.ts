import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPromotionBanner extends Document {
  name: string;
  type:
    | "hero"
    | "announcement_strip"
    | "floating"
    | "sticky_bottom_mobile"
    | "sidebar"
    | "in_article"
    | "app_install";
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaUrl: string;
  imageUrlDesktop?: string;
  imageUrlMobile?: string;
  bgGradient: string;
  textColor: string;
  targetAudience: {
    device: "all" | "mobile" | "desktop";
    segment: "all" | "new" | "returning" | "registered";
    city?: string;
    category?: string;
  };
  frequency: "always" | "once_per_session" | "once_per_day" | "scroll_depth";
  scrollDepthPercentage: number;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  isActive: boolean;
  stats: {
    impressions: number;
    clicks: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PromotionBannerSchema: Schema<IPromotionBanner> = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "hero",
        "announcement_strip",
        "floating",
        "sticky_bottom_mobile",
        "sidebar",
        "in_article",
        "app_install",
      ],
      default: "announcement_strip",
      index: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    ctaText: { type: String, default: "Learn More" },
    ctaUrl: { type: String, required: true },
    imageUrlDesktop: { type: String, default: "" },
    imageUrlMobile: { type: String, default: "" },
    bgGradient: {
      type: String,
      default: "from-[#c61d23] via-[#9a1418] to-black",
    },
    textColor: { type: String, default: "#ffffff" },
    targetAudience: {
      device: { type: String, enum: ["all", "mobile", "desktop"], default: "all" },
      segment: {
        type: String,
        enum: ["all", "new", "returning", "registered"],
        default: "all",
      },
      city: { type: String, default: "" },
      category: { type: String, default: "" },
    },
    frequency: {
      type: String,
      enum: ["always", "once_per_session", "once_per_day", "scroll_depth"],
      default: "always",
    },
    scrollDepthPercentage: { type: Number, default: 40 },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    priority: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true, index: true },
    stats: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const PromotionBanner: Model<IPromotionBanner> =
  mongoose.models.PromotionBanner ||
  mongoose.model<IPromotionBanner>("PromotionBanner", PromotionBannerSchema);

export default PromotionBanner;
