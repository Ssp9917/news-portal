import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserPreferences {
  language: string;
  city: string;
  state: string;
  categories: string[];
  notificationTypes: {
    breaking: boolean;
    local: boolean;
    digest: boolean;
    marketing: boolean;
  };
  dailyDigest: "morning" | "afternoon" | "evening" | "none";
}

export interface IReadingHistoryItem {
  newsId: string;
  title: string;
  slug: string;
  category: string;
  image?: string;
  viewedAt: Date;
}

export interface IUser extends Document {
  email: string;
  name?: string;
  password?: string;
  role:
    | "super_admin"
    | "admin"
    | "editor"
    | "author"
    | "seo_manager"
    | "media_manager"
    | "viewer"
    | "user";
  tenantId?: string;
  isActive: boolean;
  createdBy?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  preferences: IUserPreferences;
  bookmarks: string[]; // List of news slugs or IDs
  readingHistory: IReadingHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ReadingHistorySchema = new Schema(
  {
    newsId: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: String, default: "सामान्य" },
    image: { type: String, default: "" },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "editor",
        "author",
        "seo_manager",
        "media_manager",
        "viewer",
        "user",
      ],
      default: "user",
    },
    tenantId: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    preferences: {
      language: { type: String, default: "hi" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      categories: { type: [String], default: ["national", "politics", "sports"] },
      notificationTypes: {
        breaking: { type: Boolean, default: true },
        local: { type: Boolean, default: true },
        digest: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
      dailyDigest: {
        type: String,
        enum: ["morning", "afternoon", "evening", "none"],
        default: "morning",
      },
    },
    bookmarks: {
      type: [String],
      default: [],
    },
    readingHistory: {
      type: [ReadingHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
