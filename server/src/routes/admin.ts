import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { Category } from "../models/category";
import { Expense } from "../models/expense";
import { User } from "../models/user";

const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/insights", async (_req, res) => {
  const month = new Date().toISOString().slice(0, 7);
  const start = `${month}-01`;
  const end = `${month}-31`;

  const [totalUsers, totalExpenses, monthExpenses, categories, recentExpenses, recentUsersDocs] =
    await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      Expense.countDocuments({ date: { $gte: start, $lte: end } }),
      Category.find().sort({ name: 1 }),
      Expense.find().sort({ createdAt: -1 }).limit(5),
      User.find().sort({ createdAt: -1 }).limit(5),
    ]);

  const allExpenses = await Expense.find({});
  const totalValue = allExpenses.reduce((sum, ex) => sum + ex.amount, 0);

  // totals + usage 
  const map = new Map<string, { name: string; count: number; total: number }>();
  for (const ex of allExpenses) {
    const id = ex.category.toString();
    const cat = categories.find((c) => c._id.equals(ex.category));
    const current = map.get(id) ?? { name: cat?.name ?? "Unknown", count: 0, total: 0 };
    current.count += 1;
    current.total += ex.amount;
    map.set(id, current);
  }
  const perCategory = [...map.values()].sort((a, b) => b.count - a.count);
  const topCategories = perCategory.slice(0, 5);
  const bottomCategories = [...perCategory].sort((a, b) => a.count - b.count).slice(0, 5);

  const recentUsers = recentUsersDocs.map((u) => ({
    _id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));

  res.json({
    totalUsers,
    totalExpenses,
    totalValue,
    monthExpenses,
    perCategory,
    topCategories,
    bottomCategories,
    recentExpenses,
    recentUsers,
  });
});
export default router;