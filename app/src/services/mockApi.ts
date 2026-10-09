import { load, save } from "./mockDb";
import {
  CATEGORIES,
  DEMO_USER_ID,
  makeBudgets,
  makeExpenses,
  makeUsers,
} from "./seed";
import type { StoredBudget } from "./seed";
import type {
  Budget,
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


// bugdget function

function computeBudget(userId: string, stored: StoredBudget): Budget {
 
  const spent = load<Expense[]>(KEYS.expenses, [])
    .filter((ex) => ex.userId === userId && ex.date.startsWith(stored.month))
    .reduce((sum, ex) => sum + ex.amount, 0);

  const remaining = stored.amount - spent;
  
  let status: Budget["status"];
  if (remaining < 0) status = "over";
  else if (spent >= stored.amount * 0.75) status = "approaching";
  else status = "within";

  return {
    _id: stored._id,
    userId: stored.userId,
    month: stored.month,
    amount: stored.amount,
    spent,
    remaining,
    status,
    createdAt: stored.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}


export async function getBudget(
  userId: string,
  month: string
): Promise<Budget | null> {
  await delay();
  seedOnce();
  const stored = load<StoredBudget[]>(KEYS.budgets, []).find(
    (b) => b.userId === userId && b.month === month
  );
  return stored ? computeBudget(userId, stored) : null;
}


export async function upsertBudget(
  userId: string,
  month: string,
  amount: number
): Promise<Budget> {
  await delay();
  seedOnce();
  const budgets = load<StoredBudget[]>(KEYS.budgets, []);
  let stored = budgets.find((b) => b.userId === userId && b.month === month);
  const now = new Date().toISOString();

  if (!stored) {
    stored = { _id: uid("budget_"), userId, month, amount, createdAt: now };
    budgets.push(stored);
  } else {
    stored.amount = amount;
    stored.updatedAt = now;
  }
  save(KEYS.budgets, budgets);
  return computeBudget(userId, stored);
}


export async function createCategory(name: string): Promise<Category> {
  await delay();
  seedOnce();
  const categories = load<Category[]>(KEYS.categories, []);
  const category: Category = {
    _id: uid("cat_"),
    name,
    isDefault: false,
  };
  categories.push(category);
  save(KEYS.categories, categories);
  return category;
}


export async function updateCategory(id: string, name: string): Promise<Category> {
  await delay();
  seedOnce();
  const categories = load<Category[]>(KEYS.categories, []);
  const category = categories.find((c) => c._id === id);
  if (!category) throw new Error("Category not found");
  category.name = name;
  save(KEYS.categories, categories);
  return category;
}


export async function deleteCategory(id: string): Promise<void> {
  await delay();
  seedOnce();
  const categories = load<Category[]>(KEYS.categories, []);
  const target = categories.find((c) => c._id === id);
  if (!target) throw new Error("Category not found");
  if (target.isDefault) throw new Error("Cannot delete the default category");

  const defaultCat = categories.find((c) => c.isDefault)!;
  save(
    KEYS.expenses,
    load<Expense[]>(KEYS.expenses, []).map((ex) =>
      categoryId(ex.category) === id ? { ...ex, category: defaultCat } : ex
    )
  );
  save(
    KEYS.categories,
    categories.filter((c) => c._id !== id)
  );
}

interface AuthResult {
  token: string;
  user: User;
}

function signUser(user: User): AuthResult {
  // pseudo-token: bearer.<userId>.<timestamp>
  return { token: `mock.${user._id}.${Date.now()}`, user };
}


export async function signUp(
  name: string,
  email: string,
  _password: string // unused in the mock (no hashing yet) — the _ prefix tells TS that's intentional
): Promise<AuthResult> {
  await delay();
  seedOnce();
  const users = load<User[]>(KEYS.users, []);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already registered");
  }
  const user: User = {
    _id: uid("u_"),
    name,
    email,
    role: "user",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  save(KEYS.users, users);
  return signUser(user);
}


export async function signIn(email: string, password: string): Promise<AuthResult> {
  await delay();
  seedOnce();
  const user = load<User[]>(KEYS.users, []).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user || password !== "password") throw new Error("Invalid email or password");
  return signUser(user);
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