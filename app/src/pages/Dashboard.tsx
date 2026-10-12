import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { getBudget, listCategories, listExpenses } from "../services/mockApi";
import type { Budget, Category, Expense } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// first day 
function monthBounds(month: string): [string, string] {
  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  return [`${month}-01`, `${month}-${String(lastDay).padStart(2, "0")}`];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [month] = useState(() => new Date().toISOString().slice(0, 7));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(): Promise<void> {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [from, to] = monthBounds(month);
      const [expensePage, cats, b] = await Promise.all([
        listExpenses({
          search: "",
          category: "all",
          paymentMethod: "all",
          dateFrom: from,
          dateTo: to,
          minAmount: "",
          maxAmount: "",
          sortBy: "date",
          order: "desc",
          page: 1,
          limit: 50,
        }),
        listCategories(),
        getBudget(user._id, month),
      ]);
      setExpenses(expensePage.data);
      setCategories(cats);
      setBudget(b);
    } catch {
      setError("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user, month]);

  const totalSpent = expenses.reduce((sum, ex) => sum + ex.amount, 0);

  const topExpense = expenses.reduce<Expense | null>(
    (best, ex) => (best && best.amount >= ex.amount ? best : ex),
    null
  );

  // goup by category
  const byCategory = useMemo(() => {
    const map = new Map<string, { name: string; total: number }>();
    for (const ex of expenses) {
      const id = typeof ex.category === "string" ? ex.category : ex.category._id;
      const name =
        typeof ex.category === "string"
          ? (categories.find((c) => c._id === id)?.name ?? "Other")
          : ex.category.name;
      const current = map.get(id) ?? { name, total: 0 };
      current.total += ex.amount;
      map.set(id, current);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [expenses, categories]);

  const richestCategory = byCategory[0]?.total ?? 0;
  const percentOfBudget =
    budget && budget.amount > 0
      ? Math.min(100, Math.round((budget.spent / budget.amount) * 100))
      : 0;

  if (loading) {
    return <CircularProgress sx={{ my: 4, display: "block", mx: "auto" }} />;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name.split(" ")[0] ?? "friend"}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 2,
          mb: 4,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Spent in {month}</Typography>
            <Typography variant="h6">{currency.format(totalSpent)}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Budget left</Typography>
            <Typography variant="h6">
              {budget ? currency.format(budget.remaining) : "—"}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Transactions</Typography>
            <Typography variant="h6">{expenses.length}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Biggest expense</Typography>
            <Typography variant="h6">
              {topExpense ? currency.format(topExpense.amount) : "—"}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { md: "1fr 1fr" }, gap: 3 }}>
        {/* spending by category */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Spending by category</Typography>
            {byCategory.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No expenses this month yet.
              </Typography>
            )}
            {byCategory.map((c) => {
              const width =
                richestCategory > 0 ? Math.round((c.total / richestCategory) * 100) : 0;
              return (
                <Box key={c.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2">{c.name}</Typography>
                    <Typography variant="body2">{currency.format(c.total)}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={width}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              );
            })}

            {budget && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Budget used: {percentOfBudget}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={percentOfBudget}
                  color={budget.status === "within" ? "success" : "warning"}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* recent expenses */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent expenses</Typography>
            {expenses.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nothing recorded this month.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.slice(0, 5).map((ex) => (
                      <TableRow key={ex._id}>
                        <TableCell>{new Date(ex.date).toLocaleDateString()}</TableCell>
                        <TableCell>{ex.title}</TableCell>
                        <TableCell align="right">{currency.format(ex.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
}