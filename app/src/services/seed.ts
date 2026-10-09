import type { Category, Expense, User } from "../types";

export const DEMO_USER_ID = "u_demo";
export const ADMIN_USER_ID = "u_admin";

export const CATEGORIES: Category[] = [
  { _id: "cat_uncategorized", name: "Uncategorized", isDefault: true },
  { _id: "cat_food", name: "Food & Dining", isDefault: false },
  { _id: "cat_groceries", name: "Groceries", isDefault: false },
  { _id: "cat_transport", name: "Transport", isDefault: false },
  { _id: "cat_rent", name: "Rent & Housing", isDefault: false },
  { _id: "cat_entertainment", name: "Entertainment", isDefault: false },
  { _id: "cat_health", name: "Health", isDefault: false },
];

export interface StoredBudget {
   _id: string;
  userId: string;
  month: string; // "YYYY-MM"
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}

export function makeUsers(): User[] {
  return [
    { _id: ADMIN_USER_ID, name: "Admin", email: "admin@retain.app", role: "admin", createdAt: isoNow() },
    { _id: DEMO_USER_ID, name: "Demo User", email: "demo@retain.app", role: "user", createdAt: isoNow() },
  ];
}

export function makeExpenses(): Expense[] {
  const cat = (id: string): Category => CATEGORIES.find((c) => c._id === id)!;
  const e = (days: number, title: string, amount: number, category: string, paymentMethod: Expense["paymentMethod"], notes?: string): Expense => {
    const created = isoNow();
    return {
      _id: `exp_${Math.random().toString(36).slice(2, 10)}`,
      userId: DEMO_USER_ID,
      title,
      amount,
      category: cat(category),
      date: isoDaysAgo(days),
      paymentMethod,
      notes,
      createdAt: created,
      updatedAt: created,
    };
  };

  return [
    e(1, "Lunch at cafe", 18.5, "cat_food", "card"),
    e(2, "Weekly groceries", 85.2, "cat_groceries", "card"),
    e(2, "Bus pass top-up", 40, "cat_transport", "cash"),
    e(4, "Movie night", 30, "cat_entertainment", "card"),
    e(5, "Gas refill", 55, "cat_transport", "card"),
    e(7, "Pharmacy", 24.75, "cat_health", "card"),
    e(8, "Dinner out", 64, "cat_food", "card"),
    e(10, "Online subscription", 12.99, "cat_entertainment", "card"),
    e(12, "Gym membership", 45, "cat_health", "bank_transfer"),
    e(14, "Restaurant weekend", 78, "cat_food", "card"),
    e(16, "Electricity bill", 96, "cat_rent", "bank_transfer"),
    e(18, "Farmers market", 42.3, "cat_groceries", "cash"),
    e(21, "Birthday gift", 35, "cat_entertainment", "card"),
    e(24, "Internet bill", 59.99, "cat_rent", "bank_transfer"),
    e(28, "Coffee beans", 15, "cat_food", "cash"),
    e(33, "Bookstore", 27.5, "cat_entertainment", "card"),
    e(40, "Car wash", 20, "cat_transport", "cash"),
    e(47, "Dental checkup", 120, "cat_health", "card"),
  ];
}

export function makeBudgets(): StoredBudget[] {
  const month = isoNow().slice(0, 7);
  return [
    { _id: "budget_1", userId: DEMO_USER_ID, month, amount: 2000 },
    { _id: "budget_2", userId: ADMIN_USER_ID, month, amount: 9999 },
  ];
}