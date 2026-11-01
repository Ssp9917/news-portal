import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComment extends Document {
  articleId: string;
  articleSlug: string;
  authorId?: string | null;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  content: string;
  isApproved: boolean;
  likes: number;
  likedByIdentifiers: string[];
  reported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    articleId: { type: String, required: true, index: true },
    articleSlug: { type: String, required: true, index: true },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    authorName: { type: String, required: true, trim: true },
    authorEmail: { type: String, required: true, trim: true },
    authorAvatar: { type: String, default: "" },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    isApproved: { type: Boolean, default: true, index: true }, // Default approved with spam/moderation filter
    likes: { type: Number, default: 0 },
    likedByIdentifiers: { type: [String], default: [] },
    reported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ articleId: 1, isApproved: 1, createdAt: -1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
