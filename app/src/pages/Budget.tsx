import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { getBudget, upsertBudget } from "../services/mockApi";
import type { Budget } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// MUI chip colors
const STATUS_META: Record<
  Budget["status"],
  { label: string; color: "success" | "warning" | "error"; bar: "success" | "warning" | "error" }
> = {
  within:     { label: "Within budget",  color: "success", bar: "success" },
  approaching:{ label: "Approaching limit", color: "warning", bar: "warning" },
  over:       { label: "Over budget",    color: "error", bar: "error" },
};

export default function Budget() {
  const { user } = useAuth();          // will drive ownership on the real backend
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [budget, setBudget] = useState<Budget | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(): Promise<void> {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getBudget(user._id, month);
      setBudget(result);
      setAmountInput(result ? String(result.amount) : "");
    } catch {
      setError("Could not load budget");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user, month]);

  async function handleSave(): Promise<void> {
    const value = Number(amountInput);
    if (!user || !amountInput || Number.isNaN(value) || value <= 0) return;
    setError(null);
    try {
      setBudget(await upsertBudget(user._id, month, value));
      setAmountInput(String(value));
    } catch {
      setError("Could not save budget");
    }
  }

  // % spent
  const percent = budget && budget.amount > 0
    ? Math.min(100, Math.round((budget.spent / budget.amount) * 100))
    : 0;

  return (
    <Paper sx={{ p: 3, maxWidth: 560, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>Budget</Typography>

      {/* month selector */}
      <TextField
        label="Month"
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading...</Alert>}

      <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          label="Monthly budget"
          type="number"
          slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSave}>
          {budget ? "Update" : "Set budget"}
        </Button>
      </Box>

      {/* summary-card*/}
      {budget ? (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">{month}</Typography>
              <Chip
                label={STATUS_META[budget.status].label}
                color={STATUS_META[budget.status].color}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 4, my: 2 }}>
              <div>
                <Typography variant="body2" color="text.secondary">Budget</Typography>
                <Typography variant="h6">{currency.format(budget.amount)}</Typography>
              </div>
              <div>
                <Typography variant="body2" color="text.secondary">Spent</Typography>
                <Typography variant="h6">{currency.format(budget.spent)}</Typography>
              </div>
              <div>
                <Typography variant="body2" color="text.secondary">Remaining</Typography>
                <Typography variant="h6" color={STATUS_META[budget.status].bar === "error" ? "error.main" : "inherit"}>
                  {currency.format(budget.remaining)}
                </Typography>
              </div>
            </Box>
            {/* progress indicator[good=green],warning[ember],error[red]*/}
            <LinearProgress
              variant="determinate"
              value={percent}
              color={STATUS_META[budget.status].bar}
              sx={{ height: 10, borderRadius: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {percent}% of budget used
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography color="text.secondary">
          No budget set for this month yet.
        </Typography>
      )}
    </Paper>
  );
}