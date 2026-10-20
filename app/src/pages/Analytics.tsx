import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { getDashboard, listExpenses } from "../services/endpoints";
import type { DashboardSummary, Expense, ExpenseFilters, PaymentMethod } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const CATEGORY_COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#3b82f6",
  "#64748b",
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank transfer",
  other: "Other",
};

const PAYMENT_COLORS: Record<PaymentMethod, string> = {
  cash: "#10b981",
  card: "#4f46e5",
  bank_transfer: "#06b6d4",
  other: "#94a3b8",
};

function lastMonths(anchor: string, count: number): string[] {
  const [year, month] = anchor.split("-").map(Number);
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(year, month - 1 - i, 1));
    months.push(
      `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
    );
  }
  return months;
}

function monthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: "short",
  });
}

function categoryName(expense: Expense): string {
  const category = expense.category;
  if (!category || typeof category === "string") return "Uncategorized";
  return category.name;
}

interface Slice {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const size = 180;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (value: number) => (total > 0 ? (value / total) * circumference : 0);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
      <Box sx={{ position: "relative", width: size, height: size }}>
        <Box component="svg" viewBox={`0 0 ${size} ${size}`} sx={{ width: size, height: size }}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={stroke}
            />
            {slices.map((slice, index) => {
              const length = arcLength(slice.value);
              const offset = slices
                .slice(0, index)
                .reduce((sum, previous) => sum + arcLength(previous.value), 0);
              return (
                <circle
                  key={slice.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                >
                  <title>{`${slice.label}: ${currency.format(slice.value)}`}</title>
                </circle>
              );
            })}
          </g>
        </Box>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Total
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {currency.format(total)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 200, flex: 1 }}>
        {slices.map((slice) => (
          <Box key={slice.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: slice.color }} />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {slice.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currency.format(slice.value)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", minWidth: 40, textAlign: "right" }}>
              {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function TrendBars({ bars }: { bars: { label: string; value: number }[] }) {
  const max = Math.max(...bars.map((bar) => bar.value), 1);
  return (
    <Box sx={{ pt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, height: 180 }}>
        {bars.map((bar) => (
          <Box
            key={bar.label}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
              {currency.format(bar.value)}
            </Typography>
            <Tooltip title={`${bar.label}: ${currency.format(bar.value)}`}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 56,
                  height: Math.max(4, (bar.value / max) * 150),
                  borderRadius: "8px 8px 0 0",
                  background: "linear-gradient(180deg, #6366f1, #4f46e5)",
                  transition: "height 0.4s ease-in-out",
                  "&:hover": { background: "linear-gradient(180deg, #818cf8, #6366f1)" },
                }}
              />
            </Tooltip>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        {bars.map((bar) => (
          <Typography
            key={bar.label}
            variant="caption"
            sx={{ flex: 1, textAlign: "center", color: "text.secondary", fontWeight: 600 }}
          >
            {bar.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<{ label: string; value: number }[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const months = lastMonths(month, 6);
        const filters: ExpenseFilters = {
          search: "",
          category: "all",
          paymentMethod: "all",
          dateFrom: `${month}-01`,
          dateTo: `${month}-31`,
          minAmount: "",
          maxAmount: "",
          sortBy: "amount",
          order: "desc",
          page: 1,
          limit: 100,
        };
        const [summaries, page] = await Promise.all([
          Promise.all(months.map((m) => getDashboard(m))),
          listExpenses(filters),
        ]);
        if (cancelled) return;
        setSummary(summaries[summaries.length - 1]);
        setTrend(
          months.map((m, index) => ({ label: monthLabel(m), value: summaries[index].totalSpent }))
        );
        setExpenses(page.data);
      } catch {
        if (!cancelled) setError("Could not load analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, month]);

  const byCategory = summary?.byCategory ?? [];
  const categorySlices: Slice[] = byCategory.map((cat, index) => ({
    label: cat.name,
    value: cat.total,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const byPayment = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.paymentMethod] = (acc[expense.paymentMethod] ?? 0) + expense.amount;
    return acc;
  }, {});
  const paymentRows = (Object.keys(PAYMENT_LABELS) as PaymentMethod[])
    .map((method) => ({ method, total: byPayment[method] ?? 0 }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);
  const paymentMax = Math.max(...paymentRows.map((row) => row.total), 1);
  const paymentTotal = paymentRows.reduce((sum, row) => sum + row.total, 0);

  const topExpenses = expenses.slice(0, 5);
  const topCategory = byCategory[0];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={44} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
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
          <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "-0.03em", mb: 0.5 }}>
            Analytics
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Charts generated from the expenses you record.
          </Typography>
        </Box>
        <TextField
          label="Month"
          type="month"
          size="small"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ bgcolor: "background.paper", borderRadius: "10px" }}
        />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* KPI cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2.5,
        }}
      >
        {[
          { label: "Total spent", value: currency.format(summary?.totalSpent ?? 0), hint: "In selected month" },
          { label: "Transactions", value: String(summary?.count ?? 0), hint: "Expenses recorded" },
          { label: "Average", value: currency.format(summary?.avgAmount ?? 0), hint: "Per transaction" },
          { label: "Top category", value: topCategory?.name ?? "—", hint: topCategory ? currency.format(topCategory.total) : "No data" },
        ].map((kpi) => (
          <Card
            key={kpi.label}
            sx={{
              p: 0.5,
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px -4px rgba(79, 70, 229, 0.12)" },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                {kpi.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.02em", mb: 0.5 }}>
                {kpi.value}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {kpi.hint}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Trend + category split */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.2fr 1fr" }, gap: 3 }}>
        <Card sx={{ borderRadius: "18px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Monthly spending
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Last 6 months of recorded expenses
                </Typography>
              </Box>
              <Chip label="6 months" size="small" sx={{ bgcolor: "action.hover", fontWeight: 600 }} />
            </Box>
            <TrendBars bars={trend} />
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: "18px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Spending by category
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Share of {month} spending
                </Typography>
              </Box>
            </Box>
            {categorySlices.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">No expenses for this month yet.</Typography>
              </Box>
            ) : (
              <DonutChart slices={categorySlices} />
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Payment methods + top expenses */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
        <Card sx={{ borderRadius: "18px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Payment methods
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              How you paid in {month}
            </Typography>
            {paymentRows.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">No payments recorded.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25, mt: 2.5 }}>
                {paymentRows.map((row) => (
                  <Box key={row.method}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {PAYMENT_LABELS[row.method]}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography variant="body2">{currency.format(row.total)}</Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", minWidth: 36, textAlign: "right" }}
                        >
                          {paymentTotal > 0 ? Math.round((row.total / paymentTotal) * 100) : 0}%
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ width: "100%", height: 8, bgcolor: "action.hover", borderRadius: 4, overflow: "hidden" }}>
                      <Box
                        sx={{
                          width: `${Math.round((row.total / paymentMax) * 100)}%`,
                          height: "100%",
                          bgcolor: PAYMENT_COLORS[row.method],
                          borderRadius: 4,
                          transition: "width 0.5s ease-in-out",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: "18px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              Largest expenses
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Top 5 in {month}
            </Typography>
            {topExpenses.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">No expenses recorded.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mt: 2 }}>
                {topExpenses.map((expense, index) => (
                  <Box
                    key={expense._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "8px",
                        bgcolor: "rgba(79, 70, 229, 0.08)",
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {expense.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {new Date(expense.date).toLocaleDateString()} ·{" "}
                        {categoryName(expense)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "error.main" }}>
                      -{currency.format(expense.amount)}
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
