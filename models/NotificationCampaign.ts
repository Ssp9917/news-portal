import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationCampaign extends Document {
  name: string;
  title: string;
  message: string;
  image?: string;
  icon?: string;
  url: string;
  category: string;
  type:
    | "breaking"
    | "important"
    | "trending"
    | "local"
    | "sports"
    | "digest"
    | "announcement"
    | "promotional";
  priority: "high" | "normal";
  status: "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";
  targetAudience: {
    segment: "all" | "registered" | "guests" | "city" | "state" | "category" | "custom";
    city?: string;
    state?: string;
    categories?: string[];
    language?: string;
  };
  scheduledAt?: Date | null;
  sentAt?: Date | null;
  stats: {
    totalTargeted: number;
    sentCount: number;
    failedCount: number;
    clickCount: number;
  };
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationCampaignSchema: Schema<INotificationCampaign> = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    image: { type: String, default: "" },
    icon: { type: String, default: "/favicon.svg" },
    url: { type: String, required: true },
    category: { type: String, default: "general" },
    type: {
      type: String,
      enum: [
        "breaking",
        "important",
        "trending",
        "local",
        "sports",
        "digest",
        "announcement",
        "promotional",
      ],
      default: "breaking",
    },
    priority: { type: String, enum: ["high", "normal"], default: "high" },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "failed", "cancelled"],
      default: "draft",
      index: true,
    },
    targetAudience: {
      segment: {
        type: String,
        enum: ["all", "registered", "guests", "city", "state", "category", "custom"],
        default: "all",
      },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      categories: { type: [String], default: [] },
      language: { type: String, default: "all" },
    },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    stats: {
      totalTargeted: { type: Number, default: 0 },
      sentCount: { type: Number, default: 0 },
      failedCount: { type: Number, default: 0 },
      clickCount: { type: Number, default: 0 },
    },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

export const NotificationCampaign: Model<INotificationCampaign> =
  mongoose.models.NotificationCampaign ||
  mongoose.model<INotificationCampaign>(
    "NotificationCampaign",
    NotificationCampaignSchema
  );

export default NotificationCampaign;
