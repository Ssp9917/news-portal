import mongoose, { Schema, Document, Model } from "mongoose";

export interface IThemeConfig extends Document {
  preset: string;
  mode: "dark" | "light" | "system";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkBg: string;
  lightBg: string;
  cardStyle: "glass" | "modern-flat" | "editorial-bordered" | "glow";
  borderRadius: string;
  glassBlur: string;
  glassOpacity: number;
  headingFont: "serif" | "sans" | "display";
  bodyFont: "sans" | "serif";
  baseFontSize: string;
  containerWidth: string;
  sectionSpacing: string;
  enableAnimations: boolean;
  isPublished: boolean;
  tenantId?: string | null;
  updatedAt: Date;
}

const ThemeConfigSchema: Schema = new Schema(
  {
    preset: { type: String, default: "electric-midnight" },
    mode: { type: String, enum: ["dark", "light", "system"], default: "dark" },
    primaryColor: { type: String, default: "#2563EB" },
    secondaryColor: { type: String, default: "#7C3AED" },
    accentColor: { type: String, default: "#06B6D4" },
    darkBg: { type: String, default: "#030712" },
    lightBg: { type: String, default: "#F8FAFC" },
    cardStyle: {
      type: String,
      enum: ["glass", "modern-flat", "editorial-bordered", "glow"],
      default: "glass",
    },
    borderRadius: { type: String, default: "1rem" },
    glassBlur: { type: String, default: "16px" },
    glassOpacity: { type: Number, default: 0.65 },
    headingFont: {
      type: String,
      enum: ["serif", "sans", "display"],
      default: "serif",
    },
    bodyFont: {
      type: String,
      enum: ["sans", "serif"],
      default: "sans",
    },
    baseFontSize: { type: String, default: "16px" },
    containerWidth: { type: String, default: "1280px" },
    sectionSpacing: { type: String, default: "3.5rem" },
    enableAnimations: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true },
    tenantId: { type: String, default: null },
  },
  { timestamps: true }
);

const ThemeConfig: Model<IThemeConfig> =
  mongoose.models.ThemeConfig ||
  mongoose.model<IThemeConfig>("ThemeConfig", ThemeConfigSchema);

export default ThemeConfig;
