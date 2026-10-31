import mongoose, { Schema, Document, Model } from "mongoose";

export interface INavItem {
  id: string;
  label: string;
  labelHi?: string;
  href: string;
  isExternal?: boolean;
  order: number;
  isEnabled: boolean;
  children?: { label: string; href: string }[];
}

export interface INavigationConfig extends Document {
  headerLinks: INavItem[];
  footerGroups: {
    title: string;
    links: { label: string; href: string }[];
  }[];
  tenantId?: string | null;
  updatedAt: Date;
}

const NavItemSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    labelHi: { type: String, default: "" },
    href: { type: String, required: true },
    isExternal: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isEnabled: { type: Boolean, default: true },
    children: [
      {
        label: { type: String, default: "" },
        href: { type: String, default: "" },
      },
    ],
  },
  { _id: false }
);

const NavigationConfigSchema: Schema = new Schema(
  {
    headerLinks: { type: [NavItemSchema], default: [] },
    footerGroups: [
      {
        title: { type: String, default: "" },
        links: [
          {
            label: { type: String, default: "" },
            href: { type: String, default: "" },
          },
        ],
      },
    ],
    tenantId: { type: String, default: null },
  },
  { timestamps: true }
);

const NavigationConfig: Model<INavigationConfig> =
  mongoose.models.NavigationConfig ||
  mongoose.model<INavigationConfig>("NavigationConfig", NavigationConfigSchema);

export default NavigationConfig;
