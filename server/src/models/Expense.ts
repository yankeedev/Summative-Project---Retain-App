import { Schema, model, type Types } from "mongoose";

const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "other"] as const;

export interface ExpenseDoc {
  userId: Types.ObjectId;
  title: string;
  amount: number;
  category: Types.ObjectId;
  date: string; // YYYY-MM-DD
  paymentMethod: (typeof PAYMENT_METHODS)[number];
  notes?: string;
}

const expenseSchema = new Schema<ExpenseDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    date: { type: String, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Expense = model<ExpenseDoc>("Expense", expenseSchema);