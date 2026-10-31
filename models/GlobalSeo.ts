import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGlobalSeo extends Document {
  siteTitle: string;
  siteTagline: string;
  metaDescription: string;
  defaultOgImage: string;
  faviconUrl: string;
  canonicalBaseUrl: string;
  googleVerification: string;
  bingVerification: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  organizationName: string;
  organizationLogo: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
    telegram: string;
    whatsapp: string;
  };
  enableGoogleNewsSitemap: boolean;
  robotsTxtCustom: string;
  updatedAt: Date;
}

const GlobalSeoSchema: Schema = new Schema(
  {
    siteTitle: { type: String, default: "Daily Latest News | राष्ट्र की आवाज़" },
    siteTagline: { type: String, default: "राष्ट्र की निष्पक्ष और निर्भीक आवाज़" },
    metaDescription: {
      type: String,
      default:
        "भारत और विश्व की ताज़ा ख़बरें, राजनीति, खेल, तकनीक, व्यापार और विश्लेषण। निष्पक्ष पत्रकारिता का विश्वसनीय मंच।",
    },
    defaultOgImage: { type: String, default: "/og-default.png" },
    faviconUrl: { type: String, default: "/favicon.svg" },
    canonicalBaseUrl: { type: String, default: "http://localhost:3000" },
    googleVerification: { type: String, default: "" },
    bingVerification: { type: String, default: "" },
    googleAnalyticsId: { type: String, default: "G-LDC5ZD9S53" },
    googleTagManagerId: { type: String, default: "GTM-WDNCFQS5" },
    organizationName: { type: String, default: "Daily Latest News Network" },
    organizationLogo: { type: String, default: "/favicon.svg" },
    socialLinks: {
      twitter: { type: String, default: "https://twitter.com" },
      facebook: { type: String, default: "https://facebook.com" },
      instagram: { type: String, default: "https://instagram.com" },
      youtube: { type: String, default: "https://youtube.com" },
      telegram: { type: String, default: "https://t.me" },
      whatsapp: { type: String, default: "" },
    },
    enableGoogleNewsSitemap: { type: Boolean, default: true },
    robotsTxtCustom: { type: String, default: "" },
  },
  { timestamps: true }
);

const GlobalSeo: Model<IGlobalSeo> =
  mongoose.models.GlobalSeo ||
  mongoose.model<IGlobalSeo>("GlobalSeo", GlobalSeoSchema);

export default GlobalSeo;
