import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { Expense } from "../models/expense";

const router = Router();
router.use(requireAuth);

const SORT_KEYS = ["date", "amount", "title", "createdAt"] as const;
router.get("/", async (req, res) => {
  const q = req.query;
  const filter: Record<string, unknown> = { userId: res.locals.userId };

  if (typeof q.search === "string" && q.search.trim()) {
    const regex = new RegExp(q.search.trim(), "i");
    filter.$or = [{ title: regex }, { notes: regex }];
  }
  if (typeof q.category === "string" && q.category !== "all") filter.category = q.category;
  if (typeof q.paymentMethod === "string" && q.paymentMethod !== "all") {
    filter.paymentMethod = q.paymentMethod;
  }

  const dateFilter: Record<string, unknown> = {};
  if (typeof q.dateFrom === "string" && q.dateFrom) dateFilter.$gte = q.dateFrom;
  if (typeof q.dateTo === "string" && q.dateTo) dateFilter.$lte = q.dateTo;
  if (Object.keys(dateFilter).length > 0) filter.date = dateFilter;

  const amountFilter: Record<string, unknown> = {};
  if (typeof q.minAmount === "string" && q.minAmount !== "" && !Number.isNaN(Number(q.minAmount))) {
    amountFilter.$gte = Number(q.minAmount);
  }
  if (typeof q.maxAmount === "string" && q.maxAmount !== "" && !Number.isNaN(Number(q.maxAmount))) {
    amountFilter.$lte = Number(q.maxAmount);
  }
  if (Object.keys(amountFilter).length > 0) filter.amount = amountFilter;

  const sortBy =
    typeof q.sortBy === "string" && (SORT_KEYS as readonly string[]).includes(q.sortBy)
      ? q.sortBy
      : "date";
  const order = q.order === "asc" ? 1 : -1;

  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 10));

  const total = await Expense.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, pages);
  const data = await Expense.find(filter)
    .sort({ [sortBy]: order })
    .skip((safePage - 1) * limit)
    .limit(limit);

  res.json({ data, total, page: safePage, pages, limit });
});

router.post("/", async (req, res) => {
  const { title, amount, category, date, paymentMethod, notes } = req.body ?? {};
  if (!title || amount == null || !category || !date || !paymentMethod) {
    res.status(400).json({ message: "Missing required expense fields" });
    return;
  }
  const expense = await Expense.create({
    userId: res.locals.userId,
    title,
    amount,
    category,
    date,
    paymentMethod,
    notes,
  });
  res.status(201).json(expense);
});

router.put("/:id", async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: res.locals.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!expense) {
    res.status(404).json({ message: "Expense not found" });
    return;
  }
  res.json(expense);
});
router.delete("/:id", async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: res.locals.userId });
  if (!expense) {
    res.status(404).json({ message: "Expense not found" });
    return;
  }
  res.status(204).end();
});
export default router;