import { load, save } from "./mockDb";
import {
  CATEGORIES,
  DEMO_USER_ID,
  makeBudgets,
  makeExpenses,
  makeUsers,
} from "./seed";
import type {
  Category,
  Expense,
  ExpenseFilters,
  Paginated,
  User,
} from "../types";


// localStorage key names
const KEYS = {
  users: "users",
  categories: "categories",
  expenses: "expenses",
  budgets: "budgets",
} as const;

let seeded = false;

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function seedOnce(): void {
  if (seeded) return;
  seeded = true;
  if (!load<unknown>(KEYS.users, null)) save(KEYS.users, makeUsers());
  if (!load<unknown>(KEYS.categories, null)) save(KEYS.categories, CATEGORIES);
  if (!load<unknown>(KEYS.expenses, null)) save(KEYS.expenses, makeExpenses());
  if (!load<unknown>(KEYS.budgets, null)) save(KEYS.budgets, makeBudgets());
}

function categoryId(cat: Category | string): string {
  return typeof cat === "string" ? cat : cat._id;
}

function populated(cat: Category | string): Category {
  if (typeof cat !== "string") return cat;
  return (
    load<Category[]>(KEYS.categories, []).find((c) => c._id === cat) ??
    CATEGORIES[0]
  );
}


// GET /api/expenses
export async function listExpenses(filters: ExpenseFilters): Promise<Paginated<Expense>> {
  await delay();
  seedOnce();
  const all = load<Expense[]>(KEYS.expenses, []);
  let items = [...all];

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    items = items.filter(
      (ex) => ex.title.toLowerCase().includes(q) || (ex.notes ?? "").toLowerCase().includes(q)
    );
  }
  if (filters.category !== "all") {
    items = items.filter((ex) => categoryId(ex.category) === filters.category);
  }
  if (filters.paymentMethod !== "all") {
    items = items.filter((ex) => ex.paymentMethod === filters.paymentMethod);
  }
  if (filters.dateFrom) items = items.filter((ex) => ex.date >= filters.dateFrom);
  if (filters.dateTo) items = items.filter((ex) => ex.date <= filters.dateTo);
  if (filters.minAmount) items = items.filter((ex) => ex.amount >= Number(filters.minAmount));
  if (filters.maxAmount) items = items.filter((ex) => ex.amount <= Number(filters.maxAmount));

  const dir = filters.order === "asc" ? 1 : -1;
  items.sort((a, b) => {
    if (filters.sortBy === "amount") return dir * (a.amount - b.amount);
    const av = String(a[filters.sortBy]);
    const bv = String(b[filters.sortBy]);
    return dir * av.localeCompare(bv);
  });

   //  Paginate
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / filters.limit));
  const page = Math.min(filters.page, pages);
  const data = items.slice((page - 1) * filters.limit, page * filters.limit);
  return { data, total, page, pages, limit: filters.limit };
}

export async function createExpense(
  input: Omit<Expense, "_id" | "userId" | "createdAt" | "updatedAt">
): Promise<Expense> {
  await delay();
  seedOnce();
  const all = load<Expense[]>(KEYS.expenses, []);
  const now = new Date().toISOString();
  const expense: Expense = {
    ...input,
    category: populated(input.category),
    _id: uid("exp_"),
    userId: DEMO_USER_ID,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(expense);
  save(KEYS.expenses, all);
  return expense;
}

export async function updateExpense(
  id: string,
  patch: Partial<Omit<Expense, "_id" | "userId" | "createdAt" | "updatedAt">>
): Promise<Expense> {
  await delay();
  seedOnce();
  const all = load<Expense[]>(KEYS.expenses, []);
  const index = all.findIndex((ex) => ex._id === id);
  if (index === -1) throw new Error("Expense not found");
  const updated: Expense = {
    ...all[index],
    ...patch,
    category: patch.category ? populated(patch.category) : all[index].category,
    updatedAt: new Date().toISOString(),
  };
  all[index] = updated;
  save(KEYS.expenses, all);
  return updated;
}

export async function deleteExpense(id: string): Promise<void> {
  await delay();
  seedOnce();
  save(
    KEYS.expenses,
    load<Expense[]>(KEYS.expenses, []).filter((ex) => ex._id !== id)
  );
}

export async function listCategories(): Promise<Category[]> {
  await delay();
  seedOnce();
  return load<Category[]>(KEYS.categories, []);
}