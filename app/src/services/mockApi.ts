import api, { apiError } from "./api";
import type {
  Budget,
  Category,
  Expense,
  ExpenseFilters,
  Paginated,
  User,
} from "../types";

interface AuthResult {
  token: string;
  user: User;
}

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data } = await api.post<AuthResult>("/auth/signup", { name, email, password });
    return data;
  } catch (err) {
    throw apiError(err);
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { data } = await api.post<AuthResult>("/auth/signin", { email, password });
    return data;
  } catch (err) {
    throw apiError(err);
  }
}

export async function listExpenses(filters: ExpenseFilters): Promise<Paginated<Expense>> {
  try {
    const { data } = await api.get<Paginated<Expense>>("/expenses", { params: filters });
    return data;
  } catch (err) {
    throw apiError(err);
  }
}

export async function createExpense(
  input: Omit<Expense, "_id" | "userId" | "createdAt" | "updatedAt">
): Promise<Expense> {
  try {
    const { data } = await api.post<Expense>("/expenses", input);
    return data;
  } catch (err) {
    throw apiError(err);
  }
}

export async function updateExpense(
  id: string,
  patch: Partial<Omit<Expense, "_id" | "userId" | "createdAt" | "updatedAt">>
): Promise<Expense> {
  try {
    const { data } = await api.put<Expense>(`/expenses/${id}`, patch);
    return data;
  } catch (err) {
    throw apiError(err);
  }
}
export async function deleteExpense(id: string): Promise<void> {
  try {
    await api.delete(`/expenses/${id}`);
  } catch (err) {
    throw apiError(err);
  }
}
export async function listCategories(): Promise<Category[]> {
  try {
    const { data } = await api.get<Category[]>("/categories");
    return data;
  } catch (err) {
    throw apiError(err);
  }
}

export async function createCategory(name: string): Promise<Category> {
  try {
    const { data } = await api.post<Category>("/categories", { name });
    return data;
  } catch (err) {
    throw apiError(err);
  }
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  try {
    const { data } = await api.put<Category>(`/categories/${id}`, { name });
    return data;
  } catch (err) {
    throw apiError(err);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await api.delete(`/categories/${id}`);
  } catch (err) {
    throw apiError(err);
  }
}

// the API derives the user from the JWT, so the userId arg is unused
export async function getBudget(_userId: string, month: string): Promise<Budget | null> {
  try {
    const { data } = await api.get<Budget | null>(`/budgets/${month}`);
    return data;
  } catch (err) {
    throw apiError(err);
  }
}

export async function upsertBudget(
  _userId: string,
  month: string,
  amount: number
): Promise<Budget> {
  try {
    const { data } = await api.put<Budget>(`/budgets/${month}`, { amount });
    return data;
  } catch (err) {
    throw apiError(err);
  }
}