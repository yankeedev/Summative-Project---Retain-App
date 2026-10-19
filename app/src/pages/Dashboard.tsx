import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  CreditCard as CardIcon,
  LocalAtm as CashIcon,
  ReceiptLongOutlined as ReceiptIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getBudget, listCategories, listExpenses } from "../services/mockApi";
import type { Budget, Category, Expense, PaymentMethod } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Category color palette for modern visual tags
const CATEGORY_COLORS = [
  "#4f46e5", // Indigo
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#64748b", // Slate
];

function monthBounds(month: string): [string, string] {
  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  return [`${month}-01`, `${month}-${String(lastDay).padStart(2, "0")}`];
}

function paymentIcon(method: PaymentMethod) {
  switch (method) {
    case "card":
      return <CardIcon sx={{ fontSize: 14 }} />;
    case "cash":
      return <CashIcon sx={{ fontSize: 14 }} />;
    default:
      return <ReceiptIcon sx={{ fontSize: 14 }} />;
  }
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

  const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

  // Group spending by category
  const byCategory = useMemo(() => {
    const map = new Map<string, { id: string; name: string; total: number; count: number }>();
    for (const ex of expenses) {
      const id = typeof ex.category === "string" ? ex.category : ex.category._id;
      const name =
        typeof ex.category === "string"
          ? (categories.find((c) => c._id === id)?.name ?? "Other")
          : ex.category.name;
      const current = map.get(id) ?? { id, name, total: 0, count: 0 };
      current.total += ex.amount;
      current.count += 1;
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
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={44} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, textAlign: "left" }}>
      {/* Header Banner */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "text.primary",
              mb: 0.5,
            }}
          >
            Welcome back, {user?.name.split(" ")[0] ?? "friend"}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Here is your financial summary and monthly spending breakdown.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            label={`Period: ${month}`}
            variant="outlined"
            sx={{ fontWeight: 600, bgcolor: "background.paper" }}
          />
          <Button
            variant="contained"
            component={Link}
            to="/expenses"
            endIcon={<ArrowForwardIcon fontSize="small" />}
            sx={{ borderRadius: "10px" }}
          >
            Manage expenses
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* 4 KPI Metric Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2.5,
        }}
      >
        {/* KPI 1: Spent */}
        <Card
          sx={{
            p: 0.5,
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
            "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px -4px rgba(79, 70, 229, 0.12)" },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Total spent
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.02em", mb: 0.5 }}>
              {currency.format(totalSpent)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Recorded in current month
            </Typography>
          </CardContent>
        </Card>

        {/* KPI 2: Budget Left */}
        <Card
          sx={{
            p: 0.5,
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
            "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px -4px rgba(16, 185, 129, 0.12)" },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Budget remaining
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                mb: 0.5,
                color: budget && budget.remaining < 0 ? "error.main" : "text.primary",
              }}
            >
              {budget ? currency.format(budget.remaining) : "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {budget ? `${percentOfBudget}% of limit used` : "No budget set for this month"}
            </Typography>
          </CardContent>
        </Card>

        {/* KPI 3: Transactions */}
        <Card
          sx={{
            p: 0.5,
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
            "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px -4px rgba(14, 165, 233, 0.12)" },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Transactions
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.02em", mb: 0.5 }}>
              {expenses.length}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Avg. {currency.format(avgExpense)} / transaction
            </Typography>
          </CardContent>
        </Card>

        {/* KPI 4: Biggest Expense */}
        <Card
          sx={{
            p: 0.5,
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
            "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px -4px rgba(244, 63, 94, 0.12)" },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              Highest expense
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.02em", mb: 0.5 }}>
              {topExpense ? currency.format(topExpense.amount) : "—"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
              {topExpense ? topExpense.title : "None yet"}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Grid: Spending By Category & Recent Expenses */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.1fr 1fr" }, gap: 3 }}>
        {/* Card: Spending By Category */}
        <Card sx={{ borderRadius: "18px", border: "1px solid #e2e8f0", bgcolor: "#fff", p: 1 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Spending by Category
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Distribution across active expense groups
                </Typography>
              </Box>
              <Chip
                label={`${byCategory.length} categories`}
                size="small"
                sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
              />
            </Box>

            {byCategory.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">No expenses recorded for this month yet.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
                {byCategory.map((cat, idx) => {
                  const percentOfTotal = totalSpent > 0 ? Math.round((cat.total / totalSpent) * 100) : 0;
                  const barWidth = richestCategory > 0 ? Math.round((cat.total / richestCategory) * 100) : 0;
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

                  return (
                    <Box key={cat.id}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
                          <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
                            {cat.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            ({cat.count} items)
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2">
                            {currency.format(cat.total)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", minWidth: 36, textAlign: "right" }}>
                            {percentOfTotal}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ width: "100%", height: 8, bgcolor: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                        <Box
                          sx={{
                            width: `${barWidth}%`,
                            height: "100%",
                            bgcolor: color,
                            borderRadius: 4,
                            transition: "width 0.5s ease-in-out",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Budget status box inside category card */}
            {budget && (
              <Box
                sx={{
                  mt: 3.5,
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "text.primary" }}>
                    Monthly Budget Utilization
                  </Typography>
                  <Chip
                    label={`${percentOfBudget}% used`}
                    size="small"
                    color={budget.remaining < 0 ? "error" : percentOfBudget > 75 ? "warning" : "success"}
                    sx={{ fontWeight: 700, height: 22 }}
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={percentOfBudget}
                  color={budget.remaining < 0 ? "error" : percentOfBudget > 75 ? "warning" : "success"}
                  sx={{ height: 8, borderRadius: 4, bgcolor: "#e2e8f0" }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Spent: {currency.format(budget.spent)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Total: {currency.format(budget.amount)}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Card: Recent Expenses */}
        <Card sx={{ borderRadius: "18px", border: "1px solid #e2e8f0", bgcolor: "#fff", p: 1 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Transactions
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Latest expenses recorded this month
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/expenses"
                size="small"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                sx={{ fontWeight: 600 }}
              >
                View all
              </Button>
            </Box>

            {expenses.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">No recent activity found.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {expenses.slice(0, 6).map((ex) => (
                  <Box
                    key={ex._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: "12px",
                      border: "1px solid #f1f5f9",
                      bgcolor: "#ffffff",
                      transition: "all 0.15s ease-in-out",
                      "&:hover": {
                        bgcolor: "#f8fafc",
                        borderColor: "#e2e8f0",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "10px",
                          bgcolor: "rgba(79, 70, 229, 0.08)",
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {paymentIcon(ex.paymentMethod)}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                          {ex.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {new Date(ex.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "divider" }}>•</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "capitalize" }}>
                            {ex.paymentMethod.replace("_", " ")}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="body1" sx={{ fontWeight: 700, color: "error.main" }}>
                      -{currency.format(ex.amount)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
