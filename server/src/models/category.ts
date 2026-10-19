import { Schema, model } from "mongoose";

export interface CategoryDoc {
  name: string;
  isDefault: boolean;
}

const categorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Category = model<CategoryDoc>("Category", categorySchema);