import mongoose, { Schema, Document, Model } from "mongoose";

export interface INews extends Document {
  title: string;
  titleI18n?: {
    bn?: string;
    en?: string;
    hi?: string;
  };
  subtitle?: string;
  subtitleI18n?: {
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
  authorBio?: string;
  authorAvatar?: string;
  date: string;
  image?: string;
  imageCaption?: string;
  imageCredit?: string;
  createdAt: Date;
  updatedAt?: Date;
  isBreaking: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isEditorPick?: boolean;
  published: boolean;
  scheduledAt?: Date | null;
  readingTime?: number;
  tags: string[];
  gallery?: string[];
  views?: number;
  breakingExpiresAt?: Date;
  videoUrl?: string;
  videoDuration?: string;
  section?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
    noIndex?: boolean;
    focusKeyword?: string;
  };
  tenantId?: string | null;
}

const NewsSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    titleI18n: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    subtitle: { type: String, default: "" },
    subtitleI18n: {
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
    authorBio: { type: String, default: "Senior Journalist & Editorial Contributor" },
    authorAvatar: { type: String, default: "" },
    date: { type: String, required: true },
    image: { type: String, default: "https://placehold.co/600x400/png" },
    imageCaption: { type: String, default: "" },
    imageCredit: { type: String, default: "" },
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isEditorPick: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    scheduledAt: { type: Date, default: null },
    readingTime: { type: Number, default: 3 },
    tags: { type: [String], default: [] },
    gallery: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    breakingExpiresAt: { type: Date },
    videoUrl: { type: String, default: "" },
    videoDuration: { type: String, default: "" },
    section: { type: String, default: "general" },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      keywords: { type: [String], default: [] },
      canonicalUrl: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      noIndex: { type: Boolean, default: false },
      focusKeyword: { type: String, default: "" },
    },
    tenantId: { type: String, default: null, index: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance querying
NewsSchema.index({ published: 1, createdAt: -1 });
NewsSchema.index({ category: 1, published: 1 });
NewsSchema.index({ isBreaking: 1, published: 1 });
NewsSchema.index({ isFeatured: 1, published: 1 });
NewsSchema.index({ views: -1 });

const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>("News", NewsSchema);

export default News;
