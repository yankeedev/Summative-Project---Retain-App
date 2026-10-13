import { Schema, model, type Types } from "mongoose";

export interface BudgetDoc {
  userId: Types.ObjectId;
  month: string; // YYYY-MM
  amount: number;
}

const budgetSchema = new Schema<BudgetDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

export const Budget = model<BudgetDoc>("Budget", budgetSchema);