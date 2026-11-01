import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface IPoll extends Document {
  question: string;
  category: string;
  options: IPollOption[];
  totalVotes: number;
  voterIdentifiers: string[]; // Store user IDs or hashed visitor tokens
  isActive: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PollOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    votes: { type: Number, default: 0 },
  },
  { _id: false }
);

const PollSchema: Schema<IPoll> = new Schema(
  {
    question: { type: String, required: true },
    category: { type: String, default: "राष्ट्रीय" },
    options: { type: [PollOptionSchema], required: true },
    totalVotes: { type: Number, default: 0 },
    voterIdentifiers: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Poll: Model<IPoll> =
  mongoose.models.Poll || mongoose.model<IPoll>("Poll", PollSchema);

export default Poll;
