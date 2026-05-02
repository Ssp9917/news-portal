import mongoose, { Schema, Document, Model } from "mongoose";

export interface INews extends Document {
  title: string;
  titleI18n?: {
    bn?: string;
    en?: string;
    hi?: string;
  };
  slug: string;
  category: string;
  categoryColor?: string;
  excerpt: string;
  excerptI18n?: {
    bn?: string;
    en?: string;
    hi?: string;
  };
  content: string;
  contentI18n?: {
    bn?: string;
    en?: string;
    hi?: string;
  };
  author: string;
  date: string;
  image?: string;
  createdAt: Date;
  isBreaking: boolean;
  published: boolean;
  tags: string[];
  gallery?: string[];
  views?: number;
  breakingExpiresAt?: Date;
  videoUrl?: string;
}

const NewsSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    titleI18n: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    categoryColor: { type: String, default: "bg-blue-500" },
    excerpt: { type: String, required: true },
    excerptI18n: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    content: { type: String, required: true },
    contentI18n: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    author: { type: String, required: true },
    date: { type: String, required: true },
    image: { type: String, default: "https://placehold.co/600x400/png" },
    isBreaking: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    gallery: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    breakingExpiresAt: { type: Date },
    videoUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Prevent overwriting model if it already exists
const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>("News", NewsSchema);

export default News;
