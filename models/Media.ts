import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedia extends Document {
  name: string;
  url: string;
  publicId?: string;
  format?: string;
  size?: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  credit?: string;
  uploadedBy?: string;
  createdAt: Date;
}

const MediaSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    format: { type: String, default: "jpg" },
    size: { type: Number, default: 0 },
    width: { type: Number, default: 1200 },
    height: { type: Number, default: 800 },
    altText: { type: String, default: "" },
    caption: { type: String, default: "" },
    credit: { type: String, default: "" },
    uploadedBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

MediaSchema.index({ createdAt: -1 });

const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);

export default Media;
