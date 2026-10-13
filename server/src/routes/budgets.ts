import { Router } from "express";
import type { Types } from "mongoose";
import { requireAuth } from "../middleware/auth";
import { Budget } from "../models/Budget";
import { Expense } from "../models/Expense";

const router = Router();
router.use(requireAuth);

type Status = "within" | "approaching" | "over";

interface StoredBudgetShape {
  _id: unknown;
  userId: Types.ObjectId;
  month: string;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// recompute spent/remaining/status for a stored budget
async function buildBudget(stored: StoredBudgetShape) {
  const expenses = await Expense.find({
    userId: stored.userId,
    date: { $gte: `${stored.month}-01`, $lte: `${stored.month}-31` },
  });
  const spent = expenses.reduce((sum, ex) => sum + ex.amount, 0);
  const remaining = stored.amount - spent;
  const status: Status =
    remaining < 0 ? "over" : spent >= stored.amount * 0.75 ? "approaching" : "within";
  return {
    _id: stored._id,
    userId: stored.userId,
    month: stored.month,
    amount: stored.amount,
    spent,
    remaining,
    status,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  };
}

router.get("/:month", async (req, res) => {
  const stored = await Budget.findOne({ userId: res.locals.userId, month: req.params.month });
  if (!stored) {
    res.json(null);
    return;
  }
  res.json(await buildBudget(stored));
});

router.put("/:month", async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ message: "Amount must be a positive number" });
    return;
  }
  const stored = await Budget.findOneAndUpdate(
    { userId: res.locals.userId, month: req.params.month },
    { amount },
    { new: true, upsert: true, runValidators: true }
  );
  res.json(await buildBudget(stored!));
});

export default router;