import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHomepageSection {
  id: string;
  type:
    | "hero-spotlight"
    | "breaking-ticker"
    | "trending-rank"
    | "latest-feed"
    | "category-magazine"
    | "video-hub"
    | "special-editorial"
    | "newsletter"
    | "ad-banner"
    | "poll-widget";
  title: string;
  subtitle?: string;
  categorySlug?: string;
  layout:
    | "magazine"
    | "grid"
    | "masonry"
    | "list"
    | "carousel"
    | "split"
    | "compact";
  articleCount: number;
  background: "transparent" | "glass" | "subtle-gradient" | "solid-dark";
  accentColor?: string;
  isEnabled: boolean;
  order: number;
}

export interface IHomepageConfig extends Document {
  sections: IHomepageSection[];
  isPublished: boolean;
  tenantId?: string | null;
  updatedAt: Date;
}

const HomepageSectionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "hero-spotlight",
        "breaking-ticker",
        "trending-rank",
        "latest-feed",
        "category-magazine",
        "video-hub",
        "special-editorial",
        "newsletter",
        "ad-banner",
        "poll-widget",
      ],
    },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    categorySlug: { type: String, default: "" },
    layout: {
      type: String,
      default: "magazine",
      enum: [
        "magazine",
        "grid",
        "masonry",
        "list",
        "carousel",
        "split",
        "compact",
      ],
    },
    articleCount: { type: Number, default: 6 },
    background: {
      type: String,
      default: "transparent",
      enum: ["transparent", "glass", "subtle-gradient", "solid-dark"],
    },
    accentColor: { type: String, default: "" },
    isEnabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const HomepageConfigSchema: Schema = new Schema(
  {
    sections: { type: [HomepageSectionSchema], default: [] },
    isPublished: { type: Boolean, default: true },
    tenantId: { type: String, default: null },
  },
  { timestamps: true }
);

const HomepageConfig: Model<IHomepageConfig> =
  mongoose.models.HomepageConfig ||
  mongoose.model<IHomepageConfig>("HomepageConfig", HomepageConfigSchema);

export default HomepageConfig;
