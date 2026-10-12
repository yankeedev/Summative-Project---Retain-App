import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  createCategory,
  deleteCategory,
  listCategories,
  listExpenses,
  updateCategory,
} from "../services/mockApi";
import type { Category, Expense, ExpenseFilters } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// fetch everything so the admin can see totals across all expenses
const ALL_FILTERS: ExpenseFilters = {
  search: "",
  category: "all",
  paymentMethod: "all",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  order: "desc",
  page: 1,
  limit: 200,
};

export default function Admin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // add/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const [cats, expensePage] = await Promise.all([
        listCategories(),
        listExpenses(ALL_FILTERS),
      ]);
      setCategories(cats);
      setExpenses(expensePage.data);
    } catch {
      setError("Could not load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const totalAmount = expenses.reduce((sum, ex) => sum + ex.amount, 0);
  const average = expenses.length > 0 ? totalAmount / expenses.length : 0;

  // spending grouped by category, biggest first
  const perCategory = useMemo(() => {
    const map = new Map<string, { catId: string; name: string; count: number; total: number }>();
    for (const ex of expenses) {
      const catId = typeof ex.category === "string" ? ex.category : ex.category._id;
      const catName =
        typeof ex.category === "string"
          ? (categories.find((c) => c._id === catId)?.name ?? "Other")
          : ex.category.name;
      const cur = map.get(catId) ?? { catId, name: catName, count: 0, total: 0 };
      cur.count += 1;
      cur.total += ex.amount;
      map.set(catId, cur);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [expenses, categories]);

  const richest = perCategory[0]?.total ?? 0;

  function openCreate(): void {
    setEditing(null);
    setNameInput("");
    setDialogError(null);
    setDialogOpen(true);
  }

  function openEdit(category: Category): void {
    setEditing(category);
    setNameInput(category.name);
    setDialogError(null);
    setDialogOpen(true);
  }

  async function handleSaveCategory(): Promise<void> {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setDialogError("Name is required");
      return;
    }
    setSaving(true);
    setDialogError(null);
    try {
      if (editing) await updateCategory(editing._id, trimmed);
      else await createCategory(trimmed);
      await load();
      setDialogOpen(false);
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : "Could not save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category): Promise<void> {
    if (!window.confirm(`Delete "${category.name}"?`)) return;
    try {
      await deleteCategory(category._id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category");
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Admin panel
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add category
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {loading && <Alert severity="info" sx={{ mt: 2 }}>Loading...</Alert>}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 2,
          my: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Transactions</Typography>
            <Typography variant="h6">{expenses.length}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Total amount</Typography>
            <Typography variant="h6">{currency.format(totalAmount)}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Average expense</Typography>
            <Typography variant="h6">
              {expenses.length > 0 ? currency.format(average) : "—"}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" color="text.secondary">Categories</Typography>
            <Typography variant="h6">{categories.length}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { md: "1fr 1fr" }, gap: 3 }}>
        {/* spending by category */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Category insights</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {perCategory.map((c) => (
                    <TableRow key={c.catId}>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <span>{c.name}</span>
                          <LinearProgress
                            variant="determinate"
                            value={richest > 0 ? Math.round((c.total / richest) * 100) : 0}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">{c.count}</TableCell>
                      <TableCell align="right">{currency.format(c.total)}</TableCell>
                    </TableRow>
                  ))}
                  {perCategory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" color="text.secondary">
                        No expenses yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* category management */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Categories</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell>
                        {category.name}
                        {category.isDefault && " (default)"}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(category)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={category.isDefault ? "Default categories cannot be deleted" : "Delete"}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={category.isDefault}
                              onClick={() => handleDelete(category)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <TextField
            label="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}