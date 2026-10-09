export type Role = "user" | "admin";

export type PaymentMethod = "cash" | "card" | "bank_transfer" | "other";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  isDefault: boolean;
}

export interface Expense {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  category: Category | string;
  date: string; // ISO date (YYYY-MM-DD)
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  _id: string;
  userId: string;
  month: string; // "YYYY-MM"
  amount: number;
  spent: number;
  remaining: number;
  status: "within" | "approaching" | "over";
  createdAt: string;
  updatedAt: string;
}

export type ExpenseSortKey = "date" | "amount" | "title" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface ExpenseFilters {
  search: string;
  category: string; // category _id, or "all"
  paymentMethod: PaymentMethod | "all";
  dateFrom: string; // "" = no filter
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  sortBy: ExpenseSortKey;
  order: SortOrder;
  page: number;
  limit: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}