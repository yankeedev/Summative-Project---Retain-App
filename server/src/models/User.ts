import { Schema, model } from "mongoose";

const ROLES = ["user", "admin"] as const;

export interface UserDoc {
  name: string;
  email: string;
  password: string;
  role: (typeof ROLES)[number];
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "user" },
  },
  { timestamps: true }
);

export const User = model<UserDoc>("User", userSchema);