import bcrypt from "bcryptjs";
import { Category } from "../models/category";
import { User } from "../models/user";

const DEFAULT_CATEGORIES = [
  "Groceries",
  "Transport",
  "Dining out",
  "Utilities",
  "Entertainment",
  "Other",
];
export async function seedDefaults(): Promise<void> {
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((name, i) => ({
        name,
        //fallback
        isDefault: i === DEFAULT_CATEGORIES.length - 1, 
      }))
    );
  }
  if ((await User.countDocuments()) === 0) {
    const password = await bcrypt.hash("password", 10);
    await User.insertMany([
      { name: "Demo User", email: "demo@retain.app", password, role: "user" },
      { name: "Admin User", email: "admin@retain.app", password, role: "admin" },
    ]);
  }
}