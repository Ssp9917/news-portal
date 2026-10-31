import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  nameI18n?: {
    bn?: string;
    en?: string;
    hi?: string;
  };
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  isVisible: boolean;
  isNav: boolean;
  seo?: {
    title?: string;
    description?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    nameI18n: {
      bn: { type: String, default: "" },
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
    },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    color: { type: String, default: "from-blue-600 to-indigo-700" },
    icon: { type: String, default: "Flame" },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    isNav: { type: Boolean, default: true },
    seo: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

CategorySchema.index({ order: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
