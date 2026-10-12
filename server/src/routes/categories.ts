import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { Category } from "../models/Category";
import { Expense } from "../models/Expense";

const router = Router();
router.use(requireAuth);
router.get("/", async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});
router.post("/", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name) {
    res.status(400).json({ message: "Name is required" });
    return;
  }
  const category = await Category.create({ name, isDefault: false });
  res.status(201).json(category);
});
router.put("/:id", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name) {
    res.status(400).json({ message: "Name is required" });
    return;
  }
  const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
  if (!category) {
    res.status(404).json({ message: "Category not found" });
    return;
  }
  res.json(category);
});
router.delete("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404).json({ message: "Category not found" });
    return;
  }
  if (category.isDefault) {
    res.status(400).json({ message: "Cannot delete the default category" });
    return;
  }
  // reassign expenses
  const fallback = await Category.findOne({ isDefault: true });
  if (fallback) {
    await Expense.updateMany({ category: category._id }, { category: fallback._id });
  }
  await category.deleteOne();
  res.status(204).end();
});

export default router;