import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth";
import { Budget } from "../models/budget";
import { Expense } from "../models/expense";

const router = Router();
router.use(requireAuth);

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

type Status = "within" | "approaching" | "over";

router.get("/", async (req, res) => {
  const month =
    typeof req.query.month === "string" && req.query.month
      ? req.query.month
      : new Date().toISOString().slice(0, 7);
  if (!MONTH_PATTERN.test(month)) {
    res.status(400).json({ message: "month must be in YYYY-MM format" });
    return;
  }

  const userId = new mongoose.Types.ObjectId(res.locals.userId);
  const match = { userId, date: { $gte: `${month}-01`, $lte: `${month}-31` } };

  const [summary, highest, byCategory, recent, storedBudget] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
    ]),
    Expense.findOne(match).sort({ amount: -1 }),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: { $ifNull: ["$category.name", "Other"] },
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]),
    Expense.find(match).sort({ date: -1, createdAt: -1 }).limit(6),
    Budget.findOne({ userId: res.locals.userId, month }),
  ]);

  const totalSpent: number = summary[0]?.totalSpent ?? 0;
  const count: number = summary[0]?.count ?? 0;
  const avgAmount: number = summary[0]?.avgAmount ?? 0;

  let budget: {
    amount: number;
    spent: number;
    remaining: number;
    status: Status;
  } | null = null;
  if (storedBudget) {
    const remaining = storedBudget.amount - totalSpent;
    const status: Status =
      remaining < 0 ? "over" : totalSpent >= storedBudget.amount * 0.75 ? "approaching" : "within";
    budget = { amount: storedBudget.amount, spent: totalSpent, remaining, status };
  }

  res.json({
    month,
    totalSpent,
    count,
    avgAmount,
    highest,
    byCategory,
    recent,
    budget,
  });
});

export default router;
