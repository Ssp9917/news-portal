import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdvertisement extends Document {
  title: string;
  slot:
    | "header_top"
    | "hero_after"
    | "feed_inline"
    | "article_sidebar"
    | "article_content"
    | "footer_above"
    | "mobile_sticky";
  adType: "adsense" | "custom_banner" | "html_code";
  adCode?: string;
  imageUrl?: string;
  targetUrl?: string;
  isActive: boolean;
  impressions?: number;
  clicks?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdvertisementSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slot: {
      type: String,
      required: true,
      enum: [
        "header_top",
        "hero_after",
        "feed_inline",
        "article_sidebar",
        "article_content",
        "footer_above",
        "mobile_sticky",
      ],
    },
    adType: {
      type: String,
      required: true,
      enum: ["adsense", "custom_banner", "html_code"],
      default: "custom_banner",
    },
    adCode: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    targetUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Advertisement: Model<IAdvertisement> =
  mongoose.models.Advertisement ||
  mongoose.model<IAdvertisement>("Advertisement", AdvertisementSchema);

export default Advertisement;
